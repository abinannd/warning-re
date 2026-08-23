import pandas as pd
import datetime

df = pd.read_csv('data/final_final_data.csv')
print('Total rows:', len(df))

# Extract week number
df['week_number'] = df['week_of_outbreak'].astype(str).str.extract(r'(\d+)').astype(float)
invalid_extraction = df[df['week_number'].isna()]
if not invalid_extraction.empty:
    print('Failed to extract week number for some rows:')
    print(invalid_extraction[['week_of_outbreak']].head())

def get_canonical_monday(year, week):
    if pd.isna(week): return None
    year = int(year)
    week = int(week)
    
    # Try ISO first
    try:
        # ISO calendar Monday
        dt = datetime.datetime.strptime(f'{year}-W{week:02d}-1', '%G-W%V-%u').date()
    except ValueError as e:
        return f'ERROR: {e}'
        
    return dt

df['canonical_date'] = df.apply(lambda row: get_canonical_monday(row['year'], row['week_number']), axis=1)

errors = df[df['canonical_date'].astype(str).str.startswith('ERROR', na=False)]
if not errors.empty:
    print('Invalid year/week combinations found:')
    for _, row in errors.head(10).iterrows():
        print(f"Year: {row['year']}, Week: {row['week_number']}, Error: {row['canonical_date']}")
    print(f"Total errors: {len(errors)}")

df_valid = df[~df['canonical_date'].astype(str).str.startswith('ERROR', na=False)].copy()
if not df_valid.empty:
    df_valid['canonical_date'] = pd.to_datetime(df_valid['canonical_date'])
    df_valid['canonical_year'] = df_valid['canonical_date'].dt.year
    df_valid['iso_year'] = df_valid['canonical_date'].dt.isocalendar().year
    
    mismatch = df_valid[(df_valid['canonical_year'] != df_valid['year']) | (df_valid['iso_year'] != df_valid['year'])]
    if not mismatch.empty:
        print('Mismatches found where Date.year != year or Date.iso_year != year:')
        print(mismatch[['year', 'week_number', 'canonical_date', 'canonical_year', 'iso_year']].drop_duplicates().head(20))
        print(f"Total mismatches: {len(mismatch)}")
