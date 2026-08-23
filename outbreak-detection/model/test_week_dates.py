import pytest
import pandas as pd
import datetime

@pytest.fixture
def orig_data():
    return pd.read_csv(r'c:\BRAIN-STORM\warning-re\outbreak-detection\data\Final_data_temp.csv')

@pytest.fixture
def ml_data():
    return pd.read_csv(r'c:\BRAIN-STORM\warning-re\outbreak-detection\data\ml_ready_dataset.csv', parse_dates=['Date'])

@pytest.fixture
def mapping():
    return pd.read_csv(r'c:\BRAIN-STORM\warning-re\outbreak-detection\data\week_date_mapping.csv', parse_dates=['canonical_week_date'])

def test_no_missing_canonical_dates(orig_data):
    assert orig_data['Date'].isna().sum() == 0, "Missing dates found in Final_data.csv"

def test_iso_mondays(mapping):
    for _, row in mapping.iterrows():
        if not pd.isna(row['canonical_week_date']) and row['canonical_week_date'] != 'INVALID':
                date_obj = pd.to_datetime(row['canonical_week_date'])
                assert date_obj.weekday() == 0, f"Date {row['canonical_week_date']} is not a Monday!"

def test_row_counts_preserved(ml_data):
    assert len(ml_data) == 8090, "ML ready dataset lost/gained rows!"

def test_unique_keys_preserved(ml_data):
    keys = ['State', 'District', 'Disease', 'Date']
    assert not ml_data.duplicated(subset=keys).any(), "Duplicate weekly keys introduced!"

def test_no_invalid_week_53(orig_data):
    assert len(orig_data[(orig_data['year'] == 2010) & (orig_data['week_of_outbreak'] == '53rd week')]) == 0
    assert len(orig_data[(orig_data['year'] == 2016) & (orig_data['week_of_outbreak'] == '53rd week')]) == 0
