# System Architecture 🏗️

## Overview

The improved dashboard follows a clean, modular architecture with clear separation of concerns.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         USER                                 │
│                    (Web Browser)                             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   STREAMLIT UI LAYER                         │
│                  (app/ui/dashboard.py)                       │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Metrics    │  │    Charts    │  │  Prediction  │     │
│  │   Display    │  │  Generator   │  │     Form     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  BUSINESS LOGIC LAYER                        │
│                     (app/core/)                              │
│                                                              │
│  ┌──────────────────────────┐  ┌──────────────────────┐   │
│  │     DataLoader           │  │   ModelManager       │   │
│  │                          │  │                      │   │
│  │  • Load CSV              │  │  • Load Model        │   │
│  │  • Detect Churn Column   │  │  • Make Predictions  │   │
│  │  • Get Features          │  │  • Encode Features   │   │
│  │  • Calculate Stats       │  │  • Validate Inputs   │   │
│  └──────────────────────────┘  └──────────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    UTILITY LAYER                             │
│                    (app/utils/)                              │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Config     │  │    Logger    │  │  Validators  │     │
│  │   Loader     │  │              │  │              │     │
│  │              │  │  • Info      │  │  • CSV       │     │
│  │  • Load      │  │  • Warning   │  │  • Model     │     │
│  │    YAML      │  │  • Error     │  │  • Data      │     │
│  │  • Get       │  │  • Debug     │  │  • Input     │     │
│  │    Values    │  │              │  │              │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                     DATA LAYER                               │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │    Config    │  │     Data     │  │    Model     │     │
│  │              │  │              │  │              │     │
│  │  settings.   │  │  customers.  │  │  churn_      │     │
│  │  yaml        │  │  csv         │  │  model.pkl   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

---

## Component Responsibilities

### 1. UI Layer (`app/ui/`)
**Purpose:** User interface and presentation

**Components:**
- `dashboard.py` - Main dashboard interface

**Responsibilities:**
- Render Streamlit components
- Display metrics and charts
- Handle user input
- Show predictions
- Display errors gracefully

**Dependencies:**
- Business Logic Layer
- Streamlit library

---

### 2. Business Logic Layer (`app/core/`)
**Purpose:** Core application logic

**Components:**
- `data_loader.py` - Data management
- `model_manager.py` - Model operations

**Responsibilities:**

#### DataLoader
- Load and validate CSV files
- Auto-detect churn column
- Identify feature columns
- Calculate statistics
- Sanitize data

#### ModelManager
- Load ML model from pickle
- Make predictions
- Encode categorical features
- Validate prediction inputs
- Manage model metadata

**Dependencies:**
- Utility Layer
- Pandas, Scikit-learn

---

### 3. Utility Layer (`app/utils/`)
**Purpose:** Shared utilities and helpers

**Components:**
- `config_loader.py` - Configuration management
- `logger.py` - Logging system
- `validators.py` - Data validation

**Responsibilities:**

#### ConfigLoader
- Load YAML configuration
- Provide config access
- Handle config errors

#### Logger
- Log application events
- Write to log file
- Format log messages
- Support multiple log levels

#### Validators
- Validate CSV files
- Validate model files
- Validate data integrity
- Validate prediction inputs
- Sanitize data

**Dependencies:**
- Standard library
- PyYAML

---

### 4. Data Layer
**Purpose:** Data storage

**Components:**
- `config/settings.yaml` - Configuration
- `data/*.csv` - Customer data
- `models/*.pkl` - ML models
- `logs/*.log` - Application logs

---

## Data Flow

### 1. Application Startup

```
main.py
  │
  ├─→ ConfigLoader.load()
  │     └─→ Read settings.yaml
  │
  ├─→ DataLoader.load_customer_data()
  │     ├─→ Validator.validate_csv()
  │     ├─→ Detect churn column
  │     ├─→ Sanitize data
  │     └─→ Return dataframe
  │
  ├─→ ModelManager.load_model()
  │     ├─→ Validator.validate_model()
  │     └─→ Return model components
  │
  └─→ Dashboard.render()
        └─→ Display UI
```

### 2. Viewing Analytics

```
User opens dashboard
  │
  ├─→ Dashboard._render_metrics()
  │     └─→ DataLoader.get_churn_stats()
  │           └─→ Calculate and return stats
  │
  └─→ Dashboard._render_visualizations()
        ├─→ DataLoader.get_categorical_columns()
        └─→ Create charts dynamically
```

