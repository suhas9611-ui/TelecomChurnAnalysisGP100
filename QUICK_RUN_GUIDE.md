# Quick Run Guide 🚀

## ✅ Your Web Dashboard is Running!

### 🌐 Access the Dashboard

Open your browser and go to:
- **http://localhost:5000**
- Or: **http://127.0.0.1:5000**

### 📁 Files You Can Edit

#### HTML Structure
- **File:** `frontend/index.html`
- **What:** Page layout and structure
- **How:** Edit and refresh browser

#### CSS Styling
- **File:** `frontend/css/styles.css`
- **What:** Colors, fonts, layout
- **How:** Edit and refresh browser

#### JavaScript Logic
- **Files:** `frontend/js/*.js`
- **What:** Behavior and interactions
- **How:** Edit and refresh browser

### 🎨 Quick Customizations

#### Change Colors
Edit `frontend/css/styles.css`:
```css
:root {
    --primary-color: #2563eb;    /* Change this! */
    --secondary-color: #10b981;  /* And this! */
}
```

#### Change Title
Edit `frontend/index.html`:
```html
<h1 class="header-title">
    <span class="icon">📊</span>
    <span>Your Custom Title</span>  <!-- Change this! -->
</h1>
```

### 🔄 See Your Changes

1. Edit the file
2. Save it
3. Refresh your browser (F5)
4. See the changes!

### 🛑 Stop the Server

To stop the Flask server:
1. Go to the terminal where it's running
2. Press `Ctrl + C`

Or in Kiro, use the process manager to stop it.

### 🚀 Restart the Server

```bash
python app/api/server.py
```

Or double-click: `run_web_dashboard.bat`

### 📊 What's Available

#### Pages
- **Main Dashboard:** http://localhost:5000
- **API Health:** http://localhost:5000/api/health
- **API Stats:** http://localhost:5000/api/stats

#### Features
- ✅ Real-time metrics
- ✅ Interactive charts
- ✅ Churn predictions
- ✅ Responsive design
- ✅ Mobile-friendly

### 🐛 Troubleshooting

#### Can't Access Dashboard?
- Make sure server is running
- Check terminal for errors
- Try http://127.0.0.1:5000 instead

#### Changes Not Showing?
- Hard refresh: `Ctrl + Shift + R`
- Clear browser cache
- Check browser console (F12)

#### Server Won't Start?
- Check if port 5000 is in use
- Look at terminal for error messages
- Ensure Flask is installed: `pip install flask flask-cors`

### 📚 Learn More

- **WEB_DASHBOARD_GUIDE.md** - Complete guide
- **DASHBOARD_COMPARISON.md** - Compare versions
- **WEB_VERSION_SUMMARY.md** - Technical details

### 🎉 Enjoy!

Your professional web dashboard is ready to use!

**Current Status:**
- ✅ Server running on http://localhost:5000
- ✅ Data loaded: 5000 customer records
- ✅ Model loaded: Ready for predictions
- ✅ All features working

**Next Steps:**
1. Open http://localhost:5000 in browser
2. Explore the dashboard
3. Try making predictions
4. Customize the design
5. Have fun! 🚀
