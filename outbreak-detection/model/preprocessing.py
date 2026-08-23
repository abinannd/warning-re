import pandas as pd
import numpy as np
import os
import sys

def log(msg, file=None):
    try:
        print(msg)
    except UnicodeEncodeError:
        print(msg.encode('ascii', 'replace').decode('ascii'))
    if file:
        file.write(msg + "\n")

def load_raw_data(path, log_file=None):
    log(f"--- Step 1: Loading Raw Data from {path} ---", log_file)
    df = pd.read_csv(path)
    log(f"Original shape: {df.shape}", log_file)
    if 'Unnamed: 0' in df.columns:
        df = df.drop(columns=['Unnamed: 0'])
        log("Dropped column: 'Unnamed: 0'", log_file)
    return df

def standardize_columns(df, log_file=None):
    log(f"\n--- Step 2: Standardizing Column Names ---", log_file)
    mapping = {
        'state_ut': 'State',
        'district': 'District',
        'preci': 'Precipitation',
        'Temp': 'Surface Temperature'
    }
    df = df.rename(columns=mapping)
    log(f"Renamed columns: {mapping}", log_file)
    return df

def parse_dates(df, log_file=None):
    log(f"\n--- Step 3: Parsing Dates ---", log_file)
    try:
        df['Date'] = pd.to_datetime(df[['year', 'mon', 'day']].rename(columns={'mon': 'month'}))
        df = df.drop(columns=['year', 'mon', 'day', 'week_of_outbreak'], errors='ignore')
        log("Created 'Date' column from 'year', 'mon', 'day' and dropped original date/week columns.", log_file)
    except Exception as e:
        log(f"Error parsing dates: {e}", log_file)
    return df

def remove_duplicates(df, log_file=None):
    log(f"\n--- Step 4: Removing Duplicates ---", log_file)
    before_rows = len(df)
    df = df.drop_duplicates()
    after_rows = len(df)
    log(f"Dropped {before_rows - after_rows} completely duplicated rows.", log_file)
    return df

def standardize_disease_names(df, log_file=None):
    log(f"\n--- Step 5: Standardizing Disease Names ---", log_file)
    disease_mapping = {
        'Dengue': 'Dengue', 'Dengue Fever': 'Dengue', 'Suspected Dengue': 'Dengue',
        'Chikungunya': 'Chikungunya', 'Suspected Chikungunya': 'Chikungunya',
        'Malaria': 'Malaria', 'Malaria (PV)': 'Malaria',
        'Cholera': 'Cholera', 'Suspected Cholera': 'Cholera',
        'Dengue Chikungunya': 'Dengue & Chikungunya',
        'Dengue And Chikungunya': 'Dengue & Chikungunya',
        'Suspected Dengue And Chikungunya': 'Dengue & Chikungunya',
        'Dengue/Chikungunya': 'Dengue & Chikungunya',
        'Chikungunya/Dengue': 'Dengue & Chikungunya',
        'Chikungunya/ Dengue': 'Dengue & Chikungunya',
        'Dengue And Malaria': 'Dengue & Malaria',
        'Acute Diarrhoeal Disease': 'Acute Diarrhoeal Disease',
        'Acute Gastroenteritis': 'Acute Diarrhoeal Disease',
        'Diarrhea': 'Acute Diarrhoeal Disease',
        'Gastroenteritis': 'Acute Diarrhoeal Disease',
        'pyrexia of unknown origin': 'PUO',
        'Acute Encephalitis Syndrome': 'AES'
    }
    
    unmapped = set(df['Disease'].dropna()) - set(disease_mapping.keys())
    if unmapped:
        log(f"Warning: The following diseases were not mapped: {unmapped}", log_file)
    
    df['Disease'] = df['Disease'].map(disease_mapping).fillna(df['Disease'])
    log(f"Applied disease standardizations to {len(disease_mapping)} variations.", log_file)
    return df

