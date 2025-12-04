# Quick Start Guide 🚀

Get your improved churn dashboard running in 3 simple steps!

## Step 1: Organize Your Files

Run the setup script to organize your project:

```bash
python setup_project.py
```

This will:
- Create the proper folder structure
- Move files to their correct locations
- Set up logging directories

## Step 2: Install Dependencies

Install required Python packages:

```bash
pip install -r requirements.txt
```

## Step 3: Run the Dashboard

Start the Streamlit dashboard:

```bash
streamlit run app/main.py
```

The dashboard will open automatically in your browser at `http://localhost:8501`

---

## What's New? ✨

### 1. Input Validation ✅
- Automatic checks for missing data
- Validates CSV structure
- Handles errors gracefully
- No more crashes!

### 2. Dynamic Dashboard 📊
- Auto-detects churn column
- Automatically generates charts
- Adapts to any dataset
- No hardcoded values

### 3. Simple Logging 📝
- All actions logged to `logs/app.log`
- Easy debugging
- Track predictions and errors
- Monitor usage

### 4. Config File ⚙️
- All settings in `config/settings.yaml`
- Change paths without coding
- Customize dashboard appearance
- Easy for non-coders

### 5. Clean Structure 📁
- Organized folders
- Separated concerns
- Easy to navigate
- Professional layout

---

## Customization Guide

### Change Data Source

Edit `config/settings.yaml`:

```yaml
paths:
  customer_data: "data/your_new_file.csv"
```

### Customize Dashboard

Edit `config/settings.yaml`:

```yaml
dashboard:
  title: "Your Custom Title"
  page_icon: "🎯"
```

### Add More Charts

Edit `config/settings.yaml`:

```yaml
visualizations:
  max_charts: 8  # Show more charts
  priority_columns:
    - "YourColumn1"
    - "YourColumn2"
```

---

## Troubleshooting 🔧

### Problem: Dashboard won't start

**Solution:**
1. Check `logs/app.log` for errors
2. Verify files exist in correct folders
3. Run `python setup_project.py` again

### Problem: No predictions

**Solution:**
1. Ensure `models/churn_model.pkl` exists
2. Check model path in `config/settings.yaml`
3. Review logs for model loading errors

### Problem: No charts showing

**Solution:**
1. Verify data has categorical columns
2. Check churn column exists
3. Ensure data file is not empty

---

## File Locations

After setup, your files should be:

```
✅ data/customers.csv          - Customer data
✅ models/churn_model.pkl      - ML model
✅ config/settings.yaml        - Configuration
✅ logs/app.log                - Application logs
✅ notebooks/*.ipynb           - Analysis notebooks
```

---

## Need Help?

1. **Check the logs**: `logs/app.log`
2. **Read the README**: `README.md`
3. **Review config**: `config/settings.yaml`

---

**Enjoy your improved dashboard! 🎉**
