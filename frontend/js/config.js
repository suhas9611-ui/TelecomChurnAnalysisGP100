/**
 * Configuration
 * API endpoints and app settings
 */

const CONFIG = {
    API_BASE_URL: 'http://localhost:5000/api',
    
    endpoints: {
        health: '/health',
        config: '/config',
        stats: '/stats',
        charts: '/charts',
        modelFeatures: '/model/features',
        predict: '/predict',
        complaintsStats: '/complaints/stats',
        complaintsCharts: '/complaints/charts',
        complaints: '/complaints',
        analyzeSentiment: '/complaints/analyze-sentiment'
    },
    
    colors: {
        primary: '#2563eb',
        secondary: '#10b981',
        danger: '#ef4444',
        churnYes: '#ef4444',
        churnNo: '#10b981'
    },
    
    chartConfig: {
        displayModeBar: false,
        responsive: true
    }
};

// Helper function to get full API URL
function getApiUrl(endpoint) {
    return CONFIG.API_BASE_URL + CONFIG.endpoints[endpoint];
}
