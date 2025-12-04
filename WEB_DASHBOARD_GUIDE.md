# Web Dashboard Guide 🌐

## Overview

Your churn dashboard now has **TWO versions**:

1. **Streamlit Version** (Original) - Python-based web app
2. **HTML/CSS/JS Version** (New) - Traditional web frontend with Flask API

---

## 🎯 Why Two Versions?

### Streamlit Version
- ✅ Quick prototyping
- ✅ Python-only development
- ✅ Built-in components
- ❌ Limited customization
- ❌ Streamlit-specific styling

### HTML/CSS/JS Version
- ✅ Full control over UI/UX
- ✅ Custom styling and animations
- ✅ Standard web technologies
- ✅ Easy to integrate with existing websites
- ✅ Better performance
- ✅ More professional look

---

## 🚀 Quick Start

### Option 1: Streamlit Dashboard

```bash
streamlit run app/main.py
```

Or double-click: `run_dashboard.bat`

**Opens at:** http://localhost:8501

### Option 2: Web Dashboard (HTML/CSS/JS)

```bash
python app/api/server.py
```

Or double-click: `run_web_dashboard.bat`

**Opens at:** http://localhost:5000

---

## 📁 New File Structure

```
project/
├── app/
│   ├── api/                    # NEW: Flask API
│   │   ├── __init__.py
│   │   └── server.py          # REST API server
│   ├── core/                   # Shared business logic
│   ├── ui/                     # Streamlit UI
│   └── utils/                  # Shared utilities
│
├── frontend/                   # NEW: Web frontend
│   ├── index.html             # Main HTML page
│   ├── css/
│   │   └── styles.css         # Custom styles
│   └── js/
│       ├── config.js          # Configuration
│       ├── api.js             # API client
│       ├── charts.js          # Chart rendering
│       ├── prediction.js      # Prediction logic
│       └── main.js            # App initialization
│
└── run_web_dashboard.bat      # NEW: Web launcher
```

---

## 🏗️ Architecture

### Web Version Architecture

```
┌─────────────────┐
│   Browser       │
│  (HTML/CSS/JS)  │
└────────┬────────┘
         │ HTTP/REST
         ▼
┌─────────────────┐
│  Flask API      │
│  (server.py)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Core Logic     │
│  (Shared)       │
└─────────────────┘
```

### API Endpoints

- `GET /` - Serve HTML page
- `GET /api/health` - Health check
- `GET /api/config` - Dashboard config
- `GET /api/stats` - Churn statistics
- `GET /api/charts` - Chart data
- `GET /api/model/features` - Model features
- `POST /api/predict` - Make prediction

---

## 🎨 Features

### Web Dashboard Features

1. **Modern UI**
   - Clean, professional design
   - Smooth animations
   - Responsive layout
   - Custom color scheme

2. **Interactive Charts**
   - Plotly.js visualizations
   - Hover tooltips
   - Responsive resizing
   - Dynamic data loading

3. **Live Predictions**
   - Dynamic form generation
   - Real-time validation
   - Animated results
   - Confidence indicators

4. **Error Handling**
   - Toast notifications
   - Graceful degradation
   - User-friendly messages
   - API error handling

---

## 🔧 Customization

### Change Colors

Edit `frontend/css/styles.css`:

```css
:root {
    --primary-color: #2563eb;    /* Change this */
    --secondary-color: #10b981;  /* And this */
    --danger-color: #ef4444;
}
```

### Change API URL

Edit `frontend/js/config.js`:

```javascript
const CONFIG = {
    API_BASE_URL: 'http://your-server:5000/api',
    // ...
};
```

### Modify Layout

Edit `frontend/index.html` to change structure.

### Add New Features

1. Add API endpoint in `app/api/server.py`
2. Add JavaScript function in appropriate module
3. Update HTML if needed

---

## 📊 Comparison

| Feature | Streamlit | Web (HTML/CSS/JS) |
|---------|-----------|-------------------|
| Setup Time | ⚡ Fast | 🔧 Moderate |
| Customization | ⭐⭐ Limited | ⭐⭐⭐⭐⭐ Full |
| Performance | ⭐⭐⭐ Good | ⭐⭐⭐⭐⭐ Excellent |
| Learning Curve | ⭐⭐⭐⭐⭐ Easy | ⭐⭐⭐ Moderate |
| Professional Look | ⭐⭐⭐ Good | ⭐⭐⭐⭐⭐ Excellent |
| Integration | ⭐⭐ Limited | ⭐⭐⭐⭐⭐ Easy |
| Mobile Support | ⭐⭐⭐ Good | ⭐⭐⭐⭐⭐ Excellent |

---

## 🛠️ Development

### Install Dependencies

```bash
pip install -r requirements.txt
```

New dependencies added:
- `flask` - Web framework
- `flask-cors` - CORS support

### Run in Development Mode

