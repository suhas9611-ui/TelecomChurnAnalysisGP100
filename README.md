# 📊 Customer Churn Analysis Platform

A comprehensive machine learning platform for analyzing customer churn patterns, predicting customer behavior, and analyzing customer feedback sentiment.

## 🚀 Features

### 📈 Dashboard Analytics
- **Real-time Metrics**: Customer count, churn rate, revenue impact
- **Interactive Visualizations**: Dual-panel dashboard with comprehensive charts
- **Geographic Analysis**: Location-based churn patterns
- **Demographic Insights**: Customer segmentation and behavior analysis

### 🎯 Churn Prediction
- **Individual Predictions**: Single customer churn probability analysis
- **Batch Processing**: CSV upload for multiple customer predictions
- **Risk Assessment**: Automated risk categorization (High/Medium/Low)
- **Feature Importance**: Key factors influencing churn decisions
- **Retention Recommendations**: Personalized strategies for customer retention

### 💬 Sentiment Analysis
- **Real-time Analysis**: Instant sentiment classification of customer feedback
- **Complaint Categorization**: Automatic classification by service area
- **Trend Monitoring**: Historical sentiment and complaint volume tracking
- **Multi-channel Support**: Analysis across email, phone, chat, and social media

### 📊 Advanced Analytics
- **Cohort Analysis**: Customer retention patterns over time
- **Trend Forecasting**: Historical patterns and future projections
- **Customer Segmentation**: Risk-based customer categorization
- **Performance KPIs**: Comprehensive business metrics dashboard

## 🏗️ Architecture

### Project Structure
```
TelecomChurnAnalysisGP100/
├── backend/                    # Flask API Backend
│   ├── api/                   # API routes and endpoints
│   │   ├── __init__.py
│   │   └── routes.py          # Main API routes
│   ├── utils/                 # Utility modules
│   │   ├── __init__.py
│   │   ├── data_processor.py  # Data processing utilities
│   │   ├── model_predictor.py # ML model predictions
│   │   └── sentiment_analyzer.py # Sentiment analysis
│   ├── models/                # ML models and artifacts
│   │   └── churn_model.pkl    # Trained churn prediction model
│   ├── config/                # Configuration files
│   │   ├── settings.yaml      # Application settings
│   │   └── validation_rules.yaml # Data validation rules
│   ├── __init__.py
│   └── main.py               # Application entry point
├── frontend/                  # Modern Web Dashboard
│   ├── assets/               # Static assets
│   │   ├── css/             # Stylesheets
│   │   │   ├── main.css     # Base styles and utilities
│   │   │   ├── dashboard.css # Dashboard-specific styles
│   │   │   ├── analytics.css # Analytics page styles
│   │   │   ├── predictions.css # Predictions page styles
│   │   │   └── complaints.css # Complaints page styles
│   │   └── js/              # JavaScript modules
│   │       ├── config.js    # Application configuration
│   │       ├── api.js       # API client and services
│   │       ├── utils.js     # Utility functions
│   │       ├── dashboard.js # Dashboard functionality
│   │       ├── analytics.js # Analytics functionality
│   │       ├── predictions.js # Predictions functionality
│   │       └── complaints.js # Complaints functionality
│   ├── index.html           # Main dashboard
│   ├── analytics.html       # Advanced analytics
│   ├── predictions.html     # Churn predictions
│   ├── complaints.html      # Sentiment analysis
│   └── README.md           # Frontend documentation
├── data/                    # Data files
│   ├── customers.csv       # Customer data
│   ├── complaints.csv      # Complaints data
│   └── WA_Fn-UseC_-Telco-Customer-Churn.csv # Main dataset
├── docs/                   # Documentation
├── notebooks/              # Jupyter notebooks for analysis
├── logs/                   # Application logs
├── venv/                   # Python virtual environment
├── .env.example           # Environment variables template
├── .gitignore            # Git ignore rules
├── requirements.txt      # Python dependencies
└── README.md            # This file
```

## 🛠️ Technology Stack

### Backend
- **Framework**: Flask 3.0+ with Flask-CORS
- **Machine Learning**: scikit-learn, pandas, numpy
- **Data Processing**: pandas, numpy
- **Configuration**: PyYAML, python-dotenv
- **Model Persistence**: joblib

### Frontend
- **Core**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **Visualizations**: Plotly.js for interactive charts
- **Styling**: Modern CSS with CSS Grid and Flexbox
- **Typography**: Inter font family
- **Icons**: Unicode emojis for lightweight design

### Development
- **Environment**: Python 3.8+ virtual environment
- **API**: RESTful API with JSON responses
- **CORS**: Cross-origin resource sharing enabled
- **Logging**: Structured logging with file and console output

## 🚀 Quick Start

### Prerequisites
- Python 3.8 or higher
- Modern web browser (Chrome, Firefox, Safari, Edge)
- 4GB RAM minimum, 8GB recommended

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd TelecomChurnAnalysisGP100
   ```

2. **Set up virtual environment**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the platform**
   ```bash
   python run.py
   ```

5. **Access the application**
   - Frontend: http://localhost:8000
   - Backend API: http://localhost:5001

## 📊 API Endpoints

### Dashboard & Analytics
- `GET /` - Health check
- `GET /dashboard_data` - Dashboard metrics and charts
- `GET /analytics_data` - Advanced analytics data
- `GET /customer_data` - Paginated customer data

### Predictions
- `POST /predict` - Single customer churn prediction
- `POST /batch_predict` - Batch predictions (JSON or CSV)

### Sentiment Analysis
- `POST /analyze_sentiment` - Analyze complaint sentiment
- `GET /complaints_data` - Complaints and sentiment data

### Example API Usage

```bash
# Single prediction
curl -X POST http://localhost:5000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "tenure": 12,
    "MonthlyCharges": 65.50,
    "TotalCharges": 786.00,
    "Contract": "Month-to-month",
    "PaymentMethod": "Electronic check"
  }'

