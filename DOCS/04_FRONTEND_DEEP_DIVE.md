# Document 4: Frontend Deep Dive

## 📋 Table of Contents
1. [Frontend Architecture](#frontend-architecture)
2. [JavaScript Modules](#javascript-modules)
3. [HTML Structure](#html-structure)
4. [CSS Styling](#css-styling)
5. [User Interactions](#user-interactions)
6. [Chart Rendering](#chart-rendering)

---

## Frontend Architecture

### Module Organization

```
frontend/
├── index.html              # Main dashboard page
├── complaints.html         # Complaints dashboard page
│
├── css/
│   ├── styles.css         # Main dashboard styles
│   └── complaints.css     # Complaints styles
│
└── js/
    ├── config.js          # Configuration & URLs
    ├── api.js             # API communication layer
    ├── charts.js          # Chart rendering module
    ├── prediction.js      # Prediction form & logic
    ├── main.js            # App initialization
    ├── complaints.js      # Complaints functionality
    └── complaints-charts.js # Complaints visualizations
```

### Module Dependencies

```
main.js (Entry Point)
    │
    ├──► config.js (Configuration)
    │
    ├──► api.js (API Layer)
    │     │
    │     └──► Used by all modules for data fetching
    │
    ├──► charts.js (Visualizations)
    │     │
    │     └──► Depends on: api.js, Plotly.js
    │
    └──► prediction.js (Predictions)
          │
          └──► Depends on: api.js
```

---

## JavaScript Modules

### 1. Configuration Module (`config.js`)

**Purpose**: Centralize API URLs and configuration

```javascript
// API Base URL
const API_BASE_URL = 'http://localhost:5000';

// API Endpoints
const API_ENDPOINTS = {
    health: '/api/health',
    config: '/api/config',
    stats: '/api/stats',
    charts: '/api/charts',
    modelFeatures: '/api/model/features',
    predict: '/api/predict',
    complaintsStats: '/api/complaints/stats',
    complaintsCharts: '/api/complaints/charts',
    complaints: '/api/complaints',
    analyzeSentiment: '/api/complaints/analyze-sentiment'
};

// Helper function to get full URL
function getApiUrl(endpoint) {
    return API_BASE_URL + API_ENDPOINTS[endpoint];
}

// Chart configuration
const CONFIG = {
    chartConfig: {
        responsive: true,
        displayModeBar: true,
        displaylogo: false,
        modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d']
    }
};
```

**Why This Approach?**
- **Single Source of Truth**: Change URL in one place
- **Easy Deployment**: Update base URL for production
- **Type Safety**: Prevents typos in endpoint names

---

### 2. API Module (`api.js`)

**Purpose**: Handle all HTTP communication with backend

#### Core Request Method

```javascript
const API = {
    /**
     * Generic fetch wrapper with error handling
     */
    async request(url, options = {}) {
        try {
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });
            
            // Check if response is OK
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Request failed');
            }
            
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;  // Re-throw for caller to handle
        }
    }
};
```

**Error Handling Flow**:
```
API Call
    │
    ├──► Success (200-299)
    │     └──► Return JSON data
    │
    └──► Error
          ├──► Network Error
          │     └──► Throw with message
          │
          └──► HTTP Error (400-599)
                └──► Parse error JSON
                      └──► Throw with server message
```

#### Specific API Methods

```javascript
// GET request example
async getStats() {
    return this.request(getApiUrl('stats'));
}

// POST request example
async predict(inputData) {
    return this.request(getApiUrl('predict'), {
        method: 'POST',
        body: JSON.stringify(inputData)
    });
}
```

#### Utility Functions

```javascript
/**
 * Show error toast notification
 */
function showError(message) {
    const toast = document.getElementById('error-toast');
    const messageEl = document.getElementById('error-message');
    
    messageEl.textContent = message;
    toast.classList.remove('hidden');
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 5000);
}

/**
 * Format number with commas
 */
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * Format as percentage
 */
function formatPercentage(num) {
    return (num * 100).toFixed(2) + '%';
}
```

---

### 3. Charts Module (`charts.js`)

**Purpose**: Render interactive charts using Plotly.js

#### Main Method: `loadCharts()`

```javascript
const Charts = {
    async loadCharts() {
        try {
            // Fetch chart data from API
            const data = await API.getChartData();
            const container = document.getElementById('charts-container');
            
            if (!data.charts || data.charts.length === 0) {
                container.innerHTML = '<p>No chart data available</p>';
                return;
            }
            
            // Clear loading message
            container.innerHTML = '';
            
            // Render each chart
            data.charts.forEach((chart, index) => {
                this.renderChart(chart, container, index);
            });
            
        } catch (error) {
            console.error('Error loading charts:', error);
            showError('Failed to load charts: ' + error.message);
        }
    }
};
```

#### Chart Rendering Process

```javascript
renderChart(chartData, container, index) {
    // Step 1: Create container div
    const chartDiv = document.createElement('div');
    chartDiv.className = 'chart-container';
    chartDiv.id = `chart-${index}`;
    container.appendChild(chartDiv);
    
    // Step 2: Prepare data for Plotly
    const traces = this.prepareChartTraces(chartData);
    
    // Step 3: Define layout
    const layout = {
        title: {
            text: `Churn by ${chartData.column}`,
            font: { size: 18, weight: 700, color: '#0f172a' }
        },
        showlegend: true,
        legend: {
            orientation: 'v',
            y: 0.5,
            x: 1.1
        },
        height: 420
    };
    
    // Step 4: Render with Plotly
    Plotly.newPlot(chartDiv.id, traces, layout, CONFIG.chartConfig);
}
```

#### Data Transformation for Pie Charts

```javascript
prepareChartTraces(chartData) {
    // Aggregate data by category
    const categoryTotals = {};
    
    chartData.data.forEach(item => {
        const category = item[chartData.column];
        const count = item.count;
        
        if (!categoryTotals[category]) {
            categoryTotals[category] = 0;
        }
        categoryTotals[category] += count;
    });
    
    // Extract labels and values
    const labels = Object.keys(categoryTotals);
    const values = Object.values(categoryTotals);
    
    // Define colors
    const colors = [
        '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', 
        '#10b981', '#06b6d4', '#6366f1', '#f97316'
    ];
    
    // Create pie chart trace
    return [{
        labels: labels,
        values: values,
        type: 'pie',
        marker: { colors: colors.slice(0, labels.length) },
        textinfo: 'label+percent',
        hoverinfo: 'label+value+percent'
    }];
}
```

**Data Flow Example**:
```
API Response:
{
  "column": "ContractType",
  "data": [
    {"ContractType": "Month-to-month", "Churn": 0, "count": 1500},
    {"ContractType": "Month-to-month", "Churn": 1, "count": 800},
    {"ContractType": "One year", "Churn": 0, "count": 1200},
    ...
  ]
}

After Aggregation:
{
  "Month-to-month": 2300,
  "One year": 1500,
  "Two year": 1200
}

Plotly Format:
{
  labels: ["Month-to-month", "One year", "Two year"],
  values: [2300, 1500, 1200],
  type: "pie"
}
```

---

### 4. Prediction Module (`prediction.js`)

**Purpose**: Handle prediction form and results

#### Form Loading Process

```javascript
const Prediction = {
    formData: {},
    allFeatures: [],
    featureDefaults: {},
    
    async loadForm() {
        try {
            // Fetch model features
            const data = await API.getModelFeatures();
            const container = document.getElementById('form-fields');
            
            // Store features
            this.allFeatures = data.features;
            this.generateDefaultValues();
            
            // Clear loading
            container.innerHTML = '';
            
            // Render sections
            this.renderCustomerSection(container);
            this.renderDemographicSection(container, data.groups?.demographic);
            this.renderServiceSection(container, data.groups?.service);
            this.renderUsageSection(container, data.groups?.usage);
            this.renderPaymentSection(container, data.groups?.financial);
            
            // Setup form submission
            this.setupFormSubmission();
            
        } catch (error) {
            showError('Failed to load prediction form: ' + error.message);
        }
    }
};
```

#### Dynamic Form Field Generation

```javascript
createFormField(feature) {
    const fieldDiv = document.createElement('div');
    fieldDiv.className = 'form-field';
    
    // Create label
    const label = document.createElement('label');
    label.textContent = this.formatFieldName(feature.name);
    label.setAttribute('for', `field-${feature.name}`);
    
    let input;
    
    if (feature.type === 'categorical' && feature.options.length > 0) {
        // Create dropdown
        input = document.createElement('select');
        input.id = `field-${feature.name}`;
        input.name = feature.name;
        
        feature.options.forEach(option => {
            const optionEl = document.createElement('option');
            optionEl.value = option;
            optionEl.textContent = option;
            input.appendChild(optionEl);
        });
    } else {
        // Create number input
        input = document.createElement('input');
        input.type = 'number';
        input.id = `field-${feature.name}`;
        input.name = feature.name;
        
        // Add validation attributes
        const validationRules = {
            'Age': { min: 18, max: 100, step: 1 },
            'TenureMonths': { min: 0, max: 120, step: 1 },
            'MonthlyCharges': { min: 0, max: 2000, step: 0.01 }
        };
        
        if (validationRules[feature.name]) {
            const rules = validationRules[feature.name];
            input.min = rules.min;
            input.max = rules.max;
            input.step = rules.step;
        }
    }
    
    fieldDiv.appendChild(label);
    fieldDiv.appendChild(input);
    
    return fieldDiv;
}
```

#### Section-Based Prediction

**Key Innovation**: Predict using only one section's data

```javascript
async predictSection(sectionName) {
    const section = document.querySelector(`[data-section="${sectionName}"]`);
    const button = section.querySelector('.btn-predict');
    
    try {
        // Show loading
        button.textContent = 'Predicting...';
        button.disabled = true;
        
        // Collect data from this section only
        const sectionData = this.collectSectionData(section);
        
        // Merge with defaults for missing fields
        const fullData = { ...this.featureDefaults, ...sectionData };
        
        // Always include CustomerID
        const customerIdInput = document.getElementById('field-CustomerID');
        if (customerIdInput) {
            fullData.CustomerID = customerIdInput.value;
        }
        
        // Validate
        const validation = this.validateInputData(fullData);
        if (!validation.isValid) {
            showError('Validation Error: ' + validation.errors.join('; '));
            return;
        }
        
        // Make API call
        const result = await API.predict(fullData);
        
        // Display results
        this.displayResults(result, this.getSectionLabel(sectionName));
        
    } catch (error) {
        showError('Prediction failed: ' + error.message);
    } finally {
        // Reset button
        button.textContent = 'Predict';
        button.disabled = false;
    }
}
```

**How It Works**:
1. User fills only "Demographics" section
2. Click "Predict" button in that section
3. System collects data from that section
4. Fills missing fields with default values
5. Makes prediction
6. Shows result labeled "Demographics"

#### Input Validation

```javascript
validateInputData(inputData) {
    const errors = [];
    
    // Validate CustomerID
    if ('CustomerID' in inputData) {
        const custId = String(inputData.CustomerID);
        if (custId.startsWith('CUST')) {
            const numericPart = parseInt(custId.replace('CUST', ''));
            if (numericPart < 100000) {
                errors.push('CustomerID must be at least CUST100000');
            } else if (numericPart > 200000) {
                errors.push('CustomerID cannot exceed CUST200000');
            }
        }
    }
    
    // Validate numeric fields
    const validationRules = {
        'Age': { min: 18, max: 100, label: 'Age' },
        'TenureMonths': { min: 0, max: 120, label: 'Tenure' },
        'MonthlyCharges': { min: 0, max: 2000, label: 'Monthly Charges' }
    };
    
    for (const [field, rules] of Object.entries(validationRules)) {
        if (field in inputData) {
            const value = parseFloat(inputData[field]);
            
            if (isNaN(value)) {
                errors.push(`${rules.label} must be a number`);
            } else if (value < rules.min) {
                errors.push(`${rules.label} must be at least ${rules.min}`);
            } else if (value > rules.max) {
                errors.push(`${rules.label} cannot exceed ${rules.max}`);
            }
        }
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors
    };
}
```

#### Results Display

```javascript
displayResults(result, sectionLabel = 'All Sections') {
    const resultDiv = document.getElementById('prediction-result');
    
    // Show result section
    resultDiv.classList.remove('hidden');
    
    // Display section label
    document.getElementById('result-section-label').textContent = sectionLabel;
    
    // Display probability
    document.getElementById('result-probability').textContent = 
        formatPercentage(result.probability);
    
    // Display status
    const isChurn = result.prediction === 1 || result.probability >= 0.5;
    const statusEl = document.getElementById('result-status');
    
    if (isChurn) {
        statusEl.className = 'result-status danger';
        statusEl.innerHTML = `
            <strong>⚠️ This customer is likely to churn</strong>
            <p>Recommendation: Consider retention strategies</p>
        `;
    } else {
        statusEl.className = 'result-status success';
        statusEl.innerHTML = `
            <strong>✅ This customer is unlikely to churn</strong>
            <p>Status: Customer appears stable</p>
        `;
    }
    
    // Display confidence
    const confidence = result.confidence || 
                      Math.max(result.probability, 1 - result.probability);
    document.getElementById('result-confidence').textContent = 
        formatPercentage(confidence);
    document.getElementById('confidence-fill').style.width = 
        formatPercentage(confidence);
    
    // Scroll to results
    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
```

---

### 5. Main Module (`main.js`)

**Purpose**: Initialize and coordinate all modules

```javascript
const App = {
    async init() {
        console.log('Initializing Customer Churn Dashboard...');
        
        try {
            // Check API health
            await this.checkHealth();
            
            // Load configuration
            await this.loadConfig();
            
            // Load all data in parallel
            await Promise.all([
                this.loadStats(),
                Charts.loadCharts(),
                Prediction.loadForm()
            ]);
            
            console.log('Dashboard initialized successfully');
            
        } catch (error) {
            console.error('Initialization error:', error);
            showError('Failed to initialize dashboard: ' + error.message);
        }
    },
    
    async checkHealth() {
        const health = await API.checkHealth();
        
        if (!health.data_loaded) {
            showError('Warning: Data not loaded properly');
        }
        
        if (!health.model_loaded) {
            showError('Warning: Model not loaded');
        }
    },
    
    async loadStats() {
        const stats = await API.getStats();
        
        // Update metric cards
        document.getElementById('total-customers').textContent = 
            formatNumber(stats.total_customers);
        
        document.getElementById('churned-customers').textContent = 
            formatNumber(stats.churned_customers);
        
        document.getElementById('churn-rate').textContent = 
            stats.churn_rate.toFixed(2) + '%';
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
```

**Initialization Flow**:
```
Page Load
    │
    ▼
DOMContentLoaded Event
    │
    ▼
App.init()
    │
    ├──► checkHealth()
    │     └──► Verify API is running
    │
    ├──► loadConfig()
    │     └──► Get dashboard title
    │
    └──► Promise.all([
          ├──► loadStats()
          │     └──► Update metric cards
          │
          ├──► Charts.loadCharts()
          │     └──► Render all charts
          │
          └──► Prediction.loadForm()
                └──► Generate form fields
         ])
```

---

## HTML Structure

### Main Dashboard (`index.html`)

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Customer Churn Dashboard</title>
    
    <!-- Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    
    <!-- Styles -->
    <link rel="stylesheet" href="css/styles.css">
    
    <!-- Plotly for charts -->
    <script src="https://cdn.plot.ly/plotly-2.26.0.min.js"></script>
</head>
<body>
    <!-- Header -->
    <header class="header">
        <div class="container">
            <h1 class="header-title">
                <span class="icon">📊</span>
                <span id="dashboard-title">Customer Churn Dashboard</span>
            </h1>
            <nav class="header-nav">
                <a href="index.html" class="nav-link active">🏠 Churn Dashboard</a>
                <a href="complaints.html" class="nav-link">📋 Complaints</a>
            </nav>
        </div>
    </header>
    
    <!-- Main Content -->
    <main class="main-content">
        <div class="container">
            
            <!-- Metrics Section -->
            <section class="metrics-section">
                <div class="metric-card">
                    <div class="metric-icon">👥</div>
                    <div class="metric-content">
                        <h3 class="metric-label">Total Customers</h3>
                        <p class="metric-value" id="total-customers">-</p>
                    </div>
                </div>
                <!-- More metric cards... -->
            </section>

            <!-- Charts Section -->
            <section class="charts-section">
                <h2 class="section-title">📊 Churn Insights</h2>
                <div id="charts-container" class="charts-grid">
                    <div class="loading">Loading charts...</div>
                </div>
            </section>

            <!-- Prediction Section -->
            <section class="prediction-section">
                <h2 class="section-title">🔮 Custom Churn Prediction</h2>
                
                <form id="prediction-form" class="prediction-form">
                    <div id="form-fields" class="form-grid">
                        <div class="loading">Loading prediction form...</div>
                    </div>
                    
                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary btn-large">
                            🎯 Predict with All Data
                        </button>
                        <button type="reset" class="btn btn-secondary">
                            🔄 Reset Form
                        </button>
                    </div>
                </form>

                <!-- Prediction Result -->
                <div id="prediction-result" class="prediction-result hidden">
                    <!-- Results displayed here -->
                </div>
            </section>
        </div>
    </main>

    <!-- Footer -->
    <footer class="footer">
        <div class="container">
            <p>Built with ❤️ for data-driven decisions</p>
        </div>
    </footer>

    <!-- Error Toast -->
    <div id="error-toast" class="toast hidden">
        <span id="error-message"></span>
    </div>

    <!-- Scripts -->
    <script src="js/config.js"></script>
    <script src="js/api.js"></script>
    <script src="js/charts.js"></script>
    <script src="js/prediction.js"></script>
    <script src="js/main.js"></script>
</body>
</html>
```

**Key Elements**:
- **Metric Cards**: Display statistics (total, churned, rate)
- **Charts Container**: Dynamically filled with Plotly charts
- **Form Fields**: Dynamically generated based on model features
- **Results Section**: Hidden until prediction is made
- **Error Toast**: Shows error messages

---

## CSS Styling

### Design System

```css
:root {
    /* Colors */
    --primary-color: #3b82f6;
    --secondary-color: #10b981;
    --danger-color: #ef4444;
    --bg-color: #f1f5f9;
    --card-bg: #ffffff;
    --text-primary: #0f172a;
    --text-secondary: #64748b;
    
    /* Shadows */
    --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}
```

### Key Animations

```css
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes bounce {
    0%, 100% {
        transform: translateY(0);
    }
    50% {
        transform: translateY(-10px);
    }
}
```

### Responsive Design

```css
@media (max-width: 768px) {
    .header-title {
        font-size: 1.5rem;
    }
    
    .charts-grid {
        grid-template-columns: 1fr;
    }
    
    .metric-value {
        font-size: 1.5rem;
    }
}
```

---

## User Interactions

### Click Flow Diagram

```
User Clicks "Predict" Button
    │
    ▼
Collect Form Data
    │
    ▼
Validate Input (Frontend)
    │
    ├──► Invalid
    │     └──► Show Error Toast
    │           └──► Stop
    │
    └──► Valid
          │
          ▼
     Show Loading State
          │
          ▼
     Send to API
          │
          ├──► Error
          │     └──► Show Error Toast
          │           └──► Reset Button
          │
          └──► Success
                │
                ▼
           Display Results
                │
                ▼
           Scroll to Results
                │
                ▼
           Reset Button
```

---

## Next Steps

Continue to **Document 5: Deployment & Operations** to learn:
- How to deploy the application
- Configuration management
- Troubleshooting common issues
- Performance optimization
- Maintenance procedures