```bash
# API server (with auto-reload)
python app/api/server.py

# The server runs on http://localhost:5000
# Frontend is served from /frontend folder
```

### Testing API Endpoints

```bash
# Health check
curl http://localhost:5000/api/health

# Get stats
curl http://localhost:5000/api/stats

# Make prediction
curl -X POST http://localhost:5000/api/predict \
  -H "Content-Type: application/json" \
  -d '{"feature1": 0, "feature2": 1}'
```

---

## 🚀 Deployment

### Deploy Streamlit Version

```bash
# Using Streamlit Cloud
streamlit run app/main.py
```

### Deploy Web Version

#### Option 1: Simple Server

```bash
# Run Flask in production mode
gunicorn -w 4 -b 0.0.0.0:5000 app.api.server:app
```

#### Option 2: Docker

```dockerfile
FROM python:3.11
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["python", "app/api/server.py"]
```

#### Option 3: Cloud Platforms

- **Heroku**: Deploy Flask app
- **AWS**: EC2 or Elastic Beanstalk
- **Azure**: App Service
- **Google Cloud**: App Engine

---

## 📝 API Documentation

### GET /api/stats

**Response:**
```json
{
  "total_customers": 258,
  "churned_customers": 52,
  "retained_customers": 206,
  "churn_rate": 20.16
}
```

### GET /api/charts

**Response:**
```json
{
  "charts": [
    {
      "column": "Gender",
      "data": [
        {"Gender": "Male", "Churn": 0, "count": 120},
        {"Gender": "Male", "Churn": 1, "count": 30}
      ]
    }
  ]
}
```

### POST /api/predict

**Request:**
```json
{
  "Age": 35,
  "Gender": "Male",
  "ContractType": "Month-to-month",
  ...
}
```

**Response:**
```json
{
  "prediction": 1,
  "probability": 0.75,
  "confidence": 0.75
}
```

---

## 🐛 Troubleshooting

### Web Dashboard Won't Start

**Problem:** `ModuleNotFoundError: No module named 'flask'`

**Solution:**
```bash
pip install flask flask-cors
```

### API Connection Failed

**Problem:** Frontend can't connect to API

**Solution:**
1. Ensure Flask server is running
2. Check `frontend/js/config.js` has correct URL
3. Check browser console for CORS errors

### Charts Not Displaying

**Problem:** Charts show but no data

**Solution:**
1. Check browser console for errors
2. Verify API endpoint returns data
3. Check data format matches expected structure

### Port Already in Use

**Problem:** `Address already in use`

**Solution:**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Change port in server.py
app.run(port=5001)
```

---

## 🎓 Learning Resources

### For Beginners

1. **HTML/CSS Basics**
   - MDN Web Docs
   - W3Schools

2. **JavaScript Basics**
   - JavaScript.info
   - FreeCodeCamp

3. **Flask Basics**
   - Flask Documentation
   - Flask Mega-Tutorial

### For Advanced Users

1. **REST API Design**
2. **Frontend Frameworks** (React, Vue)
3. **WebSocket** for real-time updates
4. **Authentication** (JWT, OAuth)

---

## 🔄 Migration Guide

### From Streamlit to Web

If you want to fully migrate:

1. **Keep using Flask API** (already done)
2. **Replace Streamlit UI** with HTML/CSS/JS (already done)
3. **Update deployment** to use Flask
4. **Update documentation** for users

### Hybrid Approach

You can keep both versions:
- **Internal use**: Streamlit (quick and easy)
- **External use**: Web version (professional)

---

## ✨ Next Steps

### Enhancements You Can Add

1. **User Authentication**
   - Login/logout
   - User sessions
   - Role-based access

2. **Data Upload**
   - Upload CSV files
   - Process new data
   - Update visualizations

3. **Export Features**
   - Download predictions
   - Export charts as images
   - Generate PDF reports

4. **Real-time Updates**
   - WebSocket connection
   - Live data streaming
   - Auto-refresh

5. **Advanced Analytics**
   - Trend analysis
   - Cohort analysis
   - Customer segmentation

---

## 📚 File Reference

### Frontend Files

- **index.html** - Main page structure
- **css/styles.css** - All styling
- **js/config.js** - Configuration
- **js/api.js** - API client
- **js/charts.js** - Chart rendering
- **js/prediction.js** - Prediction logic
- **js/main.js** - App initialization

### Backend Files

- **app/api/server.py** - Flask API server
- **app/core/** - Shared business logic
- **app/utils/** - Shared utilities

---

## 🎉 Summary

You now have **two powerful dashboard versions**:

1. **Streamlit** - Quick, Python-only, easy to modify
2. **Web** - Professional, customizable, production-ready

Choose based on your needs:
- **Prototyping?** Use Streamlit
- **Production?** Use Web version
- **Both?** Keep both!

---

**Enjoy your new web dashboard! 🚀**

*Questions? Check the logs or API documentation above.*