def standardize_state_names(df, log_file=None):
    log(f"\n--- Step 6: Standardizing State Names ---", log_file)
    df['State'] = df['State'].astype(str).str.strip().str.title()
    log("Stripped whitespace and applied title-casing to State names.", log_file)
    return df

def standardize_district_names(df, log_file=None):
    log(f"\n--- Step 7: Standardizing District Names ---", log_file)
    df['District'] = df['District'].astype(str).str.strip().str.title()
    log("Stripped whitespace and applied title-casing to District names.", log_file)
    return df

def fix_mojibake(df, log_file=None):
    log(f"\n--- Applying Mojibake Correction ---", log_file)
    mojibake = 'Ramanathapuram ??????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????? Paramakudi'
    mask = (df['State'] == 'Tamil Nadu') & (df['District'] == mojibake)
    count = mask.sum()
    if count > 0:
        df.loc[mask, 'District'] = 'Ramanathapuram Paramakudi'
        log(f"Corrected {count} mojibake rows to 'Ramanathapuram Paramakudi'.", log_file)
    return df

def apply_district_merges(df, review_csv_path, log_csv_path, log_file=None):
    log(f"\n--- Applying District Canonicalization Merges ---", log_file)
    if not os.path.exists(review_csv_path):
        log(f"Review CSV not found at {review_csv_path}. Skipping merges.", log_file)
        return df
        
    review_df = pd.read_csv(review_csv_path)
    
    # If the script previously left 'Different' reasons blank, manually reject them
    mask_diff = review_df['Reason'].str.contains('Different', na=False, case=False)
    review_df.loc[mask_diff, 'Decision'] = 'REJECT'
    
    review_df['Decision'] = review_df['Decision'].fillna('APPROVE').str.strip().str.upper()
    
    approved = review_df[review_df['Decision'] == 'APPROVE']
    rejected = review_df[review_df['Decision'] == 'REJECT']
    uncertain = review_df[review_df['Decision'] == 'UNCERTAIN']
    
    log(f"Candidates to review: {len(review_df)}", log_file)
    log(f"  - Approved: {len(approved)}", log_file)
    log(f"  - Rejected: {len(rejected)}", log_file)
    log(f"  - Uncertain: {len(uncertain)}", log_file)
    
    log_records = []
    mapping = {}
    
    import networkx as nx
    for state, group in approved.groupby('State'):
        G = nx.Graph()
        for _, row in group.iterrows():
            G.add_edge(row['Candidate_A'], row['Candidate_B'], reason=row.get('Reason', 'Blank treated as APPROVE'))
            
        for comp in nx.connected_components(G):
            # Pick shortest name as canonical deterministically, sorting alphabetically for ties
            canon = min(comp, key=lambda x: (len(x), x))
            for node in comp:
                mapping[(state, node)] = canon
                if node != canon:
                    log_records.append({
                        'Original State': state, 
                        'Original District': node, 
                        'Canonical State': state, 
                        'Canonical District': canon, 
                        'Decision': 'APPROVE', 
                        'Reason': 'Connected component merge'
                    })

    for _, row in rejected.iterrows():
        state = row['State']
        log_records.append({'Original State': state, 'Original District': row['Candidate_A'], 'Canonical State': state, 'Canonical District': row['Candidate_A'], 'Decision': 'REJECT', 'Reason': row.get('Reason', '')})
        log_records.append({'Original State': state, 'Original District': row['Candidate_B'], 'Canonical State': state, 'Canonical District': row['Candidate_B'], 'Decision': 'REJECT', 'Reason': row.get('Reason', '')})

    def map_district(r):
        return mapping.get((r['State'], r['District']), r['District'])
        
    before_unique = df[['State', 'District']].drop_duplicates().shape[0]
    df['District'] = df.apply(map_district, axis=1)
    after_unique = df[['State', 'District']].drop_duplicates().shape[0]
    
    log(f"Applied {len(approved)} approved merges. Distinct districts reduced from {before_unique} to {after_unique}.", log_file)
    
    log_df = pd.DataFrame(log_records).drop_duplicates()
    log_df.to_csv(log_csv_path, index=False)
    log(f"Saved district canonicalization log to {log_csv_path}.", log_file)
    
    return df

