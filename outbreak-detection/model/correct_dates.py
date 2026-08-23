import pandas as pd
import datetime
import re
import os

def iso_to_gregorian(iso_year, iso_week, iso_day=1):
    fourth_jan = datetime.date(iso_year, 1, 4)
    _, fourth_jan_week, fourth_jan_day = fourth_jan.isocalendar()
    return fourth_jan + datetime.timedelta(days=iso_day - fourth_jan_day + (iso_week - fourth_jan_week) * 7)

def extract_week(w):
    if pd.isna(w): return None
    m = re.search(r'(\d+)', str(w))
    return int(m.group(1)) if m else None

def get_canonical_date(row, year_col, week_col):
    y, w = row[year_col], row[week_col]
    if pd.isna(y) or pd.isna(w):
        return 'INVALID'
    y, w = int(y), int(w)
    last_iso_week = datetime.date(y, 12, 28).isocalendar()[1]
    if w == 53 and last_iso_week != 53:
        return 'INVALID'
    return iso_to_gregorian(y, w).strftime('%Y-%m-%d')

def correct_final_data(data_dir):
    path = os.path.join(data_dir, 'Final_data.csv')
    df = pd.read_csv(path)
    
    orig_len = len(df)
    df['week_number'] = df['week_of_outbreak'].apply(extract_week)
    df['canonical_week_date'] = df.apply(lambda r: get_canonical_date(r, 'year', 'week_number'), axis=1)
    
    # 1. Create audit mapping
    mapping = df[['year', 'week_number', 'week_of_outbreak', 'canonical_week_date']].drop_duplicates()
    mapping.to_csv(os.path.join(data_dir, 'week_date_mapping.csv'), index=False)
    
    # 2. Filter invalid
    invalid = df[df['canonical_week_date'] == 'INVALID']
    df = df[df['canonical_week_date'] != 'INVALID'].copy()
    new_len = len(df)
    
    # 3. Overwrite Date and clean up
    df['Date'] = df['canonical_week_date']
    df = df.drop(columns=['week_number', 'canonical_week_date'])
    
    temp_path = path.replace('.csv', '_temp.csv')
    df.to_csv(temp_path, index=False)
    try:
        import shutil
        shutil.move(temp_path, path)
    except Exception as e:
        print(f"Could not overwrite {path} (locked). Saved to {temp_path}.")
        
    print(f"Final_data.csv: {orig_len} -> {new_len} rows.")
    return invalid

def correct_processed_data(data_dir, filename, year_col, week_col):
    path = os.path.join(data_dir, filename)
    if not os.path.exists(path):
        return
    df = pd.read_csv(path)
    orig_len = len(df)
    
    df['canonical_week_date'] = df.apply(lambda r: get_canonical_date(r, year_col, week_col), axis=1)
    df = df[df['canonical_week_date'] != 'INVALID'].copy()
    new_len = len(df)
    
    df['Date'] = df['canonical_week_date']
    df = df.drop(columns=['canonical_week_date'])
    
    temp_path = path.replace('.csv', '_temp.csv')
    df.to_csv(temp_path, index=False)
    try:
        import shutil
        shutil.move(temp_path, path)
    except Exception as e:
        print(f"Could not overwrite {path} (locked). Saved to {temp_path}.")
        
    print(f"{filename}: {orig_len} -> {new_len} rows.")

if __name__ == '__main__':
    data_dir = r'c:\BRAIN-STORM\warning-re\outbreak-detection\data'
    
    # 1. Correct Final_data.csv
    correct_final_data(data_dir)
    
    # 2. Correct intermediate files so Phase 2 engineering works with corrected dates
    correct_processed_data(data_dir, 'cleaned_weekly_data.csv', 'ISO_Year', 'ISO_Week')
    
    # symptom_data might be locked, so we correct symptom_data_temp.csv and symptom_data.csv just in case
    try:
        correct_processed_data(data_dir, 'symptom_data.csv', 'ISO_Year', 'ISO_Week')
    except Exception as e:
        print(f"Could not correct symptom_data.csv (likely locked): {e}")
        
    try:
        correct_processed_data(data_dir, 'symptom_data_temp.csv', 'ISO_Year', 'ISO_Week')
    except Exception as e:
        pass
