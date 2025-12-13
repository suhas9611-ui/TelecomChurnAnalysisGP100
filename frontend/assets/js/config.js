// Configuration settings for the application
const CONFIG = {
    // API Configuration
    API: {
        BASE_URL: 'http://localhost:5001',
        ENDPOINTS: {
            CHURN_PREDICTION: '/predict',
            SENTIMENT_ANALYSIS: '/analyze_sentiment',
            DASHBOARD_DATA: '/dashboard_data',
            COMPLAINTS_DATA: '/complaints_data',
            CUSTOMER_DATA: '/customer_data'
        },
        TIMEOUT: 30000, // 30 seconds
        RETRY_ATTEMPTS: 3
    },

    // Chart Configuration
    CHARTS: {
        DEFAULT_COLORS: [
            '#1e40af', '#0891b2', '#059669', '#d97706', 
            '#dc2626', '#7c3aed', '#ea580c', '#65a30d'
        ],
        PLOTLY_CONFIG: {
            displayModeBar: false,
            responsive: true,
            displaylogo: false,
            modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d', 'autoScale2d']
        },
        PLOTLY_LAYOUT: {
            font: {
                family: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                size: 13,
                color: '#1e293b'
            },
            margin: { t: 40, r: 40, b: 80, l: 60 }, // Optimized margins for better fit
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            showlegend: false,
            xaxis: {
                tickangle: -45,
                tickfont: { size: 11, color: '#475569' },
                automargin: true,
                tickmode: 'linear',
                dtick: 1
            },
            yaxis: {
                tickfont: { size: 11, color: '#475569' },
                automargin: true
            },
            height: 300 // Optimized height for card containers
        }
    },

    // UI Configuration
    UI: {
        ANIMATION_DURATION: 300,
        DEBOUNCE_DELAY: 500,
        PAGINATION: {
            DEFAULT_PAGE_SIZE: 20,
            MAX_PAGE_SIZE: 100
        },
        TOAST: {
            DURATION: 5000,
            POSITION: 'top-right'
        }
    },

    // Data Configuration
    DATA: {
        REFRESH_INTERVAL: 300000, // 5 minutes
        CACHE_DURATION: 600000, // 10 minutes
        MAX_BATCH_SIZE: 1000
    },

    // Feature flags
    FEATURES: {
        REAL_TIME_UPDATES: false, // Disabled to prevent auto-refresh conflicts
        EXPORT_FUNCTIONALITY: true,
        ADVANCED_FILTERS: true
    },

    // Validation rules (updated for Indian market)
    VALIDATION: {
        TENURE: { min: 0, max: 100 },
        MONTHLY_CHARGES: { min: 0, max: 16600 }, // ~$200 in INR
        TOTAL_CHARGES: { min: 0, max: 830000 }, // ~$10000 in INR
        COMPLAINT_TEXT: { minLength: 10, maxLength: 1000 }
    },

    // Risk thresholds
    RISK_THRESHOLDS: {
        HIGH: 0.7,
        MEDIUM: 0.4,
        LOW: 0.0
    },

    // Sentiment thresholds
    SENTIMENT_THRESHOLDS: {
        POSITIVE: 0.6,
        NEGATIVE: 0.4
    }
};

// Utility functions for configuration
const ConfigUtils = {
    /**
     * Get API endpoint URL
     * @param {string} endpoint - Endpoint key
     * @returns {string} Full URL
     */
    getApiUrl(endpoint) {
        const baseUrl = CONFIG.API.BASE_URL;
        const endpointPath = CONFIG.API.ENDPOINTS[endpoint];
        
        if (!endpointPath) {
            throw new Error(`Unknown endpoint: ${endpoint}`);
        }
        
        return `${baseUrl}${endpointPath}`;
    },

    /**
     * Get risk level based on probability
     * @param {number} probability - Churn probability (0-1)
     * @returns {string} Risk level
     */
    getRiskLevel(probability) {
        if (probability >= CONFIG.RISK_THRESHOLDS.HIGH) {
            return 'high-risk';
        } else if (probability >= CONFIG.RISK_THRESHOLDS.MEDIUM) {
            return 'medium-risk';
        } else {
            return 'low-risk';
        }
    },

    /**
     * Get sentiment category based on scores
     * @param {Object} scores - Sentiment scores
     * @returns {string} Sentiment category
     */
    getSentimentCategory(scores) {
        const { positive, negative, neutral } = scores;
        
        if (positive > CONFIG.SENTIMENT_THRESHOLDS.POSITIVE) {
            return 'Positive';
        } else if (negative > CONFIG.SENTIMENT_THRESHOLDS.NEGATIVE) {
            return 'Negative';
        } else {
            return 'Neutral';
        }
    },

    /**
     * Format currency value in Indian Rupees with smart abbreviations
     * @param {number} value - Numeric value
     * @returns {string} Formatted currency
     */
    formatCurrency(value) {
        const inrValue = value * 83; // Convert USD to INR
        
        if (inrValue >= 10000000) { // 1 Crore
            return `₹${(inrValue / 10000000).toFixed(2)} Cr`;
        } else if (inrValue >= 100000) { // 1 Lakh
            return `₹${(inrValue / 100000).toFixed(2)} L`;
        } else if (inrValue >= 1000) { // 1 Thousand
            return `₹${(inrValue / 1000).toFixed(1)}K`;
        } else {
            return new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(inrValue);
        }
    },

    /**
     * Format large numbers with smart abbreviations
     * @param {number} value - Numeric value
     * @returns {string} Formatted number
     */
    formatLargeNumber(value) {
        if (value >= 10000000) { // 1 Crore
            return `${(value / 10000000).toFixed(2)} Cr`;
        } else if (value >= 100000) { // 1 Lakh
            return `${(value / 100000).toFixed(2)} L`;
        } else if (value >= 1000) { // 1 Thousand
            return `${(value / 1000).toFixed(1)}K`;
        } else {
            return this.formatNumber(value);
        }
    },

    /**
     * Format percentage value
     * @param {number} value - Numeric value (0-1)
     * @returns {string} Formatted percentage
     */
    formatPercentage(value) {
        return new Intl.NumberFormat('en-US', {
            style: 'percent',
            minimumFractionDigits: 1,
            maximumFractionDigits: 1
        }).format(value);
    },

    /**
     * Format number with commas
     * @param {number} value - Numeric value
     * @returns {string} Formatted number
     */
    formatNumber(value) {
        return new Intl.NumberFormat('en-US').format(value);
    },

    /**
     * Validate form field
     * @param {string} field - Field name
     * @param {any} value - Field value
     * @returns {Object} Validation result
     */
    validateField(field, value) {
        const rules = CONFIG.VALIDATION[field.toUpperCase()];
        
        if (!rules) {
            return { isValid: true };
        }

        const result = { isValid: true, errors: [] };

        // Check numeric ranges
        if (rules.min !== undefined && value < rules.min) {
            result.isValid = false;
            result.errors.push(`Value must be at least ${rules.min}`);
        }

        if (rules.max !== undefined && value > rules.max) {
            result.isValid = false;
            result.errors.push(`Value must be at most ${rules.max}`);
        }

        // Check string lengths
        if (rules.minLength !== undefined && value.length < rules.minLength) {
            result.isValid = false;
            result.errors.push(`Must be at least ${rules.minLength} characters`);
        }

        if (rules.maxLength !== undefined && value.length > rules.maxLength) {
            result.isValid = false;
            result.errors.push(`Must be at most ${rules.maxLength} characters`);
        }

        return result;
    }
};

// Export configuration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONFIG, ConfigUtils };
}