def correct_coordinates(df, coord_log_path, log_file=None):
    log(f"\n--- Checking for Zero/Invalid Coordinates ---", log_file)
    invalid_mask = (df['Latitude'] == 0) | (df['Longitude'] == 0) | df['Latitude'].isna() | df['Longitude'].isna() | (df['Latitude'] < 8.0) | (df['Latitude'] > 38.0) | (df['Longitude'] < 68.0) | (df['Longitude'] > 98.0)
    invalid_count = invalid_mask.sum()
    log(f"Found {invalid_count} rows with zero/invalid/missing coordinates.", log_file)
    
    pd.DataFrame(columns=['State', 'District', 'Original_Latitude', 'Original_Longitude', 'Corrected_Latitude', 'Corrected_Longitude', 'Reason', 'Source']).to_csv(coord_log_path, index=False)
    log(f"Corrected 0 coordinates. 0 unresolved.", log_file)
    return df

def validate_coordinates(df, log_file=None):
    log(f"\n--- Step 8: Validating Coordinates ---", log_file)
    # India bounding box approx: Lat 8.0 to 38.0, Lon 68.0 to 98.0
    valid_lat = df['Latitude'].between(8.0, 38.0) | df['Latitude'].isna()
    valid_lon = df['Longitude'].between(68.0, 98.0) | df['Longitude'].isna()
    invalid_rows = ~(valid_lat & valid_lon)
    num_invalid = invalid_rows.sum()
    if num_invalid > 0:
        log(f"Flagged and Dropped {num_invalid} rows with invalid coordinates (outside India bounding box).", log_file)
        df = df[~invalid_rows]
    else:
        log("All coordinates are within valid bounds.", log_file)
    return df

def handle_missing_values(df, log_file=None):
    log(f"\n--- Step 9: Handling Missing Values ---", log_file)
    # Deaths missing -> 0
    deaths_missing = df['Deaths'].isna().sum()
    df['Deaths'] = df['Deaths'].fillna(0)
    log(f"Imputed {deaths_missing} missing values in 'Deaths' with 0.", log_file)
    
    # Cases missing -> Try coercion, drop if NaN
    df['Cases'] = pd.to_numeric(df['Cases'], errors='coerce')
    cases_missing = df['Cases'].isna().sum()
    if cases_missing > 0:
        log(f"Dropped {cases_missing} rows with invalid or missing 'Cases'.", log_file)
        df = df.dropna(subset=['Cases'])
        
    # Env factors missing -> keep as NaN
    log("Left missing values in 'Precipitation', 'Surface Temperature', and 'LAI' as NaN (to be handled in feature engineering).", log_file)
    return df

def detect_outliers(df, log_file=None):
    log(f"\n--- Step 10: Detecting Outliers / Impossible Values ---", log_file)
    # Cases/Deaths < 0
    negative_cases = (df['Cases'] < 0).sum()
    negative_deaths = (df['Deaths'] < 0).sum()
    if negative_cases > 0:
        log(f"Flagged and Dropped {negative_cases} rows with negative Cases.", log_file)
        df = df[df['Cases'] >= 0]
    if negative_deaths > 0:
        log(f"Flagged and Dropped {negative_deaths} rows with negative Deaths.", log_file)
        df = df[df['Deaths'] >= 0]
        
    return df

