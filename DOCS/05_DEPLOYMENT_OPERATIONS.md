# Document 5: Deployment & Operations

## 📋 Table of Contents
1. [Installation & Setup](#installation--setup)
2. [Configuration Guide](#configuration-guide)
3. [Running the Application](#running-the-application)
4. [Troubleshooting](#troubleshooting)
5. [Maintenance](#maintenance)
6. [Performance Optimization](#performance-optimization)
7. [Production Deployment](#production-deployment)

---

## Installation & Setup

### System Requirements

#### Minimum Requirements
```
Operating System: Windows 10/11, macOS 10.14+, Linux (Ubuntu 18.04+)
Python: 3.8 or higher
RAM: 4 GB
Disk Space: 500 MB
Browser: Chrome 90+, Firefox 88+, Edge 90+, Safari 14+
```

#### Recommended Requirements
```
Operating System: Windows 11, macOS 12+, Ubuntu 22.04+
Python: 3.10 or higher
RAM: 8 GB
Disk Space: 1 GB
Browser: Latest version of Chrome, Firefox, or Edge
```

### Step-by-Step Installation

#### Step 1: Verify Python Installation

```bash
# Check Python version
python --version

# Should output: Python 3.8.x or higher
```

**If Python is not installed**:
- Windows: Download from https://www.python.org/downloads/
- macOS: `brew install python3`
- Linux: `sudo apt-get install python3 python3-pip`

#### Step 2: Clone or Download Project

```bash
# If using Git
git clone <repository-url>
cd <project-folder>

# Or download and extract ZIP file
```

#### Step 3: Create Virtual Environment (Recommended)

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate

# macOS/Linux:
source venv/bin/activate
```

**Why Virtual Environment?**
- Isolates project dependencies
- Prevents conflicts with other Python projects
- Easy to recreate environment

#### Step 4: Install Dependencies

```bash
# Install all required packages
pip install -r requirements.txt

# Verify installation
pip list
```

**Expected Packages**:
```
Flask==3.0.0
flask-cors==4.0.0
pandas==2.0.0
scikit-learn==1.3.0
PyYAML==6.0
python-dateutil==2.8.2
```

#### Step 5: Verify Data Files

```bash
# Check that required files exist
data/customers.csv          # Customer data
data/complaints.csv         # Complaints data
models/churn_model.pkl      # Trained ML model
config/settings.yaml        # Configuration
```

**If Files Are Missing**:
- Customer data: Required for dashboard to work
- Complaints data: Optional, complaints dashboard won't work
- Model file: Required for predictions
- Config file: Will use defaults if missing

#### Step 6: Test Installation

```bash
# Run test script
python test_setup.py

# Should output:
# ✓ Python version OK
# ✓ All dependencies installed
# ✓ Data files found
# ✓ Model file found
# ✓ Configuration loaded
```

---

## Configuration Guide

### Configuration File: `config/settings.yaml`

#### File Paths Section

```yaml
paths:
  model: "models/churn_model.pkl"        # ML model location
  customer_data: "data/customers.csv"    # Customer data location
  log_file: "logs/app.log"               # Log file location
```

**When to Modify**:
- Using different file names
- Storing data in different locations
- Multiple environments (dev, staging, prod)

#### Data Configuration Section

```yaml
data:
  churn_column: "Churn"                  # Name of churn column in CSV
  churn_positive_values: ["Yes", "1", 1] # Values indicating churn
  churn_negative_values: ["No", "0", 0]  # Values indicating retention
  
  exclude_from_charts:                   # Columns to hide from charts
    - "CustomerID"
    - "ChurnProb"
    - "Churn"
    - "Gender"
```

**When to Modify**:
- Different column names in your data
- Different churn indicators (e.g., "Churned", "Left")
- Want to show/hide different columns in charts

#### Dashboard Settings Section

```yaml
dashboard:
  title: "Customer Churn Dashboard"      # Dashboard title
  page_icon: "📊"                        # Icon in header
  layout: "wide"                         # Layout style
  
  metrics:                               # Metrics to display
    - name: "Total Customers"
      type: "count"
    - name: "Churned Customers"
      type: "churn_count"
    - name: "Churn Rate (%)"
      type: "churn_rate"
```

**When to Modify**:
- Customizing dashboard appearance
- Adding/removing metrics
- Changing titles

#### Visualization Settings Section

```yaml
visualizations:
  max_charts: 6                          # Maximum number of charts
  chart_height: 400                      # Chart height in pixels
  
  priority_columns:                      # Columns to show first
    - "ContractType"
    - "InternetService"
    - "PlanType"
    - "PaymentMethod"
    - "Region"
    - "TenureMonths"
```

**When to Modify**:
- Want more/fewer charts
- Different chart priorities
- Adjust chart size

#### Prediction Settings Section

```yaml
prediction:
  probability_threshold: 0.5             # Threshold for churn classification
  min_iterations: 100                    # Minimum test iterations
```

**When to Modify**:
- Adjusting sensitivity (lower = more sensitive)
- Testing requirements

#### Logging Settings Section

```yaml
logging:
  level: "INFO"                          # Log level (DEBUG, INFO, WARNING, ERROR)
  format: "%(asctime)s - %(levelname)s - %(message)s"
  max_file_size_mb: 10                   # Max log file size
```

**When to Modify**:
- Debugging (use DEBUG level)
- Production (use WARNING or ERROR)
- Log file management

### Validation Rules: `config/validation_rules.yaml`

```yaml
numeric_fields:
  Age:
    min: 18
    max: 100
    type: integer
  
  TenureMonths:
    min: 0
    max: 120
    type: integer
  
  MonthlyCharges:
    min: 0
    max: 2000
    type: float

categorical_fields:
  Gender:
    allowed_values:
      - Male
      - Female
      - None
  
  ContractType:
    allowed_values:
      - Month-to-month
      - One year
      - Two year
      - None
```

**When to Modify**:
- Different data ranges
- New categorical values
- Custom validation rules

---

## Running the Application

### Method 1: Using Python Directly

```bash
# Start the server
python server.py

# Output:
# ==================================================
# Starting Flask API Server
# ==================================================
# Data loaded: True
# Model loaded: True
# Server running on http://localhost:5000
# ==================================================
```

### Method 2: Using Batch File (Windows)

```bash
# Double-click or run:
run_web_dashboard.bat

# This script:
# 1. Activates virtual environment (if exists)
# 2. Starts the server
# 3. Opens browser automatically
```

### Method 3: Using Shell Script (macOS/Linux)

```bash
# Make executable
chmod +x run_web_dashboard.sh

# Run
./run_web_dashboard.sh
```

### Accessing the Dashboard

Once the server is running:

1. **Main Dashboard**: http://localhost:5000
2. **Complaints Dashboard**: http://localhost:5000/complaints.html
3. **API Health Check**: http://localhost:5000/api/health

### Stopping the Server

```bash
# Press Ctrl+C in the terminal

# Or close the terminal window
```

---

## Troubleshooting

### Common Issues and Solutions

#### Issue 1: "Module not found" Error

**Symptom**:
```
ModuleNotFoundError: No module named 'flask'
```

**Solution**:
```bash
# Ensure virtual environment is activated
# Windows:
venv\Scripts\activate

# macOS/Linux:
source venv/bin/activate

# Reinstall dependencies
pip install -r requirements.txt
```

#### Issue 2: "Port 5000 already in use"

**Symptom**:
```
OSError: [Errno 48] Address already in use
```

**Solution**:
```bash
# Option 1: Kill process using port 5000
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux:
lsof -ti:5000 | xargs kill -9

# Option 2: Use different port
# Edit server.py, change last line:
app.run(debug=True, host='0.0.0.0', port=5001)
```

#### Issue 3: "Data not loaded" Warning

**Symptom**:
```
WARNING - Failed to load data: File not found
```

**Solution**:
```bash
# Check file exists
ls data/customers.csv  # macOS/Linux
dir data\customers.csv  # Windows

# Check file path in config
cat config/settings.yaml  # macOS/Linux
type config\settings.yaml  # Windows

# Verify path is correct
```

#### Issue 4: "Model not loaded" Warning

**Symptom**:
```
WARNING - Model loading failed: Model file not found
```

**Solution**:
```bash
# Check model file exists
ls models/churn_model.pkl  # macOS/Linux
dir models\churn_model.pkl  # Windows

# Check model is valid
python -c "import pickle; pickle.load(open('models/churn_model.pkl', 'rb'))"
```

#### Issue 5: Charts Not Displaying

**Symptom**:
- Charts show "Loading..." forever
- Console shows CORS errors

**Solution**:
```javascript
// Check browser console (F12)
// Look for errors

// Common fixes:
1. Ensure server is running
2. Check API URL in config.js
3. Clear browser cache (Ctrl+Shift+Delete)
4. Try different browser
```

#### Issue 6: Predictions Always Return Same Value

**Symptom**:
- All predictions show same probability (e.g., 0.37)
- Logs show "Failed to encode" warnings

**Solution**:
This was the bug we fixed! Ensure you have the latest `model_manager.py` with the two-pass encoding fix.

```python
# Check logs for encoding errors
type logs\app.log  # Windows
cat logs/app.log   # macOS/Linux

# Look for:
# "Failed to encode column 'Gender': y contains previously unseen labels"

# If you see this, update model_manager.py with the fix
```

#### Issue 7: Validation Errors

**Symptom**:
```
Validation Error: Age must be between 18 and 100
```

**Solution**:
```bash
# Check validation rules
cat config/validation_rules.yaml

# Adjust rules if needed
# Or fix input values
```

### Debugging Tips

#### Enable Debug Mode

```python
# In server.py, last line:
app.run(debug=True, host='0.0.0.0', port=5000)
```

**Benefits**:
- Detailed error messages
- Auto-reload on code changes
- Interactive debugger

**Warning**: Never use debug mode in production!

#### Check Logs

```bash
# View recent logs
# Windows:
type logs\app.log

# macOS/Linux:
tail -f logs/app.log  # Follow logs in real-time

# Search logs for errors
# Windows:
findstr "ERROR" logs\app.log

# macOS/Linux:
grep "ERROR" logs/app.log
```

#### Test API Endpoints

```bash
# Test health endpoint
curl http://localhost:5000/api/health

# Test stats endpoint
curl http://localhost:5000/api/stats

# Test prediction endpoint
curl -X POST http://localhost:5000/api/predict \
  -H "Content-Type: application/json" \
  -d '{"Age": 35, "Gender": "Male", ...}'
```

---

## Maintenance

### Regular Maintenance Tasks

#### Daily Tasks

1. **Monitor Logs**
```bash
# Check for errors
grep "ERROR" logs/app.log | tail -20

# Check for warnings
grep "WARNING" logs/app.log | tail -20
```

2. **Check Disk Space**
```bash
# Logs can grow large
du -sh logs/  # macOS/Linux
dir logs      # Windows
```

#### Weekly Tasks

1. **Rotate Logs**
```bash
# Archive old logs
mv logs/app.log logs/app.log.$(date +%Y%m%d)

# Or delete old logs
rm logs/app.log
```

2. **Update Dependencies**
```bash
# Check for updates
pip list --outdated

# Update specific package
pip install --upgrade flask

# Update all packages
pip install --upgrade -r requirements.txt
```

3. **Backup Data**
```bash
# Backup customer data
cp data/customers.csv backups/customers_$(date +%Y%m%d).csv

# Backup model
cp models/churn_model.pkl backups/model_$(date +%Y%m%d).pkl
```

#### Monthly Tasks

1. **Review Configuration**
- Check if settings need adjustment
- Review validation rules
- Update chart priorities

2. **Performance Review**
- Check response times
- Review error rates
- Analyze usage patterns

3. **Security Updates**
```bash
# Check for security vulnerabilities
pip check

# Update to latest secure versions
pip install --upgrade pip
pip install --upgrade -r requirements.txt
```

### Data Management

#### Adding New Data

```bash
# 1. Backup existing data
cp data/customers.csv data/customers_backup.csv

# 2. Add new data to CSV
# Use Excel, Python, or text editor

# 3. Restart server to reload data
# Press Ctrl+C, then:
python server.py
```

#### Updating the Model

```bash
# 1. Train new model (separate process)
python train_model.py

# 2. Backup old model
cp models/churn_model.pkl models/churn_model_backup.pkl

# 3. Replace with new model
cp new_model.pkl models/churn_model.pkl

# 4. Restart server
python server.py
```

---

## Performance Optimization

### Backend Optimization

#### 1. Enable Caching

```python
# Add to server.py
from functools import lru_cache

@lru_cache(maxsize=128)
def get_cached_stats():
    return data_loader.get_churn_stats()
```

#### 2. Use Production Server

```bash
# Install gunicorn
pip install gunicorn

# Run with gunicorn (Linux/macOS)
gunicorn -w 4 -b 0.0.0.0:5000 server:app

# -w 4: Use 4 worker processes
# -b: Bind to address
```

#### 3. Optimize Data Loading

```python
# Load data once at startup (already implemented)
# Use Pandas optimizations
df = pd.read_csv('data/customers.csv', 
                 dtype={'CustomerID': str},
                 low_memory=False)
```

### Frontend Optimization

#### 1. Minimize API Calls

```javascript
// Cache model features after first load
let cachedFeatures = null;

async loadForm() {
    if (cachedFeatures) {
        this.renderForm(cachedFeatures);
        return;
    }
    
    cachedFeatures = await API.getModelFeatures();
    this.renderForm(cachedFeatures);
}
```

#### 2. Lazy Load Charts

```javascript
// Load charts only when visible
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            Charts.loadCharts();
            observer.disconnect();
        }
    });
});

observer.observe(document.getElementById('charts-container'));
```

#### 3. Optimize Chart Rendering

```javascript
// Use Plotly's responsive mode
const config = {
    responsive: true,
    displayModeBar: false  // Hide toolbar for faster rendering
};
```

### Database Optimization (Future)

Currently using CSV files. For better performance with large datasets:

```python
# Option 1: SQLite (built-in)
import sqlite3
conn = sqlite3.connect('data/customers.db')

# Option 2: PostgreSQL (production)
import psycopg2
conn = psycopg2.connect(database="churn", user="user", password="pass")

# Option 3: MongoDB (NoSQL)
from pymongo import MongoClient
client = MongoClient('mongodb://localhost:27017/')
```

---

## Production Deployment

### Deployment Checklist

#### Pre-Deployment

- [ ] All tests passing
- [ ] Configuration reviewed
- [ ] Secrets secured (no passwords in code)
- [ ] Logs configured
- [ ] Backup created
- [ ] Documentation updated

#### Security Hardening

1. **Disable Debug Mode**
```python
# server.py
app.run(debug=False, host='0.0.0.0', port=5000)
```

2. **Use Environment Variables**
```python
import os

# Don't hardcode secrets
SECRET_KEY = os.environ.get('SECRET_KEY')
DATABASE_URL = os.environ.get('DATABASE_URL')
```

3. **Enable HTTPS**
```python
# Use SSL certificate
app.run(ssl_context=('cert.pem', 'key.pem'))
```

4. **Add Authentication**
```python
from flask_httpauth import HTTPBasicAuth
auth = HTTPBasicAuth()

@auth.verify_password
def verify_password(username, password):
    # Implement authentication
    pass

@app.route('/api/predict')
@auth.login_required
def predict():
    # Protected endpoint
    pass
```

### Deployment Options

#### Option 1: Cloud Platform (Heroku)

```bash
# 1. Create Procfile
echo "web: gunicorn server:app" > Procfile

# 2. Create runtime.txt
echo "python-3.10.0" > runtime.txt

# 3. Deploy
heroku create my-churn-dashboard
git push heroku main
```

#### Option 2: Docker Container

```dockerfile
# Dockerfile
FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

EXPOSE 5000

CMD ["python", "server.py"]
```

```bash
# Build and run
docker build -t churn-dashboard .
docker run -p 5000:5000 churn-dashboard
```

#### Option 3: VPS (DigitalOcean, AWS EC2)

```bash
# 1. SSH into server
ssh user@your-server-ip

# 2. Install dependencies
sudo apt-get update
sudo apt-get install python3 python3-pip nginx

# 3. Clone repository
git clone <your-repo>
cd <project>

# 4. Install Python packages
pip3 install -r requirements.txt

# 5. Configure Nginx
sudo nano /etc/nginx/sites-available/churn-dashboard

# 6. Start with systemd
sudo systemctl start churn-dashboard
sudo systemctl enable churn-dashboard
```

### Monitoring

#### Application Monitoring

```python
# Add monitoring endpoint
@app.route('/api/metrics')
def metrics():
    return jsonify({
        'uptime': get_uptime(),
        'requests_total': request_counter,
        'errors_total': error_counter,
        'memory_usage': get_memory_usage()
    })
```

#### Log Monitoring

```bash
# Use log aggregation service
# - Papertrail
# - Loggly
# - ELK Stack

# Or simple monitoring
tail -f logs/app.log | grep ERROR
```

#### Performance Monitoring

```python
# Add timing decorator
import time
from functools import wraps

def timing(f):
    @wraps(f)
    def wrap(*args, **kwargs):
        start = time.time()
        result = f(*args, **kwargs)
        end = time.time()
        logger.info(f'{f.__name__} took {end-start:.2f}s')
        return result
    return wrap

@timing
def predict(input_data):
    # Function code
    pass
```

---

## Backup and Recovery

### Backup Strategy

#### What to Backup

1. **Data Files**
   - `data/customers.csv`
   - `data/complaints.csv`

2. **Model Files**
   - `models/churn_model.pkl`

3. **Configuration**
   - `config/settings.yaml`
   - `config/validation_rules.yaml`

4. **Logs** (optional)
   - `logs/app.log`

#### Backup Script

```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="backups/$DATE"

mkdir -p $BACKUP_DIR

# Backup data
cp -r data/ $BACKUP_DIR/
cp -r models/ $BACKUP_DIR/
cp -r config/ $BACKUP_DIR/

# Create archive
tar -czf $BACKUP_DIR.tar.gz $BACKUP_DIR
rm -rf $BACKUP_DIR

echo "Backup created: $BACKUP_DIR.tar.gz"
```

#### Automated Backups

```bash
# Add to crontab (Linux/macOS)
crontab -e

# Run daily at 2 AM
0 2 * * * /path/to/backup.sh
```

### Recovery Procedure

```bash
# 1. Stop server
# Press Ctrl+C

# 2. Restore from backup
tar -xzf backups/20250107_020000.tar.gz
cp -r 20250107_020000/* .

# 3. Restart server
python server.py

# 4. Verify
curl http://localhost:5000/api/health
```

---

## Summary

You now have complete knowledge of:

✅ **Installation**: How to set up the project from scratch
✅ **Configuration**: How to customize all settings
✅ **Running**: Multiple ways to start the application
✅ **Troubleshooting**: Solutions to common problems
✅ **Maintenance**: Regular tasks to keep it running smoothly
✅ **Optimization**: How to improve performance
✅ **Deployment**: How to deploy to production
✅ **Monitoring**: How to track health and performance
✅ **Backup**: How to protect your data

**Next Steps**:
1. Review all 5 documents
2. Set up your development environment
3. Run the application
4. Customize for your needs
5. Deploy to production

**Need Help?**
- Check logs: `logs/app.log`
- Review documentation
- Test API endpoints
- Enable debug mode

---

**End of Documentation Series**

You now have complete understanding of the Customer Churn Prediction Dashboard from scratch!
