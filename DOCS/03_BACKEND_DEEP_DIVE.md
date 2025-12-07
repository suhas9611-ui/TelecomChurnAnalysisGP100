# Document 3: Backend Deep Dive

## 📋 Table of Contents
1. [Flask Server (server.py)](#flask-server)
2. [Core Modules](#core-modules)
3. [Utility Modules](#utility-modules)
4. [API Endpoints](#api-endpoints)
5. [Data Processing](#data-processing)
6. [Model Management](#model-management)

---

## Flask Server

### File: `server.py`

The main entry point for the backend application.

#### Initialization Sequence

```python
# 1. Import dependencies
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS

# 2. Initialize Flask app
app = Flask(__name__, static_folder='frontend', static_url_path='')
CORS(app)  # Enable cross-origin requests

# 3. Initialize components
data_loader = DataLoader()
model_manager = ModelManager()

# 4. Load data and model on startup
try:
    success, df, error = data_loader.load_customer_data()
    if success:
        data_loaded = True
except Exception as e:
    logger.error(f"Error loading data: {e}")

try:
    success, error = model_manager.load_model()
    if success:
        model_loaded = True
except Exception as e:
    logger.error(f"Error loading model: {e}")
```

#### Why This Approach?

**Eager Loading**: Data and model are loaded once at startup
- **Pros**: Fast response times, no loading delay per request
- **Cons**: Higher startup time, more memory usage
- **Trade-off**: Acceptable for this use case (small dataset, single model)

---

## Core Modules

### 1. DataLoader (`app/core/data_loader.py`)

Handles all data loading and processing operations.

#### Class Structure

```python
class DataLoader:
    def __init__(self):
        self.validator = DataValidator()
        self.df = None  # Stores loaded DataFrame
        self.churn_column = None  # Stores churn column name
```

#### Key Methods

##### `load_customer_data(file_path=None)`

**Purpose**: Load and validate customer data from CSV

**Process Flow**:
```
1. Get file path from config (if not provided)
2. Validate CSV file exists and is readable
3. Load CSV into Pandas DataFrame
4. Sanitize DataFrame (remove empty rows)
5. Detect churn column name
6. Validate churn column
7. Normalize churn values to binary (0/1)
8. Store DataFrame in memory
9. Return success status
```

**Code Walkthrough**:
```python
def load_customer_data(self, file_path=None):
    # Step 1: Get file path
    if file_path is None:
        file_path = config.get_path('paths.customer_data')
    
    logger.info(f"Loading customer data from: {file_path}")
    
    # Step 2-3: Validate and load CSV
    is_valid, df, error = self.validator.validate_csv(file_path)
    if not is_valid:
        logger.error(f"Failed to load customer data: {error}")
        return False, None, error
    
    # Step 4: Sanitize
    df = self.validator.sanitize_dataframe(df)
    
    # Step 5: Detect churn column
    churn_col = self._detect_churn_column(df)
    if not churn_col:
        error = "Could not detect churn column"
        logger.error(error)
        return False, None, error
    
    # Step 6: Validate churn column
    is_valid, error = self.validator.validate_churn_column(df, churn_col)
    if not is_valid:
        logger.error(error)
        return False, None, error
    
    # Step 7: Normalize
    df = self._normalize_churn_column(df, churn_col)
    
    # Step 8: Store
    self.df = df
    self.churn_column = churn_col
    
    logger.info(f"Customer data loaded successfully: {len(df)} records")
    return True, df, None
```

##### `_detect_churn_column(df)`

**Purpose**: Automatically find the churn column

**Logic**:
```python
def _detect_churn_column(self, df):
    # First, check configuration
    configured_col = config.get('data.churn_column')
    if configured_col and configured_col in df.columns:
        return configured_col
    
    # Fallback: Try common names
    possible_names = ['Churn', 'churn', 'CHURN', 'Churned', 'churned']
    for name in possible_names:
        if name in df.columns:
            return name
    
    return None  # Not found
```

**Why This Approach?**
- **Flexibility**: Works with different column naming conventions
- **Configuration**: Can be overridden in settings.yaml
- **Robustness**: Handles case variations

##### `_normalize_churn_column(df, churn_col)`

**Purpose**: Convert churn values to binary (0/1)

**Logic**:
```python
def _normalize_churn_column(self, df, churn_col):
    # Get positive values from config
    positive_values = config.get('data.churn_positive_values', 
                                  ['Yes', '1', 1, True])
    
    # Create copy to avoid modifying original
    df = df.copy()
    
    # Convert to string for comparison
    df[churn_col] = df[churn_col].astype(str)
    
    # Map to binary
    df[churn_col] = df[churn_col].apply(
        lambda x: 1 if str(x) in [str(v) for v in positive_values] else 0
    )
    
    return df
```

**Why This Approach?**
- **Standardization**: Ensures consistent format
- **ML Compatibility**: Binary values work with all ML models
- **Configurable**: Positive values defined in config

##### `get_churn_stats()`

**Purpose**: Calculate churn statistics

**Returns**:
```python
{
    'total_customers': 5000,
    'churned_customers': 1350,
    'retained_customers': 3650,
    'churn_rate': 27.0
}
```

**Implementation**:
```python
def get_churn_stats(self):
    if self.df is None or self.churn_column is None:
        return None
    
    total = len(self.df)
    churned = self.df[self.churn_column].sum()  # Sum of 1s
    churn_rate = (churned / total * 100) if total > 0 else 0
    
    return {
        'total_customers': total,
        'churned_customers': int(churned),
        'retained_customers': total - int(churned),
        'churn_rate': round(churn_rate, 2)
    }
```

---

### 2. ModelManager (`app/core/model_manager.py`)

Handles ML model loading and predictions.

#### Class Structure

```python
class ModelManager:
    def __init__(self):
        self.validator = DataValidator()
        self.pred_validator = PredictionValidator()
        self.model = None  # Scikit-learn model
        self.encoders = None  # Label encoders for categorical features
        self.model_columns = None  # Expected feature order
```

#### Key Methods

##### `load_model(model_path=None)`

**Purpose**: Load trained ML model from pickle file

**Model File Structure**:
```python
{
    'model': RandomForestClassifier(...),  # Trained model
    'encoders': {  # Label encoders for each categorical column
        'Gender': LabelEncoder(),
        'ContractType': LabelEncoder(),
        ...
    },
    'columns': [  # Feature names in training order
        'CustomerID', 'Age', 'Gender', ...
    ]
}
```

**Process**:
```python
def load_model(self, model_path=None):
    # Get path from config
    if model_path is None:
        model_path = config.get_path('paths.model')
    
    # Validate and load
    is_valid, model_data, error = self.validator.validate_model(model_path)
    if not is_valid:
        return False, error
    
    # Extract components
    self.model = model_data.get('model')
    self.encoders = model_data.get('encoders', {})
    self.model_columns = model_data.get('columns', [])
    
    return True, None
```

##### `predict(input_data)`

**Purpose**: Make churn prediction for a customer

**This is the most complex method. Let's break it down step by step:**

**Step 1: Add Default Values**
```python
# Create copy to avoid modifying original
processed_data = input_data.copy()

# Add defaults for columns model expects but user doesn't provide
if 'CustomerID' in self.model_columns and 'CustomerID' not in processed_data:
    processed_data['CustomerID'] = 'CUST000000'

if 'ChurnProb' in self.model_columns and 'ChurnProb' not in processed_data:
    processed_data['ChurnProb'] = 0.0
```

**Why?** Model was trained with these columns, but they're not user inputs.

**Step 2: Validate Required Fields**
```python
is_valid, error = self.pred_validator.validate_input_data(
    processed_data, self.model_columns
)

if not is_valid:
    logger.error(f"Invalid prediction input: {error}")
    return False, None, error
```

**Step 3: Convert Numeric Strings**
```python
for col, value in processed_data.items():
    if isinstance(value, str) and col not in ['CustomerID', 'customer_id']:
        try:
            processed_data[col] = float(value)
        except (ValueError, TypeError):
            pass  # Keep as string (categorical)
```

**Why?** Form data comes as strings, need to convert to numbers.

**Step 4: Validate Ranges**
```python
is_valid_range, range_error = self.pred_validator.validate_input_ranges(
    processed_data
)

if not is_valid_range:
    return False, None, f"Validation Error: {range_error}"
```

**Step 5: Create DataFrame**
```python
df_input = pd.DataFrame([processed_data])
```

**Why?** Model expects DataFrame format, not dictionary.

**Step 6: Handle "None" Values (CRITICAL FIX)**
```python
# First pass: Replace "None" with first valid class
for col in df_input.columns:
    if col in self.encoders:
        original_value = df_input[col].iloc[0]
        
        if str(original_value).lower() == 'none' or original_value == '':
            # Get first class from encoder as default
            first_class = self.encoders[col].classes_[0]
            df_input[col] = first_class
            logger.info(f"Column '{col}': Replaced 'None' with '{first_class}'")
```

**Why This Fix?**
- **Problem**: Encoders were trained on actual values, not "None"
- **Solution**: Replace "None" with first valid value before encoding
- **Result**: Prevents encoding failures that caused identical predictions

**Step 7: Encode Categorical Features**
```python
# Second pass: Encode all categorical columns
for col in df_input.columns:
    if col in self.encoders:
        try:
            encoded_value = self.encoders[col].transform(df_input[col])
            df_input[col] = encoded_value
        except Exception as e:
            logger.warning(f"Failed to encode '{col}': {e}")
            df_input[col] = 0  # Fallback
```

**Step 8: Ensure Column Order**
```python
df_input = df_input[self.model_columns]
```

**Why?** Model expects features in specific order from training.

**Step 9: Make Prediction**
```python
prediction = self.model.predict(df_input)[0]  # 0 or 1
probability = self.model.predict_proba(df_input)[0]  # [prob_0, prob_1]

result = {
    'prediction': int(prediction),
    'probability': float(probability[1]),  # Probability of churn
    'confidence': float(max(probability))  # Highest probability
}

return True, result, None
```

---

## Utility Modules

### 1. Validators (`app/utils/validators.py`)

#### DataValidator Class

**Purpose**: Validate data files and structures

**Methods**:

##### `validate_csv(file_path, required_columns=None)`
```python
@staticmethod
def validate_csv(file_path, required_columns=None):
    try:
        # Check file exists
        if not Path(file_path).exists():
            return False, None, f"File not found: {file_path}"
        
        # Load CSV
        df = pd.read_csv(file_path)
        
        # Check not empty
        if df.empty:
            return False, None, "CSV file is empty"
        
        # Check required columns
        if required_columns:
            missing = [col for col in required_columns 
                      if col not in df.columns]
            if missing:
                return False, None, f"Missing columns: {missing}"
        
        return True, df, None
    except Exception as e:
        return False, None, f"Error reading CSV: {str(e)}"
```

##### `validate_model(model_path)`
```python
@staticmethod
def validate_model(model_path):
    try:
        # Check file exists
        if not Path(model_path).exists():
            return False, None, f"Model file not found"
        
        # Load pickle file
        with open(model_path, 'rb') as f:
            model_data = pickle.load(f)
        
        # Check required keys
        required_keys = ['model', 'encoders', 'columns']
        missing = [key for key in required_keys 
                  if key not in model_data]
        
        if missing:
            return False, None, f"Model missing keys: {missing}"
        
        return True, model_data, None
    except Exception as e:
        return False, None, f"Error loading model: {str(e)}"
```

#### PredictionValidator Class

**Purpose**: Validate prediction inputs

**Validation Rules**:
```python
VALIDATION_RULES = {
    'Age': {'min': 18, 'max': 100, 'type': 'numeric'},
    'TenureMonths': {'min': 0, 'max': 120, 'type': 'numeric'},
    'MonthlyCharges': {'min': 0, 'max': 2000, 'type': 'numeric'},
    'TotalCharges': {'min': 0, 'max': 150000, 'type': 'numeric'},
    'SupportCallsLast90d': {'min': 0, 'max': 50, 'type': 'numeric'},
    'AvgDownlinkMbps': {'min': 0, 'max': 1000, 'type': 'numeric'},
}

CATEGORICAL_VALUES = {
    'Gender': ['Male', 'Female', 'None'],
    'ContractType': ['Month-to-month', 'One year', 'Two year', 'None'],
    ...
}
```

**Methods**:

##### `validate_input_ranges(input_data)`
```python
@staticmethod
def validate_input_ranges(input_data):
    errors = []
    
    # Validate CustomerID format
    if 'CustomerID' in input_data:
        cust_id = str(input_data['CustomerID'])
        if cust_id.startswith('CUST'):
            numeric_part = int(cust_id.replace('CUST', ''))
            if numeric_part < 100000:
                errors.append("CustomerID below minimum")
            elif numeric_part > 200000:
                errors.append("CustomerID exceeds maximum")
    
    # Validate numeric fields
    for field, rules in VALIDATION_RULES.items():
        if field in input_data:
            value = float(input_data[field])
            if value < rules['min']:
                errors.append(f"{field} below minimum")
            elif value > rules['max']:
                errors.append(f"{field} exceeds maximum")
    
    # Validate categorical fields
    for field, valid_values in CATEGORICAL_VALUES.items():
        if field in input_data:
            value = input_data[field]
            if value not in valid_values:
                errors.append(f"{field} invalid value")
    
    if errors:
        return False, "; ".join(errors)
    return True, None
```

---

### 2. ConfigLoader (`app/utils/config_loader.py`)

**Purpose**: Load and access YAML configuration

**Implementation**:
```python
class ConfigLoader:
    def __init__(self, config_path="config/settings.yaml"):
        self.config_path = config_path
        self.config = self._load_config()
    
    def _load_config(self):
        try:
            current_dir = Path(__file__).parent.parent.parent
            config_file = current_dir / self.config_path
            with open(config_file, 'r') as f:
                return yaml.safe_load(f)
        except:
            return {}  # Return empty dict on error
    
    def get(self, key_path, default=None):
        """
        Get config value using dot notation
        Example: config.get('dashboard.title')
        """
        keys = key_path.split('.')
        value = self.config
        for key in keys:
            if isinstance(value, dict) and key in value:
                value = value[key]
            else:
                return default
        return value
    
    def get_path(self, key_path):
        """
        Get file path and resolve relative to project root
        Example: config.get_path('paths.model')
        Returns: /full/path/to/models/churn_model.pkl
        """
        path = self.get(key_path)
        if path:
            current_dir = Path(__file__).parent.parent.parent
            return str(current_dir / path)
        return None

# Create singleton instance
config = ConfigLoader()
```

**Usage Examples**:
```python
# Get simple value
title = config.get('dashboard.title')  # "Customer Churn Dashboard"

# Get with default
max_charts = config.get('visualizations.max_charts', 6)  # 6

# Get file path
model_path = config.get_path('paths.model')  
# Returns: C:\...\models\churn_model.pkl
```

---

### 3. Logger (`app/utils/logger.py`)

**Purpose**: Centralized logging system

**Implementation**:
```python
class AppLogger:
    def __init__(self, log_file="logs/app.log"):
        self.log_file = log_file
        self.logger = self._setup_logger()
    
    def _setup_logger(self):
        # Create logs directory
        log_dir = Path(self.log_file).parent
        log_dir.mkdir(parents=True, exist_ok=True)
        
        # Create logger
        logger = logging.getLogger('ChurnDashboard')
        logger.setLevel(logging.INFO)
        
        # Avoid duplicate handlers
        if logger.handlers:
            return logger
        
        # File handler
        file_handler = logging.FileHandler(self.log_file)
        
        # Console handler
        console_handler = logging.StreamHandler()
        
        # Formatter
        formatter = logging.Formatter(
            '%(asctime)s - %(levelname)s - %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
        
        file_handler.setFormatter(formatter)
        console_handler.setFormatter(formatter)
        
        logger.addHandler(file_handler)
        logger.addHandler(console_handler)
        
        return logger
    
    def info(self, message):
        self.logger.info(message)
    
    def warning(self, message):
        self.logger.warning(message)
    
    def error(self, message):
        self.logger.error(message)

# Create singleton instance
logger = AppLogger()
```

**Log Output Example**:
```
2025-12-07 18:31:56 - INFO - Loading customer data from: C:\...\data\customers.csv
2025-12-07 18:31:56 - INFO - Successfully loaded CSV: 5000 rows
2025-12-07 18:31:56 - INFO - Customer data loaded successfully: 5000 records
2025-12-07 18:31:56 - INFO - Model loaded successfully with 20 features
2025-12-07 18:32:07 - INFO - Prediction requested via API
2025-12-07 18:32:07 - INFO - Prediction made: {'prediction': 0, 'probability': 0.37}
```

---

## API Endpoints

### Complete Endpoint Reference

#### 1. Health Check
```python
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'data_loaded': data_loaded,
        'model_loaded': model_loaded
    })
```

#### 2. Statistics
```python
@app.route('/api/stats', methods=['GET'])
def get_stats():
    if not data_loaded:
        return jsonify({'error': 'Data not loaded'}), 500
    
    stats = data_loader.get_churn_stats()
    return jsonify(stats)
```

#### 3. Chart Data
```python
@app.route('/api/charts', methods=['GET'])
def get_chart_data():
    df = data_loader.df
    churn_col = data_loader.churn_column
    cat_columns = data_loader.get_categorical_columns()
    
    # Get priority columns from config
    priority_cols = config.get('visualizations.priority_columns', [])
    max_charts = config.get('visualizations.max_charts', 6)
    
    # Sort by priority
    sorted_cols = [col for col in priority_cols if col in cat_columns]
    sorted_cols.extend([col for col in cat_columns if col not in sorted_cols])
    display_cols = sorted_cols[:max_charts]
    
    # Prepare chart data
    charts = []
    for col in display_cols:
        grouped = df.groupby([col, churn_col]).size().reset_index(name='count')
        charts.append({
            'column': col,
            'data': grouped.to_dict('records')
        })
    
    return jsonify({'charts': charts})
```

#### 4. Model Features
```python
@app.route('/api/model/features', methods=['GET'])
def get_model_features():
    exclude_columns = ['CustomerID', 'ChurnProb', 'Churn']
    
    features = []
    feature_groups = {
        'demographic': [],
        'service': [],
        'usage': [],
        'financial': []
    }
    
    for col in model_manager.model_columns:
        if col in exclude_columns:
            continue
        
        options = model_manager.get_categorical_options(col)
        
        # Add "None" as first option
        if options:
            options = ['None'] + list(options)
        
        feature = {
            'name': col,
            'type': 'categorical' if options else 'numeric',
            'options': options
        }
        
        # Categorize feature
        if col in demographic_cols:
            feature['group'] = 'demographic'
            feature_groups['demographic'].append(feature)
        # ... similar for other groups
        
        features.append(feature)
    
    return jsonify({
        'features': features,
        'groups': feature_groups
    })
```

#### 5. Prediction
```python
@app.route('/api/predict', methods=['POST'])
def predict():
    if not model_loaded:
        return jsonify({'error': 'Model not loaded'}), 500
    
    input_data = request.json
    
    # Make prediction
    success, result, error = model_manager.predict(input_data)
    
    if not success:
        return jsonify({'error': error}), 400
    
    return jsonify(result)
```

---

## Next Steps

Continue to **Document 4: Frontend Deep Dive** to understand:
- JavaScript module architecture
- Chart rendering with Plotly
- Form generation and validation
- User interaction handling