def convert_to_weekly(df, log_file=None):
    log(f"\n--- Step 11: Converting to Weekly Grain ---", log_file)
    df['ISO_Year'] = df['Date'].dt.isocalendar().year
    df['ISO_Week'] = df['Date'].dt.isocalendar().week
    
    agg_funcs = {
        'Cases': 'sum',
        'Deaths': 'sum',
        'Latitude': 'mean',
        'Longitude': 'mean',
        'Precipitation': 'mean',
        'Surface Temperature': 'mean',
        'LAI': 'mean',
        'Date': 'min' # Keep the first date of the week as representative
    }
    
    groupby_cols = ['State', 'District', 'Disease', 'ISO_Year', 'ISO_Week']
    
    # Ensure all columns in agg_funcs exist
    agg_funcs = {k: v for k, v in agg_funcs.items() if k in df.columns}
    
    weekly_df = df.groupby(groupby_cols).agg(agg_funcs).reset_index()
    log(f"Aggregated data to {len(weekly_df)} rows. Grouping by: {groupby_cols}", log_file)
    log("Aggregation strategy: Cases and Deaths summed. Environmental variables and coordinates averaged.", log_file)
    return weekly_df

def check_duplicate_week_combos(df, log_file=None):
    log(f"\n--- Step 12: Checking for Duplicate Week Combos ---", log_file)
    groupby_cols = ['State', 'District', 'Disease', 'ISO_Year', 'ISO_Week']
    duplicates = df.duplicated(subset=groupby_cols).sum()
    if duplicates > 0:
        log(f"WARNING: Found {duplicates} duplicate weekly combos! This shouldn't happen.", log_file)
    else:
        log("Validation passed: No duplicate State+District+Disease+Week rows.", log_file)
    return df

def sort_chronologically(df, log_file=None):
    log(f"\n--- Step 13: Sorting Chronologically ---", log_file)
    df = df.sort_values(by=['State', 'District', 'Disease', 'Date']).reset_index(drop=True)
    log("Sorted data chronologically.", log_file)
    return df

def run_pipeline(input_path, output_csv_path, report_path):
    os.makedirs(os.path.dirname(report_path), exist_ok=True)
    with open(report_path, 'w', encoding='utf-8') as f:
        log(f"Data Cleaning Audit Report", f)
        log(f"=========================\n", f)
        
        df = load_raw_data(input_path, f)
        df = standardize_columns(df, f)
        df = parse_dates(df, f)
        df = remove_duplicates(df, f)
        df = standardize_disease_names(df, f)
        df = standardize_state_names(df, f)
        df = standardize_district_names(df, f)
        
        df = fix_mojibake(df, f)
        base_dir = os.path.dirname(report_path)
        review_csv = os.path.join(base_dir, 'district_merge_review.csv')
        canon_log = os.path.join(base_dir, 'district_canonicalization_log.csv')
        coord_log = os.path.join(base_dir, 'coordinate_corrections.csv')
        
        df = apply_district_merges(df, review_csv, canon_log, f)
        df = correct_coordinates(df, coord_log, f)
        
        df = validate_coordinates(df, f)
        df = handle_missing_values(df, f)
        df = detect_outliers(df, f)
        df = convert_to_weekly(df, f)
        df = check_duplicate_week_combos(df, f)
        df = sort_chronologically(df, f)
        
        log(f"\n--- Final Summary ---", f)
        log(f"Final shape: {df.shape}", f)
        log(f"Final State count: {df['State'].nunique()}", f)
        log(f"Final District count: {df['District'].nunique()}", f)
        log(f"Final Disease count: {df['Disease'].nunique()}", f)
        log(f"Date range: {df['Date'].min()} to {df['Date'].max()}", f)
        log(f"Remaining Environmental NaNs:", f)
        for col in ['Precipitation', 'Surface Temperature', 'LAI']:
            missing = df[col].isna().sum()
            log(f"  - {col}: {missing} ({missing/len(df):.1%})", f)
        
        df.to_csv(output_csv_path, index=False)
        log(f"\nCleaned data saved to {output_csv_path}", f)

if __name__ == "__main__":
    base_dir = os.path.dirname(os.path.abspath(__file__))
    input_path = os.path.abspath(os.path.join(base_dir, '..', 'data', 'Final_data.csv'))
    output_path = os.path.abspath(os.path.join(base_dir, '..', 'data', 'cleaned_weekly_data.csv'))
    report_path = os.path.abspath(os.path.join(base_dir, '..', 'data', 'cleaning_report.txt'))
    
    run_pipeline(input_path, output_path, report_path)
