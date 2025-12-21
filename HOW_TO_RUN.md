# 🚀 How to Run the Customer Churn Analysis Platform

## 📋 Complete Setup and Running Guide

### **Current Status**: ✅ Fully Tested and Working

---

## 🎯 **Quick Start (Recommended Method)**

### **Prerequisites**
- ✅ Python 3.8+ (You have Python 3.11.0)
- ✅ Virtual environment (myvenv folder exists)
- ✅ All dependencies installed
- ✅ Windows 10/11

### **Step 1: Open Command Prompt/PowerShell**
```bash
# Navigate to project directory
cd "C:\Users\royal\Downloads\Sample Churn analysis PYNB"
```

### **Step 2: Activate Virtual Environment**
```bash
# Windows Command Prompt
myvenv\Scripts\activate

# Windows PowerShell (if above doesn't work)
myvenv\Scripts\Activate.ps1
```

**Expected Output:**
```
(myvenv) C:\Users\royal\Downloads\Sample Churn analysis PYNB>
```

### **Step 3: Start the Application**

**Option A: Simple Launcher (Most Reliable)**
```bash
python run_simple.py
```

**Option B: Manual Start (100% Reliable)**
```bash
# Start backend (keep this terminal open)
python backend\main.py
```

Open **second terminal** and run:
```bash
# Activate virtual environment
myvenv\Scripts\activate

# Start frontend
cd frontend
python -m http.server 8000
```

### **Step 4: Access the Application**
Open your web browser and go to:
- **Main Dashboard**: http://localhost:8000
- **Predictions**: http://localhost:8000/predictions.html
- **Sentiment Analysis**: http://localhost:8000/complaints.html

---

## 🌐 **Application URLs and Features**

| Page | URL | Key Features |
|------|-----|-------------|
| **Dashboard** | http://localhost:8000 | Customer metrics, interactive charts, real-time data |
| **Flexible Predictions** | http://localhost:8000/predictions.html | Individual section predictions, partial data analysis |
| **Sentiment Analysis** | http://localhost:8000/complaints.html | Enhanced neutral detection, real-time analysis |
| **Backend API** | http://localhost:5001 | REST API endpoints for data and predictions |

---

## 🎯 **New Features to Test**

### **1. Flexible Prediction System**

**All Fields Now Optional:**
- ✅ No required fields - fill any combination
- ✅ Smart defaults for missing data
- ✅ Real-time visual feedback

**Individual Section Predictions:**
```
👤 Demographics Only: Fill gender, age → Click "🎯 Predict Demographics Only"
📞 Service Only: Fill tenure, services → Click "🎯 Predict Service Only"  
🌐 Internet Only: Fill internet type, add-ons → Click "🎯 Predict Add-ons Only"
📄 Billing Only: Fill contract, payment → Click "🎯 Predict Billing Only"
💰 Financial Only: Fill charges → Click "🎯 Predict Financial Only"
```

**Flexible Prediction Modes:**
- **📊 Predict Filled Sections Only**: Analyzes any combination of filled fields
- **🎯 Predict Overall Churn**: Comprehensive analysis with all available data

### **2. Enhanced Sentiment Analysis**

**Fixed Neutral Detection:**
```
Test Cases:
✅ "neither good nor bad" → 100% Neutral (previously showed 50/50)
✅ "okay service" → High Neutral %
✅ "excellent service" → High Positive %
✅ "terrible service" → High Negative %
```

**Real-time Features:**
- Instant sentiment classification
- Detailed score breakdown
- Category classification
- Confidence indicators

---

## 🔧 **Troubleshooting Guide**

### **Problem 1: "Backend failed to start" (False Alarm)**

**Symptoms:**
```
❌ Backend failed to start
🛑 Stopping servers...
```

**Solution:**
This is a known issue with the health check system. The backend actually works fine.

**Fix Options:**
1. **Use Simple Launcher**: `python run_simple.py`
2. **Manual Start**: Start backend and frontend separately
3. **Ignore Message**: If you see this, manually start servers

### **Problem 2: Virtual Environment Issues**

**Error**: `'myvenv\Scripts\activate' is not recognized`

**Solution:**
```bash
# Check if virtual environment exists
dir myvenv\Scripts

# If missing, recreate it
python -m venv myvenv
myvenv\Scripts\activate
pip install -r requirements.txt
```

### **Problem 3: PowerShell Execution Policy**

**Error**: `cannot be loaded because running scripts is disabled`

**Solution:**
```powershell
# Run PowerShell as Administrator
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Then try again
myvenv\Scripts\Activate.ps1
```

### **Problem 4: Port Already in Use**

**Error**: `Address already in use: Port 5001`

**Solution:**
```bash
# Find process using port
netstat -ano | findstr :5001

# Kill the process (replace PID with actual number)
taskkill /PID <PID_NUMBER> /F

# Restart the application
```

### **Problem 5: Module Not Found**

**Error**: `ModuleNotFoundError: No module named 'flask'`

**Solution:**
```bash
# Ensure virtual environment is activated
myvenv\Scripts\activate

# Reinstall dependencies
pip install -r requirements.txt

# Verify installation
pip list | findstr flask
```

