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
      type: 'line',
      data: {
        labels: [],
        datasets: [
          {
            label: 'Vm (Membrane Potential)',
            data: [],
            borderColor: '#FF6B6B',
            backgroundColor: 'rgba(255, 107, 107, 0.08)',
            borderWidth: 3,
            tension: 0.3,
            fill: false,
            pointRadius: 0,
            pointHoverRadius: 0,
            yAxisID: 'y'
          },
          {
            label: 'EK (K+ Equilibrium)',
            data: [],
            borderColor: '#4ECDC4',
            backgroundColor: 'rgba(78, 205, 196, 0.08)',
            borderWidth: 2,
            tension: 0.3,
            fill: false,
            pointRadius: 0,
            pointHoverRadius: 0,
            yAxisID: 'y',
            borderDash: [5, 5]
          },
          {
            label: 'ENa (Na+ Equilibrium)',
            data: [],
            borderColor: '#FFD93D',
            backgroundColor: 'rgba(255, 217, 61, 0.08)',
            borderWidth: 2,
            tension: 0.3,
            fill: false,
            pointRadius: 0,
            pointHoverRadius: 0,
            yAxisID: 'y',
            borderDash: [5, 5]
          },
          {
            label: 'ECl (Cl- Equilibrium)',
            data: [],
            borderColor: '#A8E6CF',
            backgroundColor: 'rgba(168, 230, 207, 0.08)',
            borderWidth: 2,
            tension: 0.3,
            fill: false,
            pointRadius: 0,
            pointHoverRadius: 0,
            yAxisID: 'y',
            borderDash: [5, 5]
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              usePointStyle: true,
              padding: 15,
              font: {
                size: 12,
                weight: 'bold'
              }
            }
          },
          title: {
            display: true,
            text: 'Membrane Potential Over Time',
            font: {
              size: 14,
              weight: 'bold'
            }
          }
        },
        scales: {
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: {
              display: true,
              text: 'Potential (mV)'
            },
            min: -150,
            max: 100
          }
        }
      }
    });
  }

  updateChart(history) {
    if (!this.chart) return;

    this.chart.data.labels = history.timestamps;
    this.chart.data.datasets[0].data = history.Vm;
    this.chart.data.datasets[1].data = history.EK;
    this.chart.data.datasets[2].data = history.ENa;
    this.chart.data.datasets[3].data = history.ECl;
    this.chart.update();
  }

  resizeChart() {
    if (!this.chart) return;
    this.chart.resize();
  }
}

