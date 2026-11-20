/**
 * Visualization Manager
 * Handles real-time plotting with Chart.js
 */

class Visualization {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.chart = null;

    if (this.ctx) {
      this.initChart();
    }
  }

  initChart() {
    this.chart = new Chart(this.ctx, {
      type: 'bar',
      data: {
        labels: [
          'Membrane potential (Vm)',
          'Potassium equilibrium (EK)',
          'Sodium equilibrium (ENa)',
          'Chloride equilibrium (ECl)'
        ],
        datasets: [
          {
            label: 'Potential (mV)',
            data: [],
            backgroundColor: ['#d62728', '#1f77b4', '#ff7f0e', '#2ca02c'],
            borderColor: ['#a51d24', '#195f90', '#c45e00', '#208020'],
            borderWidth: 2,
            borderRadius: 8,
            maxBarThickness: 64
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 650, easing: 'easeOutQuart' },
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: 'Current membrane potential and ion equilibrium potentials',
            font: {
              size: 14,
              weight: 'bold'
            }
          }
        },
        scales: {
          x: { grid: { display: false } },
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: {
              display: true,
              text: 'Potential (mV)'
            },
            min: -150,
            max: 100,
            ticks: { stepSize: 25 }
          }
        }
      }
    });
  }

  updateChart(state) {
    if (!this.chart) return;

    this.chart.data.datasets[0].data = [state.Vm, state.EK, state.ENa, state.ECl];
    this.chart.update();
  }

  applyExpandedLayout() {
    if (!this.chart || !this.chart.options || !this.chart.options.plugins) return;
    const expanded = document.body.classList.contains('chart-expanded');

    if (this.chart.options.plugins.title) {
      this.chart.options.plugins.title.display = true;
      this.chart.options.plugins.title.position = 'top';
    }

    this.chart.update('none');
  }

  resizeChart() {
    if (!this.chart) return;
    this.applyExpandedLayout();
    this.chart.resize();
  }
}
