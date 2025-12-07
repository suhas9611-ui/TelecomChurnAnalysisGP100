/**
 * Complaints Dashboard Main Module
 */

let complaintsData = [];
let filteredData = [];
let currentPage = 1;
const itemsPerPage = 10;

/**
 * Initialize the complaints dashboard
 */
async function initComplaintsDashboard() {
    try {
        // Load statistics
        await loadComplaintsStats();
        
        // Load charts
        await ComplaintsCharts.loadCharts();
        
        // Load complaints table
        await loadComplaintsTable();
        
        // Setup event listeners
        setupEventListeners();
        
    } catch (error) {
        console.error('Error initializing complaints dashboard:', error);
        showError('Failed to initialize dashboard: ' + error.message);
    }
}

/**
 * Load complaints statistics
 */
async function loadComplaintsStats() {
    try {
        const stats = await API.getComplaintsStats();
        
        document.getElementById('total-complaints').textContent = stats.total || 0;
        document.getElementById('negative-complaints').textContent = stats.negative || 0;
        document.getElementById('neutral-complaints').textContent = stats.neutral || 0;
        document.getElementById('positive-complaints').textContent = stats.positive || 0;
        
    } catch (error) {
        console.error('Error loading complaints stats:', error);
    }
}

/**
 * Load complaints table
 */
async function loadComplaintsTable() {
    try {
        const data = await API.getComplaints();
        complaintsData = data.complaints || [];
        filteredData = [...complaintsData];
        
        // Populate filter dropdowns
        populateFilters();
        
        // Display first page
        displayPage(1);
        
    } catch (error) {
        console.error('Error loading complaints table:', error);
        showError('Failed to load complaints: ' + error.message);
    }
}

/**
 * Populate filter dropdowns
 */
function populateFilters() {
    // Get unique categories
    const categories = [...new Set(complaintsData.map(c => c.IssueCategory))];
    const categorySelect = document.getElementById('filter-category');
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        categorySelect.appendChild(option);
    });
    
    // Get unique channels
    const channels = [...new Set(complaintsData.map(c => c.Channel))];
    const channelSelect = document.getElementById('filter-channel');
    channels.forEach(ch => {
        const option = document.createElement('option');
        option.value = ch;
        option.textContent = ch;
        channelSelect.appendChild(option);
    });
}

/**
 * Apply filters
 */
function applyFilters() {
    const sentiment = document.getElementById('filter-sentiment').value;
    const category = document.getElementById('filter-category').value;
    const channel = document.getElementById('filter-channel').value;
    
    filteredData = complaintsData.filter(complaint => {
        const matchSentiment = sentiment === 'all' || complaint.Sentiment === sentiment;
        const matchCategory = category === 'all' || complaint.IssueCategory === category;
        const matchChannel = channel === 'all' || complaint.Channel === channel;
        
        return matchSentiment && matchCategory && matchChannel;
    });
    
    currentPage = 1;
    displayPage(1);
}

/**
 * Reset filters
 */
function resetFilters() {
    document.getElementById('filter-sentiment').value = 'all';
    document.getElementById('filter-category').value = 'all';
    document.getElementById('filter-channel').value = 'all';
    
    filteredData = [...complaintsData];
    currentPage = 1;
    displayPage(1);
}

/**
 * Display a specific page of complaints
 */
function displayPage(page) {
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageData = filteredData.slice(start, end);
    
    const tbody = document.getElementById('complaints-table-body');
    
    if (pageData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="loading">No complaints found</td></tr>';
        return;
    }
    
    tbody.innerHTML = pageData.map(complaint => `
        <tr>
            <td>${complaint.ComplaintID}</td>
            <td>${complaint.CustomerID}</td>
            <td>${formatDate(complaint.Date)}</td>
            <td>${complaint.IssueCategory}</td>
            <td>${complaint.Channel}</td>
            <td><span class="sentiment-badge sentiment-${complaint.Sentiment.toLowerCase()}">${complaint.Sentiment}</span></td>
            <td>${complaint.ComplaintText}</td>
        </tr>
    `).join('');
    
    // Update pagination
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    document.getElementById('page-info').textContent = `Page ${page} of ${totalPages}`;
    document.getElementById('prev-page').disabled = page === 1;
    document.getElementById('next-page').disabled = page === totalPages;
    
    currentPage = page;
}

