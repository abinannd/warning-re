import pandas as pd
import numpy as np
import os

def load_data(data_dir):
    clean_path = os.path.join(data_dir, 'cleaned_weekly_data.csv')
    synth_path = os.path.join(data_dir, 'symptom_data.csv')
    
    df = pd.read_csv(clean_path)
    df_symptoms = pd.read_csv(synth_path)
    
    # Safely strip 'synthetic_' from column names in case the CSV on disk is still locked and hasn't been updated
    df_symptoms.columns = [c.replace('synthetic_', '') for c in df_symptoms.columns]
    
    # Verify alignment
    keys = ['State', 'District', 'Disease', 'ISO_Year', 'ISO_Week']
    
    # Ensure they are sorted exactly the same
    df = df.sort_values(keys).reset_index(drop=True)
    df_symptoms = df_symptoms.sort_values(keys).reset_index(drop=True)
    
    assert df[keys].equals(df_symptoms[keys]), "Fatal: Primary dataset and symptom dataset keys do not align!"
    
    # Ensure Date is datetime
    df['Date'] = pd.to_datetime(df['Date'])
    
    return df, df_symptoms

def create_imputation_mappings(df):
    """
    Creates historical monthly means using strictly the training set data to avoid future leakage.
    Train period: < 2019-01-01
    """
    train_mask = df['Date'] < pd.to_datetime('2019-01-01')
    df_train = df[train_mask].copy()
    
    df_train['Month'] = df_train['Date'].dt.month
    
    env_cols = ['Surface Temperature', 'Precipitation', 'LAI']
    
    # District-level monthly means
    district_means = df_train.groupby(['State', 'District', 'Month'])[env_cols].mean().reset_index()
    
    # State-level monthly means (fallback)
    state_means = df_train.groupby(['State', 'Month'])[env_cols].mean().reset_index()
    
    # Global monthly means (final fallback)
    global_means = df_train.groupby('Month')[env_cols].mean().reset_index()
    
    return district_means, state_means, global_means

def impute_environmental_features(df, district_means, state_means, global_means):
    """
    Imputes environmental variables using ffill and historical training means.
    """
    env_cols = ['Surface Temperature', 'Precipitation', 'LAI']
    
    # Mark missing
    for col in env_cols:
        df[f'{col}_missing'] = df[col].isna().astype(int)
        
    df['Month'] = df['Date'].dt.month
    
    # 1. Forward Fill (max 4 weeks) grouped by location
    # Group by State, District (Disease doesn't affect environment)
    # We must sort by Date first
    df = df.sort_values(['State', 'District', 'Disease', 'Date'])
    for col in env_cols:
        df[col] = df.groupby(['State', 'District'])[col].ffill(limit=4)
        
    # 2. Historical Monthly Mean (District)
    df = df.merge(district_means, on=['State', 'District', 'Month'], suffixes=('', '_dist_mean'), how='left')
    for col in env_cols:
        df[col] = df[col].fillna(df[f'{col}_dist_mean'])
        
    # 3. Historical Monthly Mean (State)
    df = df.merge(state_means, on=['State', 'Month'], suffixes=('', '_state_mean'), how='left')
    for col in env_cols:
        df[col] = df[col].fillna(df[f'{col}_state_mean'])
        
    # 4. Historical Monthly Mean (Global)
    df = df.merge(global_means, on='Month', suffixes=('', '_global_mean'), how='left')
    for col in env_cols:
        df[col] = df[col].fillna(df[f'{col}_global_mean'])
        
    # Drop temp mean columns
    df = df.drop(columns=[c for c in df.columns if '_mean' in c])
    
    return df

