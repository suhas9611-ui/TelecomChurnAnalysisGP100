# Document 1: Project Overview & Introduction

## 📋 Table of Contents
1. [What is This Project?](#what-is-this-project)
2. [Key Features](#key-features)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Use Cases](#use-cases)
6. [Getting Started](#getting-started)

---

## What is This Project?

The **Customer Churn Prediction Dashboard** is a full-stack web application designed to help businesses predict and analyze customer churn (when customers stop using a service). It combines machine learning predictions with interactive data visualizations to provide actionable insights.

### Problem It Solves
- **Customer Retention**: Identifies customers likely to leave before they do
- **Data-Driven Decisions**: Provides visual insights into churn patterns
- **Proactive Action**: Enables targeted retention strategies
- **Cost Savings**: Reduces customer acquisition costs by retaining existing customers

### Who Is It For?
- **Business Analysts**: Analyze churn patterns and trends
- **Customer Success Teams**: Identify at-risk customers
- **Data Scientists**: Understand model predictions
- **Product Managers**: Make data-driven product decisions

---

## Key Features

### 1. **Dual Dashboard System**
- **Churn Dashboard**: Main analytics and prediction interface
- **Complaints Dashboard**: Customer feedback analysis with sentiment tracking

### 2. **Real-Time Predictions**
- Individual customer churn probability calculation
- Section-based predictions (Demographics, Services, Usage, Payment)
- Combined prediction using all customer data
- Confidence scores for each prediction

### 3. **Interactive Visualizations**
- Pie charts showing churn distribution across different categories
- Real-time metric cards (Total Customers, Churned Customers, Churn Rate)
- Responsive charts that adapt to screen size

### 4. **Smart Form System**
- Organized into logical sections (Customer Info, Demographics, Services, etc.)
- Individual section predictions with default values
- Input validation with helpful error messages
- Auto-generated Customer IDs

### 5. **Complaints Analytics**
- Sentiment analysis (Positive, Negative, Neutral)
- Category-based complaint tracking
- Channel distribution analysis
- Searchable and filterable complaint list

### 6. **Production-Ready Features**
- Comprehensive logging system
- Input validation and error handling
- Configuration management via YAML
- Modular architecture for easy maintenance

---

## Technology Stack

### Backend (Python)
```
Flask 3.0.0          - Web framework
Flask-CORS 4.0.0     - Cross-origin resource sharing
Pandas 2.0.0         - Data manipulation
Scikit-learn 1.3.0   - Machine learning
PyYAML 6.0           - Configuration management
```

### Frontend (JavaScript)
```
Vanilla JavaScript   - No framework dependencies
Plotly.js 2.26.0    - Interactive charts
HTML5 & CSS3        - Modern web standards
```

### Data Storage
```
CSV Files           - Customer and complaints data
Pickle Files        - Trained ML models
YAML Files          - Configuration settings
```

---

## Project Structure

```
project-root/
│
├── app/                          # Backend application code
│   ├── core/                     # Core business logic
│   │   ├── data_loader.py       # Data loading and processing
│   │   └── model_manager.py     # ML model management
│   │
│   └── utils/                    # Utility modules
│       ├── config_loader.py     # Configuration management
│       ├── logger.py            # Logging system
│       └── validators.py        # Data validation
│
├── frontend/                     # Frontend web application
│   ├── css/                     # Stylesheets
│   │   ├── styles.css          # Main dashboard styles
│   │   └── complaints.css      # Complaints dashboard styles
│   │
│   ├── js/                      # JavaScript modules
│   │   ├── api.js              # API communication
│   │   ├── charts.js           # Chart rendering
│   │   ├── prediction.js       # Prediction logic
│   │   ├── main.js             # Main app initialization
│   │   ├── complaints.js       # Complaints functionality
│   │   ├── complaints-charts.js # Complaints visualizations
│   │   └── config.js           # Frontend configuration
│   │
│   ├── index.html              # Main dashboard page
│   └── complaints.html         # Complaints dashboard page
│
├── config/                       # Configuration files
│   ├── settings.yaml           # Application settings
│   └── validation_rules.yaml   # Input validation rules
│
├── data/                        # Data files
│   ├── customers.csv           # Customer data
│   └── complaints.csv          # Complaints data
│
├── models/                      # Machine learning models
│   └── churn_model.pkl         # Trained churn prediction model
│
├── logs/                        # Application logs
│   └── app.log                 # Runtime logs
│
├── server.py                    # Flask API server
├── requirements.txt             # Python dependencies
└── run_web_dashboard.bat       # Windows startup script
```

---

## Use Cases

### 1. **Customer Success Manager**
**Scenario**: Identify at-risk customers for proactive outreach

**Workflow**:
1. Open the dashboard to view overall churn metrics
2. Analyze charts to identify high-risk customer segments
3. Use prediction form to assess individual customer risk
4. Review complaints dashboard for customer pain points
5. Create targeted retention campaigns

### 2. **Data Analyst**
**Scenario**: Analyze churn patterns and trends

**Workflow**:
1. Review metric cards for high-level statistics
2. Examine pie charts for churn distribution by category
3. Identify correlations between services and churn
4. Export insights for reporting
5. Monitor trends over time

### 3. **Product Manager**
**Scenario**: Understand which features impact retention

**Workflow**:
1. Analyze churn by service type (Internet, Phone, etc.)
2. Review complaints by category
3. Identify product improvement opportunities
4. Test predictions with different feature combinations
5. Prioritize feature development

### 4. **Sales Team**
**Scenario**: Optimize customer acquisition strategy

**Workflow**:
1. Identify characteristics of retained customers
2. Analyze contract types with lowest churn
3. Review payment methods and their impact
4. Develop ideal customer profile
5. Target similar prospects

---

## Getting Started

### Prerequisites
```bash
# Required Software
- Python 3.8 or higher
- pip (Python package manager)
- Modern web browser (Chrome, Firefox, Edge, Safari)
```

### Quick Start (3 Steps)

#### Step 1: Install Dependencies
```bash
pip install -r requirements.txt
```

#### Step 2: Start the Server
```bash
python server.py
```

#### Step 3: Open Browser
```
Navigate to: http://localhost:5000
```

### What You'll See
1. **Header**: Dashboard title and navigation
2. **Metrics**: Three key statistics cards
3. **Charts**: Six interactive pie charts
4. **Prediction Form**: Customer data input sections
5. **Results**: Prediction output with confidence scores

---

## Key Concepts

### What is Churn?
**Churn** occurs when a customer stops using your service. It's measured as:
```
Churn Rate = (Customers Lost / Total Customers) × 100
```

### How Predictions Work
1. **Input**: Customer characteristics (age, tenure, services, etc.)
2. **Processing**: Machine learning model analyzes patterns
3. **Output**: Probability score (0-100%) that customer will churn
4. **Action**: Use score to prioritize retention efforts

### Prediction Confidence
- **High Confidence (>80%)**: Model is very certain
- **Medium Confidence (60-80%)**: Model is moderately certain
- **Low Confidence (<60%)**: Model is uncertain, use caution

---

## Success Metrics

### Business Impact
- **Reduced Churn Rate**: Lower percentage of customers leaving
- **Increased Revenue**: More retained customers = more recurring revenue
- **Better ROI**: Retention is cheaper than acquisition
- **Improved Satisfaction**: Proactive support prevents issues

### Technical Performance
- **Fast Predictions**: Results in under 1 second
- **High Accuracy**: Model trained on historical data
- **Scalable**: Handles thousands of predictions
- **Reliable**: Comprehensive error handling

---

## Next Steps

After understanding this overview:

1. **Read Document 2**: Learn the complete architecture
2. **Read Document 3**: Understand the backend system
3. **Read Document 4**: Explore the frontend implementation
4. **Read Document 5**: Master deployment and operations

---

## Quick Reference

### Important URLs
- **Main Dashboard**: http://localhost:5000
- **Complaints Dashboard**: http://localhost:5000/complaints.html
- **API Health Check**: http://localhost:5000/api/health

### Key Files to Know
- `server.py` - Main application entry point
- `config/settings.yaml` - Configuration settings
- `app/core/model_manager.py` - Prediction logic
- `frontend/js/main.js` - Frontend initialization

### Common Commands
```bash
# Start server
python server.py

# Check logs
type logs\app.log

# Test API
curl http://localhost:5000/api/health
```

---

## Support & Resources

### Documentation
- Document 1: **Project Overview** (You are here)
- Document 2: **Architecture & Design**
- Document 3: **Backend Deep Dive**
- Document 4: **Frontend Deep Dive**
- Document 5: **Deployment & Operations**

### Troubleshooting
- Check `logs/app.log` for errors
- Verify all dependencies are installed
- Ensure data files exist in `data/` folder
- Confirm model file exists in `models/` folder

---

**Ready to dive deeper? Continue to Document 2: Architecture & Design**
