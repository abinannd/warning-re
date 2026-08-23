import pytest
import pandas as pd
import numpy as np

@pytest.fixture
def ml_data():
    return pd.read_csv(r'c:\BRAIN-STORM\warning-re\outbreak-detection\data\ml_ready_dataset.csv')

def test_no_duplicate_keys(ml_data):
    """
    Ensure State + District + Disease + Date is unique.
    """
    keys = ['State', 'District', 'Disease', 'Date']
    assert not ml_data.duplicated(subset=keys).any(), "Found duplicate primary keys!"

def test_feature_bounds(ml_data):
    """
    Ensure seasonal and basic numerical bounds.
    """
    assert (ml_data['sin_week'] >= -1).all() and (ml_data['sin_week'] <= 1).all()
    assert (ml_data['cos_week'] >= -1).all() and (ml_data['cos_week'] <= 1).all()
    assert (ml_data['month'] >= 1).all() and (ml_data['month'] <= 12).all()
    assert (ml_data['year'] >= 2009).all()

def test_environmental_missing_handled(ml_data):
    """
    Ensure no NaNs remain in the environmental variables after imputation.
    """
    assert ml_data['Surface Temperature'].isna().sum() == 0, "Missing Surface Temperature values remain!"
    assert ml_data['Precipitation'].isna().sum() == 0, "Missing Precipitation values remain!"
    assert ml_data['LAI'].isna().sum() == 0, "Missing LAI values remain!"

def test_cases_growth_rate_handling(ml_data):
    """
    Ensure no infinite growth rates.
    """
    assert not np.isinf(ml_data['cases_growth_rate']).any(), "Infinite values found in cases_growth_rate!"

def test_original_columns_preserved(ml_data):
    """
    Ensure Geographic and Categorical variables are retained for post-model analysis.
    """
    required = ['State', 'District', 'Disease', 'Latitude', 'Longitude']
    for req in required:
        assert req in ml_data.columns, f"Missing required geographical/categorical column: {req}"
