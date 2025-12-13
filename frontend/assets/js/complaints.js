// Complaints page functionality
const logger = console; // Simple logger for client-side

class ComplaintsPage {
    constructor() {
        this.data = null;
        this.filteredData = [];
        this.currentPage = 1;
        this.pageSize = CONFIG.UI.PAGINATION.DEFAULT_PAGE_SIZE;
        this.filters = {
            sentiment: 'all',
            category: 'all',
            channel: 'all',
            search: ''
        };
        
        this.init();
    }

    /**
     * Initialize complaints page
     */
    async init() {
        try {
            Utils.toggleLoadingOverlay(true, 'Loading complaints data...');
            
            await this.loadData();
            
            // Only render if data loaded successfully
            if (this.data && this.data.complaints) {
                this.renderOverview();
                this.renderCharts();
                this.renderTable();
                this.setupEventListeners();
                this.setupSentimentAnalysis();
            } else {
                throw new Error('No complaints data available');
            }
            
            Utils.toggleLoadingOverlay(false);
        } catch (error) {
            Utils.toggleLoadingOverlay(false);
            ErrorHandler.handle(error, 'Complaints page initialization');
            // Show user-friendly error message
            this.showErrorState('Unable to load complaints data. Please refresh the page or contact support.');
        }
    }

    /**
     * Load complaints data from API
     */
    async loadData() {
        try {
            const newData = await apiService.getComplaintsData();
            
            // Only update if we got valid data
            if (newData && newData.complaints && newData.overview && newData.charts) {
                this.data = newData;
                this.filteredData = [...this.data.complaints];
                logger.info('Complaints data loaded successfully');
            } else {
                throw new Error('Invalid data structure received from API');
            }
        } catch (error) {
            // If we already have data, keep it (don't overwrite with error)
            if (!this.data) {
                throw error;
            }
            console.warn('Failed to refresh complaints data, keeping existing data:', error);
        }
    }

    /**
     * Render overview metrics
     */
    renderOverview() {
        if (!this.data || !this.data.overview) {
            console.warn('No overview data available');
            return;
        }

        try {
            const { overview } = this.data;
            const total = overview.totalComplaints || 0;
            
            // Update counts with exact numbers (no formatting for complaints data)
            this.updateElement('total-complaints', total.toLocaleString());
            this.updateElement('negative-complaints', (overview.negativeComplaints || 0).toLocaleString());
            this.updateElement('neutral-complaints', (overview.neutralComplaints || 0).toLocaleString());
            this.updateElement('positive-complaints', (overview.positiveComplaints || 0).toLocaleString());
            
            // Update percentages and progress bars
            if (total > 0) {
                const negativePercent = Math.round(((overview.negativeComplaints || 0) / total) * 100);
                const neutralPercent = Math.round(((overview.neutralComplaints || 0) / total) * 100);
                const positivePercent = Math.round(((overview.positiveComplaints || 0) / total) * 100);
                
                this.updateElement('negative-percentage', `${negativePercent}%`);
                this.updateElement('neutral-percentage', `${neutralPercent}%`);
                this.updateElement('positive-percentage', `${positivePercent}%`);
                
                // Update progress bars
                const negativeBar = document.getElementById('negative-bar');
                const neutralBar = document.getElementById('neutral-bar');
                const positiveBar = document.getElementById('positive-bar');
                
                if (negativeBar) negativeBar.style.width = `${negativePercent}%`;
                if (neutralBar) neutralBar.style.width = `${neutralPercent}%`;
                if (positiveBar) positiveBar.style.width = `${positivePercent}%`;
            }
        } catch (error) {
            console.error('Error rendering overview:', error);
            // Don't show error to user, just log it
        }
    }

