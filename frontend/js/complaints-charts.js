/**
 * Complaints Charts Module
 * Handles chart rendering for complaints data
 */

const ComplaintsCharts = {
    /**
     * Load and render all complaints charts
     */
    async loadCharts() {
        try {
            const data = await API.getComplaintsChartData();
            const container = document.getElementById('complaints-charts-container');
            
            if (!data.charts || data.charts.length === 0) {
                container.innerHTML = '<p class="text-center">No chart data available</p>';
                return;
            }
            
            // Clear loading message
            container.innerHTML = '';
            
            // Render each chart
            data.charts.forEach((chart, index) => {
                this.renderChart(chart, container, index);
            });
            
        } catch (error) {
            console.error('Error loading complaints charts:', error);
            showError('Failed to load charts: ' + error.message);
        }
    },
    
    /**
     * Render a single chart
     */
    renderChart(chartData, container, index) {
        // Create chart container
        const chartDiv = document.createElement('div');
        chartDiv.className = 'chart-container';
        chartDiv.id = `complaints-chart-${index}`;
        container.appendChild(chartDiv);
        
        // Prepare data for Plotly
        const traces = this.prepareChartTraces(chartData);
        
        // Chart layout for pie charts
        const layout = {
            title: {
                text: chartData.title || `Complaints by ${chartData.column}`,
                font: { 
                    size: 18, 
                    weight: 700,
                    color: '#0f172a'
                },
                x: 0.5,
                xanchor: 'center'
            },
            showlegend: true,
            legend: {
                orientation: 'v',
                y: 0.5,
                x: 1.1,
                xanchor: 'left',
                font: { size: 11 }
            },
            margin: { t: 60, b: 40, l: 40, r: 140 },
            height: 420,
            autosize: true,
            paper_bgcolor: '#ffffff'
        };
        
        // Render chart with config
        const config = {
            responsive: true,
            displaylogo: false,
            modeBarButtonsToRemove: ['pan2d', 'lasso2d']
        };
        
        Plotly.newPlot(chartDiv.id, traces, layout, config);
    },
    
    /**
     * Prepare chart traces from data
     */
    prepareChartTraces(chartData) {
        // Get labels and values
        const labels = chartData.data.map(item => item.label);
        const values = chartData.data.map(item => item.value);
        
        // Create color palette
        const colors = [
            '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', 
            '#10b981', '#06b6d4', '#6366f1', '#f97316',
            '#14b8a6', '#a855f7', '#ef4444', '#84cc16'
        ];
        
        // Create pie chart trace
        const trace = {
            labels: labels,
            values: values,
            type: 'pie',
            marker: {
                colors: colors.slice(0, labels.length)
            },
            textinfo: 'label+percent',
            textposition: 'auto',
            hoverinfo: 'label+value+percent',
            hole: 0
        };
        
        return [trace];
    }
};
