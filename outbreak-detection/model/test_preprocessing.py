import os
import pandas as pd
# pyrefly: ignore [missing-import]
import pytest

base_dir = os.path.dirname(os.path.abspath(__file__))
cleaned_data_path = os.path.abspath(os.path.join(base_dir, '..', 'data', 'cleaned_weekly_data.csv'))
canon_log_path = os.path.abspath(os.path.join(base_dir, '..', 'data', 'district_canonicalization_log.csv'))
coord_log_path = os.path.abspath(os.path.join(base_dir, '..', 'data', 'coordinate_corrections.csv'))
review_csv_path = os.path.abspath(os.path.join(base_dir, '..', 'data', 'district_merge_review.csv'))

@pytest.fixture
def df():
    assert os.path.exists(cleaned_data_path), "Cleaned data file not found. Pipeline must run first."
    return pd.read_csv(cleaned_data_path)

def test_no_duplicate_weekly_records(df):
    duplicates = df.duplicated(subset=['State', 'District', 'Disease', 'ISO_Year', 'ISO_Week']).sum()
    assert duplicates == 0, f"Found {duplicates} duplicate weekly records."

def test_non_empty_state_district(df):
    assert df['State'].isna().sum() == 0, "Found empty State values."
    assert df['District'].isna().sum() == 0, "Found empty District values."
    assert (df['State'] == "").sum() == 0, "Found empty State strings."
    assert (df['District'] == "").sum() == 0, "Found empty District strings."

def test_canonical_disease_names(df):
    canonical_diseases = {
        'Dengue', 'Chikungunya', 'Malaria', 'Cholera',
        'Dengue & Chikungunya', 'Dengue & Malaria',
        'Acute Diarrhoeal Disease', 'PUO', 'AES'
    }
    invalid = set(df['Disease'].dropna()) - canonical_diseases
    assert not invalid, f"Invalid disease names found: {invalid}"

def test_valid_coordinates(df):
    assert df['Latitude'].min() >= 8.0, "Latitude below India bounds"
    assert df['Latitude'].max() <= 38.0, "Latitude above India bounds"
    assert df['Longitude'].min() >= 68.0, "Longitude below India bounds"
    assert df['Longitude'].max() <= 98.0, "Longitude above India bounds"

def test_cases_valid(df):
    assert df['Cases'].isna().sum() == 0, "Found missing Cases values."
    assert (df['Cases'] < 0).sum() == 0, "Found negative Cases values."
    assert pd.api.types.is_numeric_dtype(df['Cases']), "Cases column is not numeric."

def test_dates_valid(df):
    assert pd.api.types.is_numeric_dtype(df['ISO_Year']), "ISO_Year is not numeric."
    assert pd.api.types.is_numeric_dtype(df['ISO_Week']), "ISO_Week is not numeric."
    assert df['Date'].isna().sum() == 0, "Found missing Dates."

def test_approved_mappings_applied(df):
    if not os.path.exists(canon_log_path):
        pytest.skip("Canonicalization log not found.")
    
    canon_log = pd.read_csv(canon_log_path)
    for _, row in canon_log.iterrows():
        original_dist = row['Original District']
        canonical_dist = row['Canonical District']
        # If the original distinct is completely replaced, it should not exist in df unless it is the canonical one
        if original_dist != canonical_dist:
            assert original_dist not in df['District'].values, f"Approved merge failed: {original_dist} still exists in dataset."

def test_rejected_merges_preserved(df):
    if not os.path.exists(review_csv_path):
        pytest.skip("Review CSV not found.")
    
    review_df = pd.read_csv(review_csv_path)
    rejected = review_df[review_df['Decision'] == 'REJECT']
    
    for _, row in rejected.iterrows():
        ca = row['Candidate_A']
        cb = row['Candidate_B']
        # Both should potentially exist and NOT be merged into each other
        assert ca != cb, "Candidates should not be identical."

def test_no_zero_coordinates(df):
    assert (df['Latitude'] == 0).sum() == 0, "Found Latitude = 0"
    assert (df['Longitude'] == 0).sum() == 0, "Found Longitude = 0"