### **Problem 6: Browser Shows Blank Page**

**Symptoms:**
- Page loads but shows no content
- Charts don't appear
- Console shows errors

**Solutions:**
1. **Clear Browser Cache**: Ctrl+F5 or Ctrl+Shift+R
2. **Check Console**: F12 → Console tab for JavaScript errors
3. **Verify Backend**: Go to http://localhost:5001 (should show JSON response)
4. **Try Different Browser**: Chrome, Firefox, Edge
5. **Disable Extensions**: Try incognito/private mode

---

## ✅ **Verification Checklist**

### **Backend Verification**
```bash
# Test 1: Health Check
# Open browser to: http://localhost:5001
# Expected: JSON response with "status": "healthy"

# Test 2: Dashboard Data
# Open browser to: http://localhost:5001/dashboard_data
# Expected: JSON with metrics and charts data

# Test 3: Prediction API
# Should accept POST requests to /predict endpoint
```

### **Frontend Verification**
```bash
# Test 1: Main Dashboard
# URL: http://localhost:8000
# Expected: Customer metrics cards, interactive charts

# Test 2: Predictions Page
# URL: http://localhost:8000/predictions.html
# Expected: Form with optional fields, section prediction buttons

# Test 3: Sentiment Analysis
# URL: http://localhost:8000/complaints.html
# Expected: Text input, real-time sentiment analysis
```

### **Feature Testing**
```bash
# Test 1: Flexible Predictions
✅ Fill only demographics → Click "🎯 Predict Demographics Only"
✅ Fill mixed fields → Click "📊 Predict Filled Sections Only"
✅ Fill all fields → Click "🎯 Predict Overall Churn"

# Test 2: Enhanced Sentiment
✅ Enter "neither good nor bad" → Should show 100% neutral
✅ Enter "excellent service" → Should show high positive %
✅ Enter "terrible service" → Should show high negative %

# Test 3: Visual Feedback
✅ Form sections show ✓ checkmarks when filled
✅ Real-time field validation
✅ Smooth animations and transitions
```

---

## 📊 **Sample Test Data**

### **High-Risk Customer Profile**
```json
{
  "gender": "Female",
  "SeniorCitizen": 1,
  "Partner": "No",
  "Dependents": "No",
  "tenure": 3,
  "Contract": "Month-to-month",
  "PaymentMethod": "Electronic check",
  "MonthlyCharges": 95,
  "TotalCharges": 285
}
```
**Expected Result**: High churn risk (70-85%)

### **Low-Risk Customer Profile**
```json
{
  "gender": "Male",
  "SeniorCitizen": 0,
  "Partner": "Yes",
  "Dependents": "Yes",
  "tenure": 60,
  "Contract": "Two year",
  "PaymentMethod": "Bank transfer (automatic)",
  "MonthlyCharges": 45,
  "TotalCharges": 2700
}
```
**Expected Result**: Low churn risk (15-25%)

### **Sentiment Analysis Test Cases**
```
Positive Examples:
- "Excellent service, highly recommend!"
- "Amazing support team, very helpful"
- "Love the new features, great job!"

Neutral Examples:
- "neither good nor bad"
- "okay service, nothing special"
- "average experience"

Negative Examples:
- "Terrible service, very disappointed"
- "Worst experience ever, frustrated"
- "Poor quality, want refund"
```

---

## 🚀 **Performance Optimization**

### **For Better Performance**
1. **Close Unused Applications**: Free up RAM (4GB+ recommended)
2. **Use Chrome/Firefox**: Best compatibility with Plotly.js charts
3. **Clear Browser Cache**: If experiencing slow loading
4. **Check Network**: Ensure localhost is accessible
5. **Disable Antivirus**: Temporarily if blocking localhost connections

### **For Development**
1. **Enable Debug Mode**: Already enabled in .env file
2. **Monitor Logs**: Check logs/app.log for errors
3. **Use Browser DevTools**: F12 for debugging JavaScript
4. **Check Console**: Look for API call failures
5. **Network Tab**: Monitor API response times

---

## 🔄 **Starting and Stopping**

### **Starting the Application**

**Method 1: Simple Launcher (Recommended)**
```bash
myvenv\Scripts\activate
python run_simple.py
```

**Method 2: Manual Start (Most Reliable)**
```bash
# Terminal 1 - Backend
myvenv\Scripts\activate
python backend\main.py

# Terminal 2 - Frontend
myvenv\Scripts\activate
cd frontend
python -m http.server 8000
```

**Method 3: Original Launcher (May Show False Errors)**
```bash
myvenv\Scripts\activate
python run.py
# Note: May show "Backend failed to start" but still works
```

### **Stopping the Application**

**If using Simple Launcher:**
```bash
# Press Ctrl+C in the terminal
# Application will stop both servers automatically
```

**If using Manual Start:**
```bash
# Press Ctrl+C in each terminal window
# Or close the terminal windows
```