    /**
     * Render all charts
     */
    renderCharts() {
        if (!this.data || !this.data.charts) {
            console.warn('No chart data available');
            return;
        }

        try {
            const { charts } = this.data;
            
            // Render each chart individually with error handling
            if (charts.sentimentTrend) {
                this.renderSentimentTrendChart(charts.sentimentTrend);
            }
            if (charts.complaintsByCategory) {
                this.renderComplaintsByCategoryChart(charts.complaintsByCategory);
            }
            if (charts.sentimentDistribution) {
                this.renderSentimentDistributionChart(charts.sentimentDistribution);
            }
            if (charts.channelAnalysis) {
                this.renderChannelAnalysisChart(charts.channelAnalysis);
            }
            if (charts.resolutionTime) {
                this.renderResolutionTimeChart(charts.resolutionTime);
            }
        } catch (error) {
            console.error('Error rendering charts:', error);
            // Don't show error to user, charts will remain empty
        }
    }

    /**
     * Get responsive layout configuration for better alignment
     */
    getResponsiveLayout(baseLayout) {
        const isMobile = window.innerWidth <= 768;
        const isTablet = window.innerWidth <= 1024 && window.innerWidth > 768;
        const isLargeScreen = window.innerWidth >= 1200;
        
        if (isMobile) {
            return {
                ...baseLayout,
                height: 280,
                margin: { t: 40, r: 25, b: 70, l: 60 },
                font: { ...baseLayout.font, size: 10 },
                xaxis: {
                    ...baseLayout.xaxis,
                    tickfont: { size: 9 },
                    tickangle: -45,
                    automargin: true
                },
                yaxis: {
                    ...baseLayout.yaxis,
                    tickfont: { size: 9 },
                    automargin: true
                }
            };
        } else if (isTablet) {
            return {
                ...baseLayout,
                height: 320,
                margin: { t: 45, r: 35, b: 80, l: 65 },
                font: { ...baseLayout.font, size: 11 },
                xaxis: {
                    ...baseLayout.xaxis,
                    automargin: true
                },
                yaxis: {
                    ...baseLayout.yaxis,
                    automargin: true
                }
            };
        } else if (isLargeScreen) {
            return {
                ...baseLayout,
                margin: { t: 50, r: 40, b: 90, l: 70 },
                font: { ...baseLayout.font, size: 12 },
                xaxis: {
                    ...baseLayout.xaxis,
                    automargin: true
                },
                yaxis: {
                    ...baseLayout.yaxis,
                    automargin: true
                }
            };
        }
        
        return {
            ...baseLayout,
            margin: { t: 45, r: 35, b: 85, l: 65 },
            xaxis: {
                ...baseLayout.xaxis,
                automargin: true
            },
            yaxis: {
                ...baseLayout.yaxis,
                automargin: true
            }
        };
    }

    /**
     * Render sentiment trend chart
     */
    renderSentimentTrendChart(data) {
        try {
            if (!data || !data.dates || !data.positive || !data.neutral || !data.negative) {
                console.warn('Invalid sentiment trend data');
                return;
            }

            const traces = [
                {
                    x: data.dates,
                    y: data.positive,
                    type: 'scatter',
                    mode: 'lines+markers',
                    name: 'Positive',
                    line: { color: '#059669', width: 3 }, // Green
                    marker: { size: 6 }
                },
                {
                    x: data.dates,
                    y: data.neutral,
                    type: 'scatter',
                    mode: 'lines+markers',
                    name: 'Neutral',
                    line: { color: '#0891b2', width: 3 }, // Blue
                    marker: { size: 6 }
                },
                {
                    x: data.dates,
                    y: data.negative,
                    type: 'scatter',
                    mode: 'lines+markers',
                    name: 'Negative',
                    line: { color: '#dc2626', width: 3 }, // Red
                    marker: { size: 6 }
                }
            ];

            const baseLayout = {
                ...CONFIG.CHARTS.PLOTLY_LAYOUT,
                title: '',
                xaxis: { 
                    title: {
                        text: 'Date',
                        font: { size: 12, color: '#374151' }
                    },
                    tickangle: -45,
                    automargin: true,
                    gridcolor: '#f3f4f6',
                    tickfont: { size: 10, color: '#6b7280' }
                },
                yaxis: { 
                    title: {
                        text: 'Number of Complaints',
                        font: { size: 12, color: '#374151' }
                    },
                    automargin: true,
                    gridcolor: '#f3f4f6',
                    tickfont: { size: 10, color: '#6b7280' }
                },
                showlegend: true,
                legend: {
                    orientation: 'h',
                    x: 0.5,
                    xanchor: 'center',
                    y: 1.05,
                    font: { size: 11, color: '#374151' },
                    bgcolor: 'rgba(255,255,255,0.8)',
                    bordercolor: '#e5e7eb',
                    borderwidth: 1
                },
                height: 380,
                margin: { t: 70, r: 40, b: 90, l: 70 },
                plot_bgcolor: 'rgba(0,0,0,0)',
                paper_bgcolor: 'rgba(0,0,0,0)'
            };

            const layout = this.getResponsiveLayout(baseLayout);
            Plotly.newPlot('sentiment-trend-chart', traces, layout, CONFIG.CHARTS.PLOTLY_CONFIG);
        } catch (error) {
            console.error('Error rendering sentiment trend chart:', error);
        }
    }

