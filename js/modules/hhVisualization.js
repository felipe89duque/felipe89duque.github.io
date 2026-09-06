/**
 * Hodgkin-Huxley Action Potential Visualization
 * Manages three chart displays: Vm+Stimulus, Ion Currents, and Driving Forces
 */

class HodgkinHuxleyVisualization {
  constructor(vmCanvasId, currentCanvasId, drivingForceCanvasId) {
    this.vmChart = null;
    this.currentChart = null;
    this.drivingForceChart = null;
    this.vmCanvasId = vmCanvasId;
    this.currentCanvasId = currentCanvasId;
    this.drivingForceCanvasId = drivingForceCanvasId;

    this.linesLocked = false;
    this.runNumber = 0;
    this.initializeCharts();
  }

  /**
   * Initialize both charts
   */
  initializeCharts() {
    // Chart 1: Membrane potential and stimulus current
    const vmCtx = document.getElementById(this.vmCanvasId);
    if (vmCtx) {
      this.vmChart = new Chart(vmCtx, {
        type: 'line',
        data: {
          labels: [],
          datasets: [
            {
              label: 'Vm (mV)',
              data: [],
              borderColor: '#ff6b6b',
              borderWidth: 2,
              fill: false,
              tension: 0.1,
              pointRadius: 0,
              pointHoverRadius: 0,
              yAxisID: 'y-voltage'
            },
            {
              label: 'Stimulus (µA/cm²)',
              data: [],
              borderColor: '#4ecdc4',
              borderWidth: 1.5,
              borderDash: [5, 5],
              fill: true,
              fillColor: 'rgba(78, 205, 196, 0.1)',
              tension: 0.1,
              pointRadius: 0,
              pointHoverRadius: 0,
              yAxisID: 'y-current'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: 'index',
            intersect: false
          },
          plugins: {
            title: {
              display: true,
              text: 'Action Potential & Stimulus',
              font: { size: 14, weight: 'bold' }
            },
            legend: {
              display: true,
              position: 'top'
            }
          },
          scales: {
            x: {
              type: 'linear',
              position: 'bottom',
              title: {
                display: true,
                text: 'Time (ms)'
              }
            },
            'y-voltage': {
              type: 'linear',
              position: 'left',
              title: {
                display: true,
                text: 'Voltage (mV)'
              }
            },
            'y-current': {
              type: 'linear',
              position: 'right',
              title: {
                display: true,
                text: 'Current (µA/cm²)'
              },
              grid: {
                drawOnChartArea: false
              }
            }
          }
        }
      });
    }

    // Chart 2: Ion currents (Na+, K+, Leak)
    const currentCtx = document.getElementById(this.currentCanvasId);
    if (currentCtx) {
      this.currentChart = new Chart(currentCtx, {
        type: 'line',
        data: {
          labels: [],
          datasets: [
            {
              label: 'INa (mA/cm²)',
              data: [],
              borderColor: '#00a8e8',
              borderWidth: 2,
              fill: false,
              tension: 0.1,
              pointRadius: 0,
              pointHoverRadius: 0
            },
            {
              label: 'IK (mA/cm²)',
              data: [],
              borderColor: '#ffd60a',
              borderWidth: 2,
              fill: false,
              tension: 0.1,
              pointRadius: 0,
              pointHoverRadius: 0
            },
            {
              label: 'IL (mA/cm²)',
              data: [],
              borderColor: '#b5bdc8',
              borderWidth: 1.5,
              borderDash: [5, 5],
              fill: false,
              tension: 0.1,
              pointRadius: 0,
              pointHoverRadius: 0
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: 'index',
            intersect: false
          },
          plugins: {
            title: {
              display: true,
              text: 'Ionic Currents',
              font: { size: 14, weight: 'bold' }
            },
            legend: {
              display: true,
              position: 'top'
            }
          },
          scales: {
            x: {
              type: 'linear',
              position: 'bottom',
              title: {
                display: true,
                text: 'Time (ms)'
              }
            },
            y: {
              type: 'linear',
              title: {
                display: true,
                text: 'Current (µA/cm²)'
              }
            }
          }
        }
      });
    }

    // Chart 3: Driving forces (Na+ and K+)
    const drivingForceCtx = document.getElementById(this.drivingForceCanvasId);
    if (drivingForceCtx) {
      this.drivingForceChart = new Chart(drivingForceCtx, {
        type: 'line',
        data: {
          labels: [],
          datasets: [
            {
              label: 'VNa = Vm - ENa (mV)',
              data: [],
              borderColor: '#ff8c00',
              borderWidth: 2,
              fill: false,
              tension: 0.1,
              pointRadius: 0,
              pointHoverRadius: 0
            },
            {
              label: 'VK = Vm - EK (mV)',
              data: [],
              borderColor: '#6c63ff',
              borderWidth: 2,
              fill: false,
              tension: 0.1,
              pointRadius: 0,
              pointHoverRadius: 0
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: 'index',
            intersect: false
          },
          plugins: {
            title: {
              display: true,
              text: 'Ion Driving Forces',
              font: { size: 14, weight: 'bold' }
            },
            legend: {
              display: true,
              position: 'top'
            }
          },
          scales: {
            x: {
              type: 'linear',
              position: 'bottom',
              title: {
                display: true,
                text: 'Time (ms)'
              }
            },
            y: {
              type: 'linear',
              title: {
                display: true,
                text: 'Driving Force (mV)'
              }
            }
          }
        }
      });
    }
  }

  /**
   * Update charts with simulation history
   */
  updateCharts(history) {
    if (!history || !history.timestamps) {
      return;
    }

    this.runNumber += 1;
    [this.vmChart, this.currentChart, this.drivingForceChart].forEach(chart => this.prepareChartForRun(chart));

    // Update Vm + Stimulus chart
    if (this.vmChart) {
      this.vmChart.data.labels = history.timestamps;
      this.setCurrentRunData(this.vmChart, [history.Vm, history.stimCurrent]);
      this.vmChart.update('none'); // 'none' avoids animation for performance
    }

    // Update currents chart
    if (this.currentChart) {
      this.currentChart.data.labels = history.timestamps;
      this.setCurrentRunData(this.currentChart, [history.INa, history.IK, history.IL]);
      this.currentChart.update('none');
    }

    // Update driving forces chart
    if (this.drivingForceChart) {
      this.drivingForceChart.data.labels = history.timestamps;
      this.setCurrentRunData(this.drivingForceChart, [history.VNa, history.VK]);
      this.drivingForceChart.update('none');
    }
  }

  prepareChartForRun(chart) {
    if (!chart) return;
    chart.data.datasets.forEach(dataset => {
      if (typeof dataset.currentRun !== 'boolean') dataset.currentRun = true;
    });
    if (!this.linesLocked || this.runNumber === 1) return;

    const currentDatasets = chart.data.datasets.filter(dataset => dataset.currentRun);
    currentDatasets.forEach(dataset => {
      chart.data.datasets.push({
        ...dataset,
        label: `${dataset.baseLabel || dataset.label} (Run ${this.runNumber - 1})`,
        borderDash: [6, 4],
        borderWidth: Math.max(1, (dataset.borderWidth || 2) - 0.5),
        currentRun: false,
        data: [...dataset.data]
      });
    });
  }

  setCurrentRunData(chart, values) {
    const currentDatasets = chart.data.datasets.filter(dataset => dataset.currentRun);
    currentDatasets.forEach((dataset, index) => {
      dataset.baseLabel = dataset.baseLabel || dataset.label;
      dataset.label = this.linesLocked ? `${dataset.baseLabel} (Run ${this.runNumber})` : dataset.baseLabel;
      dataset.data = values[index];
    });
  }

  toggleLineLock() {
    this.linesLocked = !this.linesLocked;
    return this.linesLocked;
  }
  /**
   * Clear all charts
   */
  clearCharts() {
    if (this.vmChart) {
      this.vmChart.data.labels = [];
      this.vmChart.data.datasets = this.vmChart.data.datasets.filter(dataset => dataset.currentRun !== false);
      this.vmChart.data.datasets.forEach(dataset => {
        dataset.data = [];
      });
      this.vmChart.update('none');
    }

    if (this.currentChart) {
      this.currentChart.data.labels = [];
      this.currentChart.data.datasets = this.currentChart.data.datasets.filter(dataset => dataset.currentRun !== false);
      this.currentChart.data.datasets.forEach(dataset => {
        dataset.data = [];
      });
      this.currentChart.update('none');
    }

    if (this.drivingForceChart) {
      this.drivingForceChart.data.labels = [];
      this.drivingForceChart.data.datasets = this.drivingForceChart.data.datasets.filter(dataset => dataset.currentRun !== false);
      this.drivingForceChart.data.datasets.forEach(dataset => {
        dataset.data = [];
      });
      this.drivingForceChart.update('none');
    }
    this.runNumber = 0;
  }

  /**
   * Resize charts for responsive layout
   */
  resizeCharts() {
    if (this.vmChart) {
      this.vmChart.resize();
    }
    if (this.currentChart) {
      this.currentChart.resize();
    }
    if (this.drivingForceChart) {
      this.drivingForceChart.resize();
    }
  }
}
