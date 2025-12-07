# Document 2: Architecture & Design

## 📋 Table of Contents
1. [System Architecture](#system-architecture)
2. [Design Patterns](#design-patterns)
3. [Data Flow](#data-flow)
4. [Component Interactions](#component-interactions)
5. [API Design](#api-design)
6. [Security & Validation](#security--validation)

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        USER BROWSER                          │
│  ┌────────────────┐              ┌────────────────┐        │
│  │  Churn         │              │  Complaints    │        │
│  │  Dashboard     │◄────────────►│  Dashboard     │        │
│  │  (index.html)  │              │(complaints.html)│        │
│  └────────┬───────┘              └────────┬───────┘        │
│           │                               │                 │
│           └───────────────┬───────────────┘                 │
│                           │                                 │
│                    ┌──────▼──────┐                         │
│                    │  JavaScript  │                         │
│                    │   Modules    │                         │
│                    │ (API, Charts,│                         │
│                    │  Prediction) │                         │
│                    └──────┬───────┘                         │
└───────────────────────────┼─────────────────────────────────┘
                            │ HTTP/JSON
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                     FLASK API SERVER                         │
│                       (server.py)                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              REST API ENDPOINTS                       │  │
│  │  /api/health  /api/stats  /api/predict  /api/charts │  │
│  └────────┬──────────────────────────────┬──────────────┘  │
│           │                               │                 │
│  ┌────────▼────────┐           ┌─────────▼────────┐       │
│  │  Data Loader    │           │  Model Manager   │       │
│  │  (data_loader)  │           │ (model_manager)  │       │
│  └────────┬────────┘           └─────────┬────────┘       │
│           │                               │                 │
│  ┌────────▼────────┐           ┌─────────▼────────┐       │
│  │   Validators    │           │   Config Loader  │       │
│  │  (validators)   │           │ (config_loader)  │       │
│  └─────────────────┘           └──────────────────┘       │
└───────────────────────────────────────────────────────────┘
                            │
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                      DATA LAYER                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  CSV Files   │  │  ML Models   │  │  Config      │     │
│  │  (data/)     │  │  (models/)   │  │  (config/)   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### Architecture Layers

#### 1. **Presentation Layer** (Frontend)
- **Technology**: HTML5, CSS3, Vanilla JavaScript
- **Responsibility**: User interface and interaction
- **Components**:
  - HTML pages (index.html, complaints.html)
  - CSS stylesheets (styles.css, complaints.css)
  - JavaScript modules (api.js, charts.js, prediction.js, main.js)

#### 2. **Application Layer** (Backend)
- **Technology**: Flask (Python)
- **Responsibility**: Business logic and API endpoints
- **Components**:
  - REST API server (server.py)
  - Core modules (data_loader, model_manager)
  - Utility modules (validators, logger, config_loader)

#### 3. **Data Layer**
- **Technology**: CSV files, Pickle files, YAML files
- **Responsibility**: Data storage and persistence
- **Components**:
  - Customer data (customers.csv)
  - Complaints data (complaints.csv)
  - ML model (churn_model.pkl)
  - Configuration (settings.yaml)

---

## Design Patterns

### 1. **Model-View-Controller (MVC) Pattern**

```
┌─────────────┐
│    VIEW     │  ← Frontend (HTML/CSS/JS)
│  (Frontend) │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ CONTROLLER  │  ← Flask API (server.py)
│  (API)      │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│    MODEL    │  ← Core modules (data_loader, model_manager)
│  (Backend)  │
└─────────────┘
```

**Benefits**:
- Separation of concerns
- Easy to test and maintain
- Flexible to change UI without affecting logic

### 2. **Module Pattern** (Frontend)

Each JavaScript file is a self-contained module:

```javascript
const API = {
    // Encapsulated methods
    async request() { ... },
    async getStats() { ... }
};

const Charts = {
    // Encapsulated methods
    async loadCharts() { ... },
    renderChart() { ... }
};
```

**Benefits**:
- Namespace isolation
- Reusable components
- Clear dependencies

### 3. **Singleton Pattern** (Backend)

Configuration and logger are singletons:

```python
# config_loader.py
config = ConfigLoader()  # Single instance

# logger.py
logger = AppLogger()  # Single instance
```

**Benefits**:
- Single source of truth
- Consistent state across application
- Easy to access globally

### 4. **Strategy Pattern** (Validation)

Different validation strategies for different data types:

```python
class DataValidator:
    @staticmethod
    def validate_csv() { ... }
    
    @staticmethod
    def validate_model() { ... }
    
    @staticmethod
    def validate_churn_column() { ... }
```

**Benefits**:
- Flexible validation rules
- Easy to add new validators
- Testable in isolation

### 5. **Factory Pattern** (Form Generation)

Dynamic form field creation based on feature type:

```javascript
createFormField(feature) {
    if (feature.type === 'categorical') {
        return createSelectField(feature);
    } else {
        return createNumberField(feature);
    }
}
```

**Benefits**:
- Dynamic UI generation
- Consistent field creation
- Easy to extend

---

## Data Flow

### 1. **Page Load Flow**

```
User Opens Browser
       │
       ▼
Load HTML/CSS/JS
       │
       ▼
Initialize App (main.js)
       │
       ├──► Check API Health (/api/health)
       │
       ├──► Load Configuration (/api/config)
       │
       ├──► Load Statistics (/api/stats)
       │         │
       │         └──► Update Metric Cards
       │
       ├──► Load Charts (/api/charts)
       │         │
       │         └──► Render Plotly Charts
       │
       └──► Load Prediction Form (/api/model/features)
                 │
                 └──► Generate Form Fields
```

### 2. **Prediction Flow**

```
User Fills Form
       │
       ▼
User Clicks "Predict"
       │
       ▼
Collect Form Data (prediction.js)
       │
       ▼
Validate Input (Frontend)
       │
       ├──► Invalid: Show Error
       │
       └──► Valid: Send to API
                 │
                 ▼
            POST /api/predict
                 │
                 ▼
            Validate Input (Backend)
                 │
                 ├──► Invalid: Return Error
                 │
                 └──► Valid: Process
                          │
                          ▼
                     Load Model
                          │
                          ▼
                     Encode Categorical Data
                          │
                          ▼
                     Make Prediction
                          │
                          ▼
                     Return Result (JSON)
                          │
                          ▼
                     Display Result (Frontend)
```

### 3. **Data Processing Flow**

```
CSV File (customers.csv)
       │
       ▼
DataLoader.load_customer_data()
       │
       ├──► Validate CSV exists
       │
       ├──► Load with Pandas
       │
       ├──► Sanitize DataFrame
       │
       ├──► Detect Churn Column
       │
       ├──► Validate Churn Column
       │
       └──► Normalize to Binary (0/1)
                 │
                 ▼
            Store in Memory
                 │
                 ▼
            Ready for API Requests
```

---

## Component Interactions

### Backend Components

```
┌─────────────────────────────────────────────────────────┐
│                      server.py                           │
│  ┌────────────────────────────────────────────────┐    │
│  │  Flask App Initialization                       │    │
│  │  - CORS setup                                   │    │
│  │  - Component initialization                     │    │
│  │  - Data/Model loading                          │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │  API Endpoints                                  │    │
│  │  - Health check                                 │    │
│  │  - Statistics                                   │    │
│  │  - Charts data                                  │    │
│  │  - Model features                               │    │
│  │  - Predictions                                  │    │
│  │  - Complaints                                   │    │
│  └────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
                    │                    │
        ┌───────────┴──────────┬─────────┴──────────┐
        │                      │                     │
        ▼                      ▼                     ▼
┌──────────────┐      ┌──────────────┐     ┌──────────────┐
│ DataLoader   │      │ModelManager  │     │ Validators   │
│              │      │              │     │              │
│ - Load CSV   │      │ - Load Model │     │ - Validate   │
│ - Process    │      │ - Predict    │     │   Input      │
│ - Stats      │      │ - Encode     │     │ - Validate   │
│              │      │              │     │   Ranges     │
└──────┬───────┘      └──────┬───────┘     └──────┬───────┘
       │                     │                     │
       └─────────────────────┴─────────────────────┘
                             │
                             ▼
                    ┌──────────────┐
                    │ConfigLoader  │
                    │              │
                    │ - Load YAML  │
                    │ - Get Values │
                    └──────────────┘
```

### Frontend Components

```
┌─────────────────────────────────────────────────────────┐
│                      main.js                             │
│  ┌────────────────────────────────────────────────┐    │
│  │  App Initialization                             │    │
│  │  - Check health                                 │    │
│  │  - Load config                                  │    │
│  │  - Coordinate modules                          │    │
│  └────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
                    │
        ┌───────────┼───────────┬───────────┐
        │           │           │           │
        ▼           ▼           ▼           ▼
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│  api.js  │ │charts.js │ │prediction│ │config.js │
│          │ │          │ │   .js    │ │          │
│ - Fetch  │ │ - Render │ │ - Form   │ │ - URLs   │
│ - Error  │ │ - Plotly │ │ - Predict│ │ - Config │
│ - Format │ │ - Update │ │ - Display│ │          │
└──────────┘ └──────────┘ └──────────┘ └──────────┘
```

---

## API Design

### RESTful Principles

The API follows REST conventions:

| Method | Endpoint | Purpose | Returns |
|--------|----------|---------|---------|
| GET | /api/health | Check system status | Health status |
| GET | /api/config | Get configuration | Config object |
| GET | /api/stats | Get statistics | Stats object |
| GET | /api/charts | Get chart data | Charts array |
| GET | /api/model/features | Get model features | Features array |
| POST | /api/predict | Make prediction | Prediction result |
| GET | /api/complaints | Get complaints | Complaints array |
| GET | /api/complaints/stats | Get complaint stats | Stats object |
| POST | /api/complaints/analyze-sentiment | Analyze text | Sentiment result |

### Request/Response Format

#### Example: Prediction Request

**Request**:
```json
POST /api/predict
Content-Type: application/json

{
  "CustomerID": "CUST100001",
  "Age": 35,
  "Gender": "Male",
  "TenureMonths": 24,
  "MonthlyCharges": 65.50,
  "ContractType": "One year",
  "InternetService": "Fiber",
  ...
}
```

**Response** (Success):
```json
{
  "prediction": 0,
  "probability": 0.23,
  "confidence": 0.77
}
```

**Response** (Error):
```json
{
  "error": "Validation Error: Age must be between 18 and 100"
}
```

### Error Handling Strategy

```
┌─────────────────────────────────────────┐
│         Error Occurs                     │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│    Log Error (logger.py)                │
│    - Timestamp                          │
│    - Error message                      │
│    - Stack trace                        │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│    Return JSON Error Response           │
│    {                                    │
│      "error": "Descriptive message"    │
│    }                                    │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│    Frontend Displays Error Toast        │
│    - User-friendly message              │
│    - Auto-dismiss after 5 seconds       │
└─────────────────────────────────────────┘
```

---

## Security & Validation

### Input Validation Layers

#### Layer 1: Frontend Validation (JavaScript)
```javascript
// Immediate feedback
- HTML5 input attributes (min, max, required)
- JavaScript validation before API call
- User-friendly error messages
```

#### Layer 2: Backend Validation (Python)
```python
# Server-side enforcement
- Type checking
- Range validation
- Format validation
- Business rule validation
```

#### Layer 3: Data Validation (Pandas)
```python
# Data integrity
- DataFrame sanitization
- Null value handling
- Type conversion
- Outlier detection
```

### Validation Rules

#### Numeric Fields
```yaml
Age:
  min: 18
  max: 100
  type: integer

MonthlyCharges:
  min: 0
  max: 2000
  type: float

TenureMonths:
  min: 0
  max: 120
  type: integer
```

#### Categorical Fields
```yaml
Gender:
  allowed: [Male, Female, None]

ContractType:
  allowed: [Month-to-month, One year, Two year, None]

InternetService:
  allowed: [DSL, Fiber, None]
```

#### CustomerID Format
```python
Pattern: CUSTXXXXXX
Where: X = digit (0-9)
Range: CUST100000 to CUST200000
Example: CUST100001
```

### Security Measures

1. **CORS Configuration**
   - Controlled cross-origin access
   - Prevents unauthorized API access

2. **Input Sanitization**
   - Remove dangerous characters
   - Prevent injection attacks

3. **Error Message Safety**
   - No sensitive data in errors
   - Generic messages for security issues

4. **Logging**
   - Track all API requests
   - Monitor for suspicious activity

---

## Configuration Management

### YAML-Based Configuration

```yaml
# settings.yaml structure

paths:                    # File locations
  model: "..."
  customer_data: "..."
  
data:                     # Data processing rules
  churn_column: "..."
  churn_positive_values: [...]
  
dashboard:                # UI settings
  title: "..."
  metrics: [...]
  
visualizations:           # Chart settings
  max_charts: 6
  priority_columns: [...]
  
prediction:               # ML settings
  probability_threshold: 0.5
  
logging:                  # Logging settings
  level: "INFO"
```

### Configuration Access Pattern

```python
# Backend
from app.utils.config_loader import config

# Get simple value
title = config.get('dashboard.title')

# Get with default
max_charts = config.get('visualizations.max_charts', 6)

# Get file path (auto-resolves relative to project root)
model_path = config.get_path('paths.model')
```

---

## Performance Considerations

### Optimization Strategies

1. **Lazy Loading**
   - Load data only when needed
   - Cache in memory after first load

2. **Async Operations**
   - Non-blocking API calls
   - Parallel data fetching

3. **Efficient Data Structures**
   - Pandas DataFrames for bulk operations
   - Dictionary lookups for fast access

4. **Client-Side Caching**
   - Store model features after first fetch
   - Reuse chart configurations

### Scalability

```
Current: Single-server deployment
Future: Can scale to:
  - Load balancer
  - Multiple Flask instances
  - Database backend
  - Caching layer (Redis)
  - Message queue (Celery)
```

---

## Next Steps

Continue to **Document 3: Backend Deep Dive** to understand:
- Detailed code walkthrough
- Module implementations
- API endpoint logic
- Data processing pipelines