    /**
     * Render complaints by category chart
     */
    renderComplaintsByCategoryChart(data) {
        try {
            if (!data || !data.categories || !data.counts) {
                console.warn('Invalid complaints by category data');
                return;
            }

        const trace = {
            x: data.categories,
            y: data.counts,
            type: 'bar',
            marker: {
                color: CONFIG.CHARTS.DEFAULT_COLORS,
                line: { color: '#ffffff', width: 1 }
            },
            hovertemplate: '<b>%{x}</b><br>Complaints: %{y}<extra></extra>'
        };

        const baseLayout = {
            ...CONFIG.CHARTS.PLOTLY_LAYOUT,
            title: '',
            xaxis: { 
                title: {
                    text: 'Complaint Category',
                    font: { size: 12, color: '#374151' }
                },
                tickangle: -30,
                automargin: true,
                tickfont: { size: 10, color: '#6b7280' },
                gridcolor: '#f3f4f6'
            },
            yaxis: { 
                title: {
                    text: 'Number of Complaints',
                    font: { size: 12, color: '#374151' }
                },
                automargin: true,
                tickfont: { size: 10, color: '#6b7280' },
                gridcolor: '#f3f4f6'
            },
            margin: { t: 40, r: 35, b: 110, l: 70 },
            plot_bgcolor: 'rgba(0,0,0,0)',
            paper_bgcolor: 'rgba(0,0,0,0)'
        };

        const layout = this.getResponsiveLayout(baseLayout);
        Plotly.newPlot('complaints-by-category-chart', [trace], layout, CONFIG.CHARTS.PLOTLY_CONFIG);
        } catch (error) {
            console.error('Error rendering complaints by category chart:', error);
        }
    }

    /**
     * Render sentiment distribution chart
     */
    renderSentimentDistributionChart(data) {
        try {
            if (!data || !data.labels || !data.values) {
                console.warn('Invalid sentiment distribution data');
                return;
            }
        // Map colors correctly: Positive=Green, Negative=Red, Neutral=Blue
        const colorMap = {
            'Positive': '#059669', // Green
            'Negative': '#dc2626', // Red
            'Neutral': '#0891b2'   // Blue
        };
        
        const colors = data.labels.map(label => colorMap[label] || '#64748b');
        
        const trace = {
            values: data.values,
            labels: data.labels,
            type: 'pie',
            marker: {
                colors: colors,
                line: { color: '#ffffff', width: 2 }
            },
            textinfo: 'label+percent',
            textposition: 'auto',
            hovertemplate: '<b>%{label}</b><br>Count: %{value}<br>Percentage: %{percent}<extra></extra>'
        };

        const baseLayout = {
            ...CONFIG.CHARTS.PLOTLY_LAYOUT,
            title: '',
            showlegend: true,
            legend: {
                orientation: 'h',
                x: 0.5,
                xanchor: 'center',
                y: -0.15,
                font: { size: 11, color: '#374151' },
                bgcolor: 'rgba(255,255,255,0.8)',
                bordercolor: '#e5e7eb',
                borderwidth: 1
            },
            margin: { t: 30, r: 30, b: 80, l: 30 },
            plot_bgcolor: 'rgba(0,0,0,0)',
            paper_bgcolor: 'rgba(0,0,0,0)'
        };

        const layout = this.getResponsiveLayout(baseLayout);
        Plotly.newPlot('sentiment-distribution-chart', [trace], layout, CONFIG.CHARTS.PLOTLY_CONFIG);
        } catch (error) {
            console.error('Error rendering sentiment distribution chart:', error);
        }
    }