# Sentiment analysis
curl -X POST http://localhost:5000/analyze_sentiment \
  -H "Content-Type: application/json" \
  -d '{"text": "The service is terrible and slow"}'
```

## 🎨 Frontend Features

### Responsive Design
- **Desktop**: Full dual-panel dashboard layout
- **Tablet**: Stacked panels with optimized navigation
- **Mobile**: Single-column layout with touch-friendly controls

### Interactive Charts
- **Real-time Updates**: Auto-refresh every 5 minutes
- **Export Functionality**: Download charts and data as CSV/PNG
- **Filtering**: Advanced filtering and search capabilities
- **Drill-down**: Click charts to explore detailed data

### User Experience
- **Loading States**: Smooth loading animations and progress indicators
- **Error Handling**: User-friendly error messages and retry options
- **Accessibility**: Semantic HTML and keyboard navigation support
- **Performance**: Optimized for fast loading and smooth interactions

## 🔧 Configuration

### Environment Variables (.env)
```bash
# Flask Configuration
FLASK_ENV=development
FLASK_DEBUG=True
FLASK_HOST=localhost
FLASK_PORT=5000

# Model Configuration
MODEL_PATH=backend/models/churn_model.pkl
DATA_PATH=data/

# Logging
LOG_LEVEL=INFO
LOG_FILE=logs/app.log

# CORS Origins
CORS_ORIGINS=http://localhost:3000,http://localhost:8000
```

### Frontend Configuration (assets/js/config.js)
```javascript
const CONFIG = {
    API: {
        BASE_URL: 'http://localhost:5000',
        TIMEOUT: 30000
    },
    FEATURES: {
        REAL_TIME_UPDATES: true,
        EXPORT_FUNCTIONALITY: true,
        BATCH_PREDICTIONS: true
    }
};
```

## 📈 Model Performance

### Churn Prediction Model
- **Algorithm**: Random Forest Classifier
- **Features**: 12 key customer attributes
- **Accuracy**: ~85% on test data
- **Precision**: ~82% for churn prediction
- **Recall**: ~78% for churn identification

### Sentiment Analysis
- **Method**: Rule-based with keyword matching
- **Categories**: Positive, Neutral, Negative
- **Confidence**: 75-95% typical range
- **Languages**: English (extensible to other languages)

## 🧪 Testing

### Manual Testing Checklist
- [ ] Backend API endpoints respond correctly
- [ ] Frontend loads and displays data
- [ ] Charts render on all screen sizes
- [ ] Prediction forms validate input
- [ ] CSV upload processes files
- [ ] Sentiment analysis returns results
- [ ] Export functionality works
- [ ] Error handling displays appropriate messages

### API Testing
```bash
# Test health endpoint
curl http://localhost:5000/

# Test dashboard data
curl http://localhost:5000/dashboard_data

# Test prediction with sample data
curl -X POST http://localhost:5000/predict \
  -H "Content-Type: application/json" \
  -d @sample_customer.json
```

## 🚀 Deployment

### Production Setup
1. **Environment Configuration**
   ```bash
   export FLASK_ENV=production
   export FLASK_DEBUG=False
   ```

2. **Web Server** (using Gunicorn)
   ```bash
   pip install gunicorn
   gunicorn -w 4 -b 0.0.0.0:5000 backend.main:create_app()
   ```

3. **Frontend Deployment**
   - Deploy static files to web server (Nginx, Apache)
   - Configure HTTPS and caching headers
   - Update API base URL in config.js

### Docker Deployment (Optional)
```dockerfile
# Dockerfile example
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 5000
CMD ["python", "backend/main.py"]
```

## 🤝 Contributing

### Development Guidelines
1. **Code Style**: Follow PEP 8 for Python, ESLint for JavaScript
2. **Documentation**: Update README and inline comments
3. **Testing**: Test on multiple browsers and screen sizes
4. **Performance**: Optimize for mobile and slow connections

### Adding New Features
1. **Backend**: Add routes in `backend/api/routes.py`
2. **Frontend**: Create new modules in `frontend/assets/js/`
3. **Styling**: Add styles in appropriate CSS files
4. **Documentation**: Update README and API documentation

## 📚 Data Sources

### Customer Data
- **Source**: Telco Customer Churn Dataset
- **Records**: ~7,000 customers
- **Features**: Demographics, services, contract details, charges
- **Target**: Churn (Yes/No)

### Complaints Data
- **Source**: Generated sample data (extensible to real data)
- **Features**: Customer ID, date, category, channel, sentiment, text
- **Categories**: Service, Billing, Technical, Product, Support

## 🔒 Security Considerations

### API Security
- **CORS**: Configured for specific origins
- **Input Validation**: Server-side validation for all inputs
- **Error Handling**: No sensitive information in error messages
- **Rate Limiting**: Consider implementing for production

### Data Privacy
- **No PII Storage**: Customer data processed in memory only
- **Secure Transmission**: HTTPS recommended for production
- **Data Retention**: Logs rotated and cleaned regularly

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **scikit-learn** for machine learning capabilities
- **Flask** for the web framework
- **Plotly.js** for interactive visualizations
- **Inter Font** by Rasmus Andersson for typography
- **Telco Customer Churn Dataset** for sample data

## 📞 Support

For questions, issues, or contributions:
1. Check the documentation in the `docs/` folder
2. Review existing issues in the repository
3. Create a new issue with detailed description
4. Follow the contributing guidelines

---

**Built with ❤️ for data-driven customer retention strategies**