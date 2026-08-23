import pandas as pd
import numpy as np
import os

def profile_dataset(data_path, out_md_path, out_txt_path):
    df = pd.read_csv(data_path, parse_dates=['Date'])
    
    with open(out_md_path, 'w', encoding='utf-8') as f:
        f.write("# Phase 3 Dataset Profile\n\n")
        
        # 1. Dataset dimensions
        f.write("## 1. Dataset Dimensions\n")
        f.write(f"- **Rows:** {len(df)}\n")
        f.write(f"- **Columns:** {len(df.columns)}\n")
        f.write(f"- **Columns List:** {', '.join(df.columns)}\n\n")
        
        # 2. Actual date range & 3. Years
        f.write("## 2. Date Range & Years\n")
        f.write(f"- **Earliest Date:** {df['Date'].min().date()}\n")
        f.write(f"- **Latest Date:** {df['Date'].max().date()}\n")
        f.write(f"- **Unique Dates:** {df['Date'].nunique()}\n")
        years = sorted(df['Date'].dt.year.unique())
        f.write(f"- **Unique Years:** {len(years)}\n")
        f.write(f"- **Years Represented:** {years}\n\n")
        
        # 4. Train/validation/test ranges
        f.write("## 3. Train/Validation/Test Splits\n")
        for s in ['train', 'val', 'test']:
            subset = df[df['split'] == s]
            if len(subset) > 0:
                f.write(f"- **{s.upper()}:** {subset['Date'].min().date()} to {subset['Date'].max().date()} ({len(subset)} records)\n")
            else:
                f.write(f"- **{s.upper()}:** 0 records\n")
        
        train_max = df[df['split'] == 'train']['Date'].max()
        val_min = df[df['split'] == 'val']['Date'].min()
        val_max = df[df['split'] == 'val']['Date'].max()
        test_min = df[df['split'] == 'test']['Date'].min()
        chronological_valid = (train_max < val_min) and (val_max < test_min)
        f.write(f"\n- **Chronological Split Valid:** {chronological_valid}\n\n")
        
        # 5. Disease distribution
        f.write("## 4. Disease Distribution\n")
        diseases = df['Disease'].unique()
        f.write(f"- **Unique Diseases:** {len(diseases)}\n")
        f.write(f"- **Names:** {', '.join(diseases)}\n\n")
        f.write("| Disease | Records | Total Cases | Mean Cases | Median Cases | Max Cases | Std Cases | Zero-Case % |\n")
        f.write("|---|---|---|---|---|---|---|---|\n")
        for d in sorted(diseases):
            ddf = df[df['Disease'] == d]
            recs = len(ddf)
            total = ddf['Cases'].sum()
            mean = ddf['Cases'].mean()
            median = ddf['Cases'].median()
            cmax = ddf['Cases'].max()
            cstd = ddf['Cases'].std()
            zero_pct = (ddf['Cases'] == 0).sum() / recs * 100
            f.write(f"| {d} | {recs} | {total:.0f} | {mean:.2f} | {median} | {cmax} | {cstd:.2f} | {zero_pct:.2f}% |\n")
        f.write("\n")
        
        # 6. Geographic distribution
        f.write("## 5. Geographic Distribution\n")
        f.write(f"- **Unique States:** {df['State'].nunique()}\n")
        f.write(f"- **Unique Districts:** {df['District'].nunique()}\n")
        f.write(f"- **State+District Combos:** {df.groupby(['State', 'District']).ngroups}\n")
        f.write(f"- **Latitude:** Min {df['Latitude'].min():.4f}, Max {df['Latitude'].max():.4f}\n")
        f.write(f"- **Longitude:** Min {df['Longitude'].min():.4f}, Max {df['Longitude'].max():.4f}\n\n")
        
        # 7 & 8. Time-series statistics & gaps
        f.write("## 6. Time-Series Structure & Gaps\n")
        groups = df.groupby(['State', 'District', 'Disease'])
        f.write(f"- **Number of TS Groups:** {groups.ngroups}\n")
        counts = groups.size()
        f.write(f"- **Observations per group:** Min {counts.min()}, Max {counts.max()}, Median {counts.median()}, Mean {counts.mean():.2f}\n")
        
        gaps_found = 0
        total_gaps = 0
        max_gap = pd.Timedelta(0)
        gap_lengths = []
        for name, group in groups:
            dates = group['Date'].sort_values()
            diffs = dates.diff().dropna()
            gaps = diffs[diffs > pd.Timedelta(days=7)]
            if len(gaps) > 0:
                gaps_found += 1
                total_gaps += len(gaps)
                max_gap = max(max_gap, gaps.max())
                gap_lengths.extend(gaps.dt.days.tolist())
                
        f.write(f"- **Series with gaps > 1 week:** {gaps_found}\n")
        f.write(f"- **Total gaps:** {total_gaps}\n")
        f.write(f"- **Largest gap:** {max_gap.days if max_gap.days > 0 else 0} days\n\n")
        
        # 9 & 10. Case & Change Distribution
        f.write("## 7. Global Case & Change Distribution\n")
        f.write("### Cases\n")
        cases = df['Cases']
        f.write(f"- Min: {cases.min()}, Max: {cases.max()}, Mean: {cases.mean():.2f}, Median: {cases.median()}, Std: {cases.std():.2f}\n")
        f.write(f"- Zero-case records: {(cases == 0).sum()} ({(cases == 0).sum() / len(cases) * 100:.2f}%)\n")
        
        change_cols = ['cases_change_1w', 'cases_change_2w', 'cases_growth_rate']
        f.write("### Changes\n")
        for col in change_cols:
            c = df[col]
            f.write(f"- **{col}:** Min {c.min():.2f}, Max {c.max():.2f}, Mean {c.mean():.2f}, Median {c.median():.2f}, Std {c.std():.2f}, Missing: {c.isna().sum()}, Infinite: {np.isinf(c).sum()}\n")
        f.write("\n")
        
        # 11. Rolling Features
        f.write("## 8. Rolling Features\n")
        roll_cols = ['cases_mean_4', 'cases_mean_8', 'cases_std_4', 'cases_std_8']
        for col in roll_cols:
            c = df[col]
            f.write(f"- **{col}:** Missing {c.isna().sum()}, Valid Range: [{c.min():.2f}, {c.max():.2f}]\n")
        f.write("\n")
        
        # 12. Environmental
        f.write("## 9. Environmental Variables\n")
        env_cols = ['Surface Temperature', 'Precipitation', 'LAI']
        for col in env_cols:
            c = df[col]
            f.write(f"- **{col}:** Min {c.min():.2f}, Max {c.max():.2f}, Mean {c.mean():.2f}, Median {c.median():.2f}, Std {c.std():.2f}, Missing: {c.isna().sum()}\n")
            
        miss_flags = ['Surface Temperature_missing', 'Precipitation_missing', 'LAI_missing']
        for flag in miss_flags:
            f.write(f"- **{flag}** count: {df[flag].sum()}\n")
        f.write("\n")
        
        # 13. Synthetic Symptom Validation
        f.write("## 10. Synthetic Symptom Validation\n")
        symp_counts = [c for c in df.columns if '_cases' in c and c not in ['Cases', 'cases_mean_4', 'cases_mean_8', 'cases_std_4', 'cases_std_8', 'cases_lag_1', 'cases_lag_2', 'cases_lag_3', 'cases_lag_4', 'cases_change_1w', 'cases_change_2w', 'cases_growth_rate']]
        symp_rates = [c for c in df.columns if '_rate' in c and c != 'cases_growth_rate']
        
        f.write(f"- **Symptom Count Columns:** {len(symp_counts)}\n")
        f.write(f"- **Symptom Rate Columns:** {len(symp_rates)}\n")
        
        count_valid = True
        rate_valid = True
        for sc in symp_counts:
            if not ((df[sc] >= 0).all() and (df[sc] <= df['Cases']).all()):
                count_valid = False
        for sr in symp_rates:
            if not ((df[sr] >= 0.0).all() and (df[sr] <= 1.0).all()):
                rate_valid = False
                
        f.write(f"- **Counts valid (0 <= count <= Cases):** {count_valid}\n")
        f.write(f"- **Rates valid (0 <= rate <= 1):** {rate_valid}\n\n")
        
        # 14. Data Consistency
        f.write("## 11. Data Consistency Checks\n")
        f.write(f"1. Expected Row Count: {len(df) == 8090}\n")
        f.write(f"2. No duplicate primary keys: {not df.duplicated(subset=['State', 'District', 'Disease', 'Date']).any()}\n")
        f.write(f"3. Non-negative Cases: {(df['Cases'] >= 0).all()}\n")
        f.write(f"4. Non-negative Deaths: {(df['Deaths'] >= 0).all()}\n")
        f.write(f"5. Valid Coordinates: {(df['Latitude'].between(8,38)).all() and (df['Longitude'].between(68,98)).all()}\n")
        
        canonical_diseases = {'Dengue', 'Chikungunya', 'Malaria', 'Cholera', 'Dengue & Chikungunya', 'Dengue & Malaria', 'Acute Diarrhoeal Disease', 'PUO', 'AES'}
        f.write(f"6. Valid Canonical Diseases: {set(df['Disease'].unique()).issubset(canonical_diseases)}\n")
        f.write(f"7. Valid Dates: {df['Date'].notna().all()}\n")
        f.write(f"8. Valid Splits: {set(df['split'].unique()).issubset({'train', 'val', 'test'})}\n")
        f.write(f"9. No infinite numerical values (cases): {not np.isinf(df['Cases']).any()}\n")
        
    # Also write a small summary to txt
    with open(out_txt_path, 'w', encoding='utf-8') as f:
        f.write(f"Profile generated successfully for {len(df)} rows.")

if __name__ == '__main__':
    data_path = r'c:\BRAIN-STORM\warning-re\outbreak-detection\data\ml_ready_dataset.csv'
    out_md = r'c:\BRAIN-STORM\warning-re\outbreak-detection\agent_artifacts\phase3_dataset_profile.md'
    out_txt = r'c:\BRAIN-STORM\warning-re\outbreak-detection\agent_artifacts\inspection_report.txt'
    profile_dataset(data_path, out_md, out_txt)
    print("Profiling complete.")