    /**
     * Render channel analysis chart
     */
    renderChannelAnalysisChart(data) {
        try {
            if (!data || !data.channels || !data.counts) {
                console.warn('Invalid channel analysis data');
                return;
            }
        const trace = {
            x: data.channels,
            y: data.counts,
            type: 'bar',
            marker: {
                color: '#7c3aed',
                line: { color: '#ffffff', width: 1 }
            },
            hovertemplate: '<b>%{x}</b><br>Complaints: %{y}<extra></extra>'
        };

        const baseLayout = {
            ...CONFIG.CHARTS.PLOTLY_LAYOUT,
            title: '',
            xaxis: { 
                title: {
                    text: 'Communication Channel',
                    font: { size: 12, color: '#374151' }
                },
                tickangle: -20,
                automargin: true,
                tickfont: { size: 10, color: '#6b7280' },
                gridcolor: '#f3f4f6'
            },
            yaxis: { 
                title: {
                    text: 'Number of Complaints',
                    font: { size: 12, color: '#374151' }
                },
                automargin: true,
                tickfont: { size: 10, color: '#6b7280' },
                gridcolor: '#f3f4f6'
            },
            margin: { t: 40, r: 35, b: 90, l: 70 },
            plot_bgcolor: 'rgba(0,0,0,0)',
            paper_bgcolor: 'rgba(0,0,0,0)'
        };

        const layout = this.getResponsiveLayout(baseLayout);
        Plotly.newPlot('channel-analysis-chart', [trace], layout, CONFIG.CHARTS.PLOTLY_CONFIG);
        } catch (error) {
            console.error('Error rendering channel analysis chart:', error);
        }
    }

    /**
     * Render resolution time chart
     */
    renderResolutionTimeChart(data) {
        try {
            if (!data || !data.categories || !data.avgResolutionTime) {
                console.warn('Invalid resolution time data');
                return;
            }
        const trace = {
            x: data.categories,
            y: data.avgResolutionTime,
            type: 'bar',
            marker: {
                color: '#ea580c',
                line: { color: '#ffffff', width: 1 }
            },
            hovertemplate: '<b>%{x}</b><br>Avg Time: %{y} hours<extra></extra>'
        };

        const baseLayout = {
            ...CONFIG.CHARTS.PLOTLY_LAYOUT,
            title: '',
            xaxis: { 
                title: {
                    text: 'Category',
                    font: { size: 12, color: '#374151' }
                },
                tickangle: -20,
                automargin: true,
                tickfont: { size: 10, color: '#6b7280' },
                gridcolor: '#f3f4f6'
            },
            yaxis: { 
                title: {
                    text: 'Avg Resolution Time (hours)',
                    font: { size: 12, color: '#374151' }
                },
                automargin: true,
                tickfont: { size: 10, color: '#6b7280' },
                gridcolor: '#f3f4f6'
            },
            margin: { t: 40, r: 35, b: 90, l: 70 },
            plot_bgcolor: 'rgba(0,0,0,0)',
            paper_bgcolor: 'rgba(0,0,0,0)'
        };

        const layout = this.getResponsiveLayout(baseLayout);
        Plotly.newPlot('resolution-time-chart', [trace], layout, CONFIG.CHARTS.PLOTLY_CONFIG);
        } catch (error) {
            console.error('Error rendering resolution time chart:', error);
        }
    }