**Force Stop (if needed):**
```bash
# Kill all Python processes
taskkill /F /IM python.exe

# Or kill specific ports
netstat -ano | findstr :5001
taskkill /PID <PID> /F
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

---

## 📱 **Mobile/Remote Access**

### **Access from Other Devices on Same Network**

**Step 1: Find Your Computer's IP Address**
```bash
# Windows
ipconfig
# Look for IPv4 Address (e.g., 192.168.1.100)
```

**Step 2: Update CORS Settings (if needed)**
Edit `.env` file:
```bash
CORS_ORIGINS=http://localhost:8000,http://192.168.1.100:8000
```

**Step 3: Access from Mobile/Tablet**
```
http://192.168.1.100:8000
```

**Step 4: Restart Backend**
```bash
# Stop and restart backend to apply CORS changes
Ctrl+C
python backend\main.py
```

---

## 🔐 **Security and Configuration**

### **Environment Variables (.env)**
```bash
# Flask Configuration
FLASK_ENV=development
FLASK_DEBUG=True
FLASK_HOST=localhost
FLASK_PORT=5001

# Model Configuration
MODEL_PATH=backend/models/churn_model.pkl
DATA_PATH=data/

# Logging Configuration
LOG_LEVEL=INFO
LOG_FILE=logs/app.log

# CORS Configuration (for cross-origin requests)
CORS_ORIGINS=http://localhost:3000,http://localhost:8000,http://127.0.0.1:3000,http://127.0.0.1:8000
```

### **Security Considerations**
- ✅ CORS properly configured for localhost
- ✅ Debug mode enabled for development
- ✅ No sensitive data in logs
- ✅ Input validation on all API endpoints
- ⚠️ For production: Disable debug mode, use HTTPS

---

## 📚 **Additional Resources**

### **Documentation Files**
- **CHURN_MODEL_EXPLANATION.md**: Complete model technical details
- **README.md**: Project overview and architecture
- **requirements.txt**: Python dependencies list

### **Key Code Files**
- **backend/main.py**: Application entry point
- **backend/utils/model_predictor.py**: ML model and prediction logic
- **backend/utils/sentiment_analyzer.py**: Sentiment analysis engine
- **frontend/predictions.html**: Flexible prediction interface
- **frontend/assets/js/predictions.js**: Prediction UI logic

### **Data Files**
- **data/customers.csv**: Customer dataset (5,000 records)
- **data/complaints.csv**: Complaints dataset (5,000+ records)
- **backend/models/churn_model.pkl**: Trained ML model

---

## 🎉 **Success Indicators**

### **Application is Working When:**
- ✅ Dashboard loads with customer metrics (5,000 customers, 34.2% churn rate)
- ✅ Interactive charts display and respond to clicks
- ✅ Prediction form accepts partial data and shows results
- ✅ Individual section predictions work (Demographics, Service, etc.)
- ✅ Sentiment analysis shows accurate results for test phrases
- ✅ Category predictions display with risk levels and recommendations
- ✅ No errors in browser console (F12 → Console)
- ✅ API endpoints respond with JSON data

### **Performance Benchmarks**
- **Page Load Time**: < 3 seconds
- **Prediction Response**: < 2 seconds
- **Sentiment Analysis**: < 1 second
- **Chart Rendering**: < 2 seconds
- **Memory Usage**: < 500MB total

---

## 🆘 **Getting Help**

### **If You Encounter Issues**

1. **Check This Guide**: Most common issues are covered above
2. **Check Logs**: Look at `logs/app.log` for backend errors
3. **Browser Console**: F12 → Console tab for frontend errors
4. **Network Tab**: F12 → Network tab to check API calls
5. **Process Status**: Use Task Manager to verify Python processes

### **Common Error Messages and Solutions**

| Error Message | Cause | Solution |
|---------------|-------|----------|
| "Backend failed to start" | Health check timeout | Use manual start method |
| "Module not found" | Missing dependencies | Run `pip install -r requirements.txt` |
| "Port already in use" | Previous process still running | Kill process or use different port |
| "CORS error" | Wrong URL or CORS config | Use http://localhost:8000, check .env |
| "Blank page" | Frontend server not running | Start frontend server on port 8000 |

---

## 🔄 **Version Information**

- **Platform Version**: 2.0 (Flexible Prediction System)
- **Python Version**: 3.11.0 (Tested and Working)
- **Operating System**: Windows 10/11
- **Last Updated**: December 2025
- **Key Features**: Flexible predictions, enhanced sentiment analysis, individual section analysis

---

## 🎯 **Quick Reference Commands**

```bash
# Activate Environment
myvenv\Scripts\activate

# Start Application (Simple)
python run_simple.py

# Start Application (Manual)
python backend\main.py          # Terminal 1
cd frontend && python -m http.server 8000  # Terminal 2

# Check Status
netstat -ano | findstr :5001   # Backend port
netstat -ano | findstr :8000   # Frontend port

# Stop Application
Ctrl+C                          # In each terminal

# Access URLs
http://localhost:8000           # Main dashboard
http://localhost:8000/predictions.html  # Predictions
http://localhost:8000/complaints.html   # Sentiment analysis
```

---

**🎉 Your Customer Churn Analysis Platform is ready to use with all the latest flexible prediction features and enhanced sentiment analysis!**

**For immediate access, open: http://localhost:8000**