def create_spatiotemporal_features(df):
    """
    Creates temporal lags, rolling statistics, and seasonal features using a strict 
    calendar-week methodology. Missing weeks are treated as 0 cases for calculation 
    purposes because the dataset's reporting structure omits dormant (zero-case) weeks.
    """
    df = df.sort_values(['State', 'District', 'Disease', 'Date']).reset_index(drop=True)
    
    # Seasonal
    df['year'] = df['Date'].dt.year
    df['month'] = df['Date'].dt.month
    df['week_of_year'] = df['ISO_Week']
    
    df['sin_week'] = np.sin(2 * np.pi * df['week_of_year'] / 52.0)
    df['cos_week'] = np.cos(2 * np.pi * df['week_of_year'] / 52.0)
    
    # Construct complete calendar for each group to calculate accurate lags and rolling windows
    def compute_calendar_features(group):
        group = group.set_index('Date').sort_index()
        if len(group) == 0:
            return group
        
        # Create a full weekly date range for this specific group's history
        full_idx = pd.date_range(start=group.index.min(), end=group.index.max(), freq='W-MON')
        
        # Reindex Cases and Deaths. Missing weeks indicate 0 reported cases/deaths.
        g_full = group[['Cases', 'Deaths']].reindex(full_idx, fill_value=0.0)
        
        # We also need environmental variables for lags, but we ffill them because they are continuous
        env = group[['Surface Temperature', 'Precipitation', 'LAI']].reindex(full_idx).ffill()
        g_full = pd.concat([g_full, env], axis=1)
        
        # Calculate strict calendar lags
        for lag in [1, 2, 3, 4]:
            g_full[f'cases_lag_{lag}'] = g_full['Cases'].shift(lag)
        for lag in [1, 2]:
            g_full[f'deaths_lag_{lag}'] = g_full['Deaths'].shift(lag)
            
        g_full['temp_lag_1'] = g_full['Surface Temperature'].shift(1)
        g_full['precip_lag_1'] = g_full['Precipitation'].shift(1)
        g_full['lai_lag_1'] = g_full['LAI'].shift(1)
        
        # Rolling windows on the calendar (must shift 1 first to prevent target leakage)
        shifted_cases = g_full['Cases'].shift(1)
        g_full['cases_mean_4'] = shifted_cases.rolling(window=4, min_periods=1).mean()
        g_full['cases_mean_8'] = shifted_cases.rolling(window=8, min_periods=1).mean()
        g_full['cases_std_4']  = shifted_cases.rolling(window=4, min_periods=2).std()
        g_full['cases_std_8']  = shifted_cases.rolling(window=8, min_periods=2).std()
        
        # Velocity
        g_full['cases_change_1w'] = g_full['Cases'] - g_full['cases_lag_1']
        g_full['cases_change_2w'] = g_full['cases_lag_1'] - g_full['cases_lag_2']
        g_full['cases_growth_rate'] = g_full['cases_change_1w'] / (g_full['cases_lag_1'] + 1)
        
        # Extract only the newly calculated features for the original reported dates
        features = g_full.loc[group.index].drop(columns=['Cases', 'Deaths', 'Surface Temperature', 'Precipitation', 'LAI'])
        return features

    # Apply the strict calendar computation to each time-series group
    features_df = df.groupby(['State', 'District', 'Disease']).apply(compute_calendar_features).reset_index()
    
    # Merge the features back into the original dataframe perfectly aligned by Date
    df = df.merge(features_df, on=['State', 'District', 'Disease', 'Date'], how='left')
    
    return df

def generate_ml_dataset(data_dir):
    print("Loading datasets...")
    df, df_symptoms = load_data(data_dir)
    
    print("Creating strictly historical imputation mappings...")
    dist_means, state_means, global_means = create_imputation_mappings(df)
    
    print("Imputing environmental features...")
    df = impute_environmental_features(df, dist_means, state_means, global_means)
    
    print("Generating spatiotemporal lag and rolling features...")
    df = create_spatiotemporal_features(df)
    
    # Chronological Split Assignment
    conditions = [
        (df['Date'] < pd.to_datetime('2019-01-01')),
        (df['Date'] >= pd.to_datetime('2019-01-01')) & (df['Date'] < pd.to_datetime('2021-01-01')),
        (df['Date'] >= pd.to_datetime('2021-01-01'))
    ]
    choices = ['train', 'val', 'test']
    df['split'] = np.select(conditions, choices, default='unknown')
    
    print("Merging synthetic symptom layer...")
    # Drop overlapping keys from symptoms before merge
    drop_keys = ['State', 'District', 'Disease', 'ISO_Year', 'ISO_Week', 'Cases', 'Deaths', 'Latitude', 'Longitude', 'Precipitation', 'Surface Temperature', 'LAI']
    cols_to_use = [c for c in df_symptoms.columns if c not in drop_keys]
    
    # Safe horizontal concat because we strictly aligned and sorted both dataframes in load_data
    df_final = pd.concat([df, df_symptoms[cols_to_use]], axis=1)
    
    output_path = os.path.join(data_dir, 'ml_ready_dataset.csv')
    temp_output_path = output_path.replace('.csv', '_temp.csv')
    df_final.to_csv(temp_output_path, index=False)
    try:
        import shutil
        shutil.move(temp_output_path, output_path)
    except Exception as e:
        print(f"Could not overwrite {output_path} (locked). Saved to {temp_output_path}.")
    
    print(f"Dataset generation complete. Saved to: {output_path}")
    print(f"Shape: {df_final.shape}")
    print("\nSplit Distribution:")
    print(df_final['split'].value_counts())
    
    return df_final

if __name__ == '__main__':
    data_dir = r'c:\BRAIN-STORM\warning-re\outbreak-detection\data'
    generate_ml_dataset(data_dir)