    /**
     * Render complaints table
     */
    renderTable() {
        this.populateFilterOptions();
        this.updateTable();
        this.updatePagination();
    }

    /**
     * Populate filter dropdown options
     */
    populateFilterOptions() {
        if (!this.data || !this.data.complaints) return;

        const complaints = this.data.complaints;
        
        // Get unique categories
        const categories = [...new Set(complaints.map(c => c.category))];
        this.populateSelect('filter-category', categories);
        
        // Get unique channels
        const channels = [...new Set(complaints.map(c => c.channel))];
        this.populateSelect('filter-channel', channels);
    }

    /**
     * Populate select element with options
     */
    populateSelect(selectId, options) {
        const select = document.getElementById(selectId);
        if (!select) return;

        // Keep the "All" option and add new options
        const currentOptions = Array.from(select.options).slice(1);
        currentOptions.forEach(option => option.remove());

        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option;
            optionElement.textContent = Utils.toTitleCase(option);
            select.appendChild(optionElement);
        });
    }

    /**
     * Update complaints table
     */
    updateTable() {
        const tableBody = document.getElementById('complaints-table-body');
        if (!tableBody) return;

        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        const pageData = this.filteredData.slice(startIndex, endIndex);

        if (pageData.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center">No complaints found matching your criteria</td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = pageData.map(complaint => `
            <tr>
                <td>${complaint.id}</td>
                <td>${complaint.customerId}</td>
                <td>${Utils.formatDate(complaint.date)}</td>
                <td>${Utils.toTitleCase(complaint.category)}</td>
                <td>${Utils.toTitleCase(complaint.channel)}</td>
                <td>
                    <span class="status-badge ${complaint.sentiment.toLowerCase()}">
                        ${complaint.sentiment}
                    </span>
                </td>
                <td>
                    <span class="status-badge ${this.getStatusClass(complaint.status)}">
                        ${complaint.status}
                    </span>
                </td>
                <td title="${complaint.text}">
                    ${Utils.truncateText(complaint.text, 50)}
                </td>
            </tr>
        `).join('');
    }

    /**
     * Get status CSS class
     */
    getStatusClass(status) {
        const statusMap = {
            'Open': 'negative',
            'In Progress': 'neutral',
            'Resolved': 'positive',
            'Closed': 'positive'
        };
        return statusMap[status] || 'neutral';
    }

    /**
     * Update pagination
     */
    updatePagination() {
        const totalPages = Math.ceil(this.filteredData.length / this.pageSize);
        
        this.updateElement('page-info', `Page ${this.currentPage} of ${totalPages}`);
        
        const prevBtn = document.getElementById('prev-page');
        const nextBtn = document.getElementById('next-page');
        
        if (prevBtn) {
            prevBtn.disabled = this.currentPage <= 1;
        }
        
        if (nextBtn) {
            nextBtn.disabled = this.currentPage >= totalPages;
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Filter controls
        const filterSentiment = document.getElementById('filter-sentiment');
        const filterCategory = document.getElementById('filter-category');
        const filterChannel = document.getElementById('filter-channel');
        const searchInput = document.getElementById('search-complaints');

        if (filterSentiment) {
            filterSentiment.addEventListener('change', (e) => {
                this.filters.sentiment = e.target.value;
                this.applyFilters();
            });
        }

        if (filterCategory) {
            filterCategory.addEventListener('change', (e) => {
                this.filters.category = e.target.value;
                this.applyFilters();
            });
        }

        if (filterChannel) {
            filterChannel.addEventListener('change', (e) => {
                this.filters.channel = e.target.value;
                this.applyFilters();
            });
        }

        if (searchInput) {
            searchInput.addEventListener('input', Utils.debounce((e) => {
                this.filters.search = e.target.value.toLowerCase();
                this.applyFilters();
            }, CONFIG.UI.DEBOUNCE_DELAY));
        }

        // Pagination
        const prevBtn = document.getElementById('prev-page');
        const nextBtn = document.getElementById('next-page');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.previousPage());
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextPage());
        }

        // Export button
        const exportBtn = document.getElementById('export-complaints');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportComplaints());
        }

        // Time period filter
        const trendPeriod = document.getElementById('trend-period');
        if (trendPeriod) {
            trendPeriod.addEventListener('change', (e) => {
                this.updateTrendChart(e.target.value);
            });
        }

        // Window resize handler for chart responsiveness
        window.addEventListener('resize', this.debounce(() => {
            this.handleWindowResize();
        }, 300));
    }

    /**
     * Apply filters to complaints data
     */
    applyFilters() {
        if (!this.data || !this.data.complaints) return;

        this.filteredData = this.data.complaints.filter(complaint => {
            // Sentiment filter
            if (this.filters.sentiment !== 'all' && 
                complaint.sentiment !== this.filters.sentiment) {
                return false;
            }

            // Category filter
            if (this.filters.category !== 'all' && 
                complaint.category !== this.filters.category) {
                return false;
            }

            // Channel filter
            if (this.filters.channel !== 'all' && 
                complaint.channel !== this.filters.channel) {
                return false;
            }

            // Search filter
            if (this.filters.search && 
                !complaint.text.toLowerCase().includes(this.filters.search)) {
                return false;
            }

            return true;
        });

        this.currentPage = 1;
        this.updateTable();
        this.updatePagination();
    }

    /**
     * Go to previous page
     */
    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.updateTable();
            this.updatePagination();
        }
    }

    /**
     * Go to next page
     */
    nextPage() {
        const totalPages = Math.ceil(this.filteredData.length / this.pageSize);
        if (this.currentPage < totalPages) {
            this.currentPage++;
            this.updateTable();
            this.updatePagination();
        }
    }

    /**
     * Export complaints data
     */
    exportComplaints() {
        if (!this.filteredData.length) {
            Utils.showToast('No data to export', 'warning');
            return;
        }

        const exportData = this.filteredData.map(complaint => ({
            id: complaint.id,
            customer_id: complaint.customerId,
            date: complaint.date,
            category: complaint.category,
            channel: complaint.channel,
            sentiment: complaint.sentiment,
            status: complaint.status,
            complaint_text: complaint.text
        }));

        const csvContent = Utils.arrayToCsv(exportData);
        const filename = `complaints_export_${new Date().toISOString().split('T')[0]}.csv`;

        Utils.downloadFile(csvContent, filename, 'text/csv');
        Utils.showToast('Complaints data exported successfully', 'success');
    }

    /**
     * Setup sentiment analysis functionality
     */
    setupSentimentAnalysis() {
        const analyzeBtn = document.getElementById('analyze-sentiment');
        const clearBtn = document.getElementById('clear-text');
        const textArea = document.getElementById('complaint-text');

        if (analyzeBtn) {
            analyzeBtn.addEventListener('click', () => this.analyzeSentiment());
        }

        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                if (textArea) {
                    textArea.value = '';
                }
                this.hideSentimentResults();
            });
        }
    }

    /**
     * Analyze sentiment of input text
     */
    async analyzeSentiment() {
        const textArea = document.getElementById('complaint-text');
        
        if (!textArea || !textArea.value.trim()) {
            Utils.showToast('Please enter some text to analyze', 'warning');
            return;
        }

        try {
            Utils.toggleLoadingOverlay(true, 'Analyzing sentiment...');

            const result = await apiService.analyzeSentiment(textArea.value.trim());
            
            this.displaySentimentResults(result);
            
            Utils.toggleLoadingOverlay(false);
            Utils.showToast('Sentiment analysis completed', 'success');

        } catch (error) {
            Utils.toggleLoadingOverlay(false);
            ErrorHandler.handle(error, 'Sentiment analysis');
        }
    }

    /**
     * Display sentiment analysis results
     */
    displaySentimentResults(result) {
        const resultsSection = document.getElementById('sentiment-results');
        
        if (!resultsSection) return;

        resultsSection.classList.remove('hidden');

        // Update main sentiment
        const sentiment = result.sentiment || 'Neutral';
        const confidence = result.confidence || 0.5;
        
        this.updateElement('predicted-sentiment', sentiment);
        this.updateElement('sentiment-confidence', ConfigUtils.formatPercentage(confidence));

        // Update sentiment icon
        const sentimentIcon = document.getElementById('sentiment-icon');
        if (sentimentIcon) {
            const icons = {
                'Positive': '😊',
                'Neutral': '😐',
                'Negative': '😠'
            };
            sentimentIcon.textContent = icons[sentiment] || '😐';
        }

        // Update category if available
        if (result.category) {
            this.updateElement('predicted-category', Utils.toTitleCase(result.category));
        }

        // Update confidence bar
        const confidenceFill = document.getElementById('sentiment-confidence-fill');
        if (confidenceFill) {
            confidenceFill.style.width = `${confidence * 100}%`;
        }

        // Update detailed scores
        if (result.scores) {
            this.updateDetailedScores(result.scores);
        }

        Utils.scrollTo(resultsSection);
    }

    /**
     * Update detailed sentiment scores
     */
    updateDetailedScores(scores) {
        const scoreElements = {
            positive: {
                fill: document.getElementById('positive-score'),
                value: document.getElementById('positive-value')
            },
            neutral: {
                fill: document.getElementById('neutral-score'),
                value: document.getElementById('neutral-value')
            },
            negative: {
                fill: document.getElementById('negative-score'),
                value: document.getElementById('negative-value')
            }
        };

        Object.keys(scoreElements).forEach(sentiment => {
            const score = scores[sentiment] || 0;
            const elements = scoreElements[sentiment];

            if (elements.fill) {
                elements.fill.style.width = `${score * 100}%`;
            }

            if (elements.value) {
                elements.value.textContent = ConfigUtils.formatPercentage(score);
            }
        });
    }

    /**
     * Hide sentiment results
     */
    hideSentimentResults() {
        const resultsSection = document.getElementById('sentiment-results');
        if (resultsSection) {
            resultsSection.classList.add('hidden');
        }
    }

    /**
     * Update trend chart based on period
     */
    async updateTrendChart(period) {
        try {
            const data = await apiService.getComplaintsData({ period });
            if (data.charts && data.charts.sentimentTrend) {
                this.renderSentimentTrendChart(data.charts.sentimentTrend);
            }
        } catch (error) {
            ErrorHandler.handle(error, 'Trend chart update');
        }
    }

    /**
     * Update element content safely
     */
    updateElement(id, content) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = content;
        }
    }

    /**
     * Format numbers for display
     */
    formatNumber(num) {
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    /**
     * Format category names for display
     */
    formatCategory(category) {
        return category.replace('_', ' ');
    }

    /**
     * Format date for display
     */
    formatDate(dateStr) {
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (e) {
            return dateStr;
        }
    }

    /**
     * Truncate text for display
     */
    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    /**
     * Handle window resize for chart responsiveness
     */
    handleWindowResize() {
        if (this.data && this.data.charts) {
            // Redraw all charts with new responsive settings
            setTimeout(() => {
                this.renderCharts();
            }, 100);
        }
    }

    /**
     * Debounce function to limit function calls
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Show error state when data fails to load
     */
    showErrorState(message) {
        const mainContent = document.querySelector('.complaints-main');
        if (mainContent) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-state';
            errorDiv.style.cssText = 'text-align: center; padding: 60px 20px; color: #dc2626;';
            errorDiv.innerHTML = `
                <div style="font-size: 48px; margin-bottom: 20px;">⚠️</div>
                <h2 style="font-size: 24px; margin-bottom: 10px;">Unable to Load Data</h2>
                <p style="font-size: 16px; color: #6b7280; margin-bottom: 20px;">${message}</p>
                <button onclick="location.reload()" class="btn btn-primary">Refresh Page</button>
            `;
            mainContent.innerHTML = '';
            mainContent.appendChild(errorDiv);
        }
    }
}

// Initialize complaints page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.complaintsPage = new ComplaintsPage();
});