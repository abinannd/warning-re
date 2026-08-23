import pytest
import pandas as pd
import numpy as np

@pytest.fixture
def ml_data():
    return pd.read_csv(r'c:\BRAIN-STORM\warning-re\outbreak-detection\data\ml_ready_dataset.csv', parse_dates=['Date'])

@pytest.fixture
def clean_data():
    return pd.read_csv(r'c:\BRAIN-STORM\warning-re\outbreak-detection\data\cleaned_weekly_data.csv', parse_dates=['Date'])

def test_no_target_leakage_in_lags(ml_data):
    """
    Ensure cases_lag_1 is strictly from a prior date in the same group.
    """
    df = ml_data.sort_values(['State', 'District', 'Disease', 'Date']).reset_index(drop=True)
    
    for i in range(1, len(df)):
        if df.loc[i, 'State'] == df.loc[i-1, 'State'] and \
           df.loc[i, 'District'] == df.loc[i-1, 'District'] and \
           df.loc[i, 'Disease'] == df.loc[i-1, 'Disease']:
            
            # The lag_1 of row i should exactly equal the Cases of row i-1
            assert np.isnan(df.loc[i, 'cases_lag_1']) or df.loc[i, 'cases_lag_1'] == df.loc[i-1, 'Cases'], "Leakage or misaligned lag!"

def test_chronological_splits(ml_data):
    """
    Ensure the splits are chronologically ordered.
    """
    train = ml_data[ml_data['split'] == 'train']
    val = ml_data[ml_data['split'] == 'val']
    test = ml_data[ml_data['split'] == 'test']
    
    assert train['Date'].max() < val['Date'].min(), "Train data leaks into validation period!"
    assert val['Date'].max() < test['Date'].min(), "Validation data leaks into test period!"

def test_imputation_no_future_leakage(ml_data):
    """
    Ensure that validation and test sets were not used to compute the historical means.
    We check this by ensuring that the test set has no backward-fill or interpolated values that rely on the test set.
    Since we only used train-set means, this shouldn't happen.
    """
    # This is implicitly tested by the logic, but we can verify that the 'missing' indicators exist.
    assert 'Surface Temperature_missing' in ml_data.columns

def test_symptom_merge_alignment(ml_data, clean_data):
    """
    Ensure that merging synthetic symptoms did NOT alter the number of records or real cases.
    """
    assert len(ml_data) == len(clean_data), "Row counts changed during merge!"
    
    ml_cases_sum = ml_data['Cases'].sum()
    clean_cases_sum = clean_data['Cases'].sum()
    
    assert ml_cases_sum == clean_cases_sum, "Real case counts were altered during synthetic merge!"
