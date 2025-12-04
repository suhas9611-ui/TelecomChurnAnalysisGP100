"""Data Loading Module"""
import pandas as pd
from app.utils.validators import DataValidator
from app.utils.logger import logger
from app.utils.config_loader import config

class DataLoader:
    def __init__(self):
        self.validator = DataValidator()
        self.df = None
        self.churn_column = None
    
    def load_customer_data(self, file_path=None):
        if file_path is None:
            file_path = config.get_path('paths.customer_data')
        
        logger.info(f"Loading customer data from: {file_path}")
        
        is_valid, df, error = self.validator.validate_csv(file_path)
        
        if not is_valid:
            logger.error(f"Failed to load customer data: {error}")
            return False, None, error
        
        df = self.validator.sanitize_dataframe(df)
        
        churn_col = self._detect_churn_column(df)
        if not churn_col:
            error = "Could not detect churn column"
            logger.error(error)
            return False, None, error
        
        is_valid, error = self.validator.validate_churn_column(df, churn_col)
        if not is_valid:
            logger.error(error)
            return False, None, error
        
        df = self._normalize_churn_column(df, churn_col)
        
        self.df = df
        self.churn_column = churn_col
        
        logger.info(f"Customer data loaded successfully: {len(df)} records")
        return True, df, None
    
    def _detect_churn_column(self, df):
        configured_col = config.get('data.churn_column')
        if configured_col and configured_col in df.columns:
            logger.info(f"Using configured churn column: {configured_col}")
            return configured_col
        
        possible_names = ['Churn', 'churn', 'CHURN', 'Churned', 'churned']
        
        for name in possible_names:
            if name in df.columns:
                logger.info(f"Auto-detected churn column: {name}")
                return name
        
        return None
    
    def _normalize_churn_column(self, df, churn_col):
        positive_values = config.get('data.churn_positive_values', ['Yes', '1', 1, True])
        
        df = df.copy()
        df[churn_col] = df[churn_col].astype(str)
        df[churn_col] = df[churn_col].apply(
            lambda x: 1 if str(x) in [str(v) for v in positive_values] else 0
        )
        
        logger.info(f"Churn column normalized to binary format")
        return df
    
    def get_feature_columns(self):
        if self.df is None:
            return []
        
        exclude_cols = config.get('data.exclude_from_charts', [])
        exclude_cols.append(self.churn_column)
        
        return [col for col in self.df.columns if col not in exclude_cols]
    
    def get_categorical_columns(self):
        if self.df is None:
            return []
        
        feature_cols = self.get_feature_columns()
        
        categorical = []
        for col in feature_cols:
            if self.df[col].dtype == 'object' or self.df[col].nunique() < 20:
                categorical.append(col)
        
        return categorical
    
    def get_churn_stats(self):
        if self.df is None or self.churn_column is None:
            return None
        
        total = len(self.df)
        churned = self.df[self.churn_column].sum()
        churn_rate = (churned / total * 100) if total > 0 else 0
        
        return {
            'total_customers': total,
            'churned_customers': int(churned),
            'retained_customers': total - int(churned),
            'churn_rate': round(churn_rate, 2)
        }
