window.initializeTutorialControls = ({ visualization, resizeCharts }) => {
    const conceptSidebar = document.getElementById('conceptSidebar');
    const conceptToggle = document.getElementById('conceptToggle');

    if (conceptSidebar && conceptToggle) {
        conceptToggle.addEventListener('click', () => {
            const isCollapsed = conceptSidebar.classList.toggle('collapsed');
            conceptToggle.textContent = isCollapsed ? 'Show' : 'Hide';
            conceptToggle.setAttribute('aria-expanded', String(!isCollapsed));
        });
    }

    const chartContainer = document.querySelector('.chart-container');
    const expandChartButton = document.getElementById('expandChartBtn');
    if (chartContainer && expandChartButton) {
        expandChartButton.addEventListener('click', () => {
            chartContainer.classList.toggle('expanded');
            document.body.classList.toggle('chart-expanded');
            const expanded = chartContainer.classList.contains('expanded');

            if (expanded) {
                const chartContent = document.querySelector('.chart-and-content');
                if (chartContent) chartContent.scrollTop = 0;
            }

            expandChartButton.textContent = expanded ? 'Restore charts' : 'Expand charts';
            expandChartButton.setAttribute('aria-label', expandChartButton.textContent);
            expandChartButton.setAttribute('aria-pressed', String(expanded));
            window.setTimeout(resizeCharts, 50);
        });
    }

    const lockLinesButton = document.getElementById('lockLinesBtn');
    if (lockLinesButton && visualization) {
        lockLinesButton.addEventListener('click', () => {
            const locked = visualization.toggleLineLock();
            lockLinesButton.setAttribute('aria-pressed', String(locked));
            lockLinesButton.title = locked ? 'Unlock plotted lines' : 'Lock plotted lines';
            lockLinesButton.textContent = locked ? 'Unlock lines' : 'Lock lines';
            lockLinesButton.setAttribute('aria-label', lockLinesButton.title);
            lockLinesButton.classList.toggle('active', locked);
        });
    }
};