/**
 * Analyze sentiment of complaint text
 */
async function analyzeSentiment() {
    const text = document.getElementById('complaint-text').value.trim();
    
    if (!text) {
        showError('Please enter complaint text to analyze');
        return;
    }
    
    try {
        const button = document.getElementById('analyze-sentiment');
        button.textContent = 'Analyzing...';
        button.disabled = true;
        
        const result = await API.analyzeSentiment(text);
        
        displaySentimentResult(result);
        
        button.textContent = '🔍 Analyze Sentiment';
        button.disabled = false;
        
    } catch (error) {
        console.error('Error analyzing sentiment:', error);
        showError('Failed to analyze sentiment: ' + error.message);
        
        const button = document.getElementById('analyze-sentiment');
        button.textContent = '🔍 Analyze Sentiment';
        button.disabled = false;
    }
}

/**
 * Display sentiment analysis result
 */
function displaySentimentResult(result) {
    const resultDiv = document.getElementById('sentiment-result');
    const sentimentEl = document.getElementById('predicted-sentiment');
    const statusEl = document.getElementById('sentiment-status');
    const confidenceEl = document.getElementById('sentiment-confidence');
    const confidenceFill = document.getElementById('sentiment-confidence-fill');
    
    // Show result section
    resultDiv.classList.remove('hidden');
    
    // Display sentiment
    sentimentEl.textContent = result.sentiment;
    sentimentEl.className = `result-value sentiment-${result.sentiment.toLowerCase()}`;
    
    // Display status
    const statusClass = result.sentiment === 'Negative' ? 'danger' : 
                       result.sentiment === 'Positive' ? 'success' : 'neutral';
    
    const statusIcon = result.sentiment === 'Negative' ? '😠' :
                      result.sentiment === 'Positive' ? '😊' : '😐';
    
    const statusMessage = result.sentiment === 'Negative' ? 
        'This complaint expresses negative sentiment. Immediate attention recommended.' :
        result.sentiment === 'Positive' ? 
        'This complaint expresses positive sentiment or satisfaction.' :
        'This complaint expresses neutral sentiment.';
    
    statusEl.className = `result-status ${statusClass}`;
    statusEl.innerHTML = `
        <strong>${statusIcon} ${result.sentiment} Sentiment Detected</strong>
        <p class="mt-1">${statusMessage}</p>
    `;
    
    // Display confidence
    const confidence = result.confidence || 0.8;
    confidenceEl.textContent = formatPercentage(confidence);
    confidenceFill.style.width = formatPercentage(confidence);
    
    // Scroll to results
    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Filter buttons
    document.getElementById('apply-filters').addEventListener('click', applyFilters);
    document.getElementById('reset-filters').addEventListener('click', resetFilters);
    
    // Pagination
    document.getElementById('prev-page').addEventListener('click', () => {
        if (currentPage > 1) {
            displayPage(currentPage - 1);
        }
    });
    
    document.getElementById('next-page').addEventListener('click', () => {
        const totalPages = Math.ceil(filteredData.length / itemsPerPage);
        if (currentPage < totalPages) {
            displayPage(currentPage + 1);
        }
    });
    
    // Sentiment analysis
    document.getElementById('analyze-sentiment').addEventListener('click', analyzeSentiment);
}

/**
 * Format date string
 */
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

/**
 * Format percentage
 */
function formatPercentage(value) {
    return `${(value * 100).toFixed(1)}%`;
}

/**
 * Show error message
 */
function showError(message) {
    const toast = document.getElementById('error-toast');
    const messageEl = document.getElementById('error-message');
    
    messageEl.textContent = message;
    toast.classList.remove('hidden');
    
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 5000);
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', initComplaintsDashboard);
