/**
 * Charts Module
 * Handles chart rendering using Plotly
 */

const Charts = {
    /**
     * Load and render all charts
     */
    async loadCharts() {
        try {
            const data = await API.getChartData();
            const container = document.getElementById('charts-container');
            
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
            console.error('Error loading charts:', error);
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
        chartDiv.id = `chart-${index}`;
        container.appendChild(chartDiv);
        
        // Prepare data for Plotly
        const traces = this.prepareChartTraces(chartData);
        
        // Chart layout
        const layout = {
            title: {
                text: `Churn by ${chartData.column}`,
                font: { size: 16, weight: 600 }
            },
            barmode: 'group',
            xaxis: { title: chartData.column },
            yaxis: { title: 'Count' },
            showlegend: true,
            legend: {
                orientation: 'h',
                y: -0.2
            },
            margin: { t: 50, b: 80, l: 50, r: 20 },
            height: 400
        };
        
        // Render chart
        Plotly.newPlot(chartDiv.id, traces, layout, CONFIG.chartConfig);
    },
    
    /**
     * Prepare chart traces from data
     */
    prepareChartTraces(chartData) {
        // Group data by churn status
        const churnedData = {};
        const notChurnedData = {};
        
        chartData.data.forEach(item => {
            const category = item[chartData.column];
            const count = item.count;
            const churnStatus = item.Churn || item.churn || 0;
            
            if (churnStatus === 1 || churnStatus === '1') {
                churnedData[category] = count;
            } else {
                notChurnedData[category] = count;
            }
        });
        
        // Get all categories
        const categories = [...new Set([
            ...Object.keys(churnedData),
            ...Object.keys(notChurnedData)
        ])];
        
        // Create traces
        const traces = [
            {
                x: categories,
                y: categories.map(cat => notChurnedData[cat] || 0),
                name: 'Not Churned',
                type: 'bar',
                marker: { color: CONFIG.colors.churnNo }
            },
            {
                x: categories,
                y: categories.map(cat => churnedData[cat] || 0),
                name: 'Churned',
                type: 'bar',
                marker: { color: CONFIG.colors.churnYes }
            }
        ];
        
        return traces;
    }
};