### 3. Making Predictions

```
User submits form
  │
  ├─→ Dashboard._create_input_field()
  │     └─→ ModelManager.get_categorical_options()
  │
  ├─→ Dashboard._handle_prediction()
  │     └─→ ModelManager.predict()
  │           ├─→ Validator.validate_input_data()
  │           ├─→ Create dataframe
  │           ├─→ Model.predict()
  │           └─→ Return results
  │
  └─→ Display prediction results
```

---

## Error Handling Flow

```
Operation Attempted
  │
  ├─→ Try operation
  │     │
  │     ├─→ Success
  │     │     ├─→ Log success
  │     │     └─→ Return result
  │     │
  │     └─→ Failure
  │           ├─→ Log error
  │           ├─→ Return error message
  │           └─→ Display friendly message
  │
  └─→ Continue execution (no crash)
```

---

## Configuration Flow

```
Application needs setting
  │
  └─→ config.get('key.path')
        │
        ├─→ Load settings.yaml (if not loaded)
        │
        ├─→ Navigate to key
        │
        └─→ Return value or default
```

---

## Logging Flow

```
Event occurs
  │
  └─→ logger.info/warning/error()
        │
        ├─→ Format message with timestamp
        │
        ├─→ Write to logs/app.log
        │
        └─→ Print to console
```

---

## Design Patterns Used

### 1. Singleton Pattern
- **Where:** ConfigLoader, Logger
- **Why:** Single instance for configuration and logging

### 2. Facade Pattern
- **Where:** DataLoader, ModelManager
- **Why:** Simple interface to complex operations

### 3. Strategy Pattern
- **Where:** Validators
- **Why:** Different validation strategies for different data types

### 4. Factory Pattern
- **Where:** Dashboard chart creation
- **Why:** Dynamic creation of UI components

---

## Key Design Principles

### 1. Separation of Concerns
- UI separate from business logic
- Business logic separate from utilities
- Each module has single responsibility

### 2. Dependency Injection
- Components receive dependencies
- Easy to test and modify
- Loose coupling

### 3. Configuration Over Code
- Settings in YAML, not hardcoded
- Easy to customize
- No code changes needed

### 4. Fail Gracefully
- Validate everything
- Handle all errors
- Never crash
- Show helpful messages

### 5. DRY (Don't Repeat Yourself)
- Shared utilities
- Reusable components
- Single source of truth

---

## Extension Points

### Adding New Features

#### 1. New Visualization
```python
# In dashboard.py
def _create_custom_chart(self, df, column):
    # Your chart logic
    pass
```

#### 2. New Validation
```python
# In validators.py
@staticmethod
def validate_custom_data(data):
    # Your validation logic
    pass
```

#### 3. New Configuration
```yaml
# In settings.yaml
custom:
  setting1: value1
  setting2: value2
```

#### 4. New Data Source
```python
# In data_loader.py
def load_from_api(self, url):
    # Your API logic
    pass
```

---

## Testing Strategy

### Unit Tests
- Test individual functions
- Mock dependencies
- Validate logic

### Integration Tests
- Test component interactions
- Use real data
- Validate workflows

### Validation Tests
- Test error handling
- Test edge cases
- Validate inputs

---

## Performance Considerations

### Caching
- Config loaded once
- Model loaded once
- Data loaded once per session

### Lazy Loading
- Charts generated on demand
- Predictions made on request

### Efficient Operations
- Pandas for data operations
- Vectorized calculations
- Minimal data copying

---

## Security Considerations

### Input Validation
- All inputs validated
- SQL injection prevented (no SQL)
- File path validation

### Error Messages
- No sensitive data in errors
- Generic error messages
- Detailed logs (secure location)

### File Access
- Controlled file paths
- No arbitrary file access
- Validated file operations

---

## Scalability

### Current Scale
- Handles thousands of records
- Multiple visualizations
- Real-time predictions

### Future Scale
- Can add database support
- Can add caching layer
- Can add API endpoints
- Can add batch predictions

---

## Maintenance

### Easy to Maintain
- Clear code structure
- Comprehensive logging
- Good documentation
- Modular design

### Easy to Debug
- Detailed logs
- Clear error messages
- Validation at every step
- Test scripts included

### Easy to Extend
- Modular architecture
- Clear interfaces
- Configuration-driven
- Well-documented

---

**This architecture ensures the application is robust, maintainable, and scalable while remaining simple and beginner-friendly.**
