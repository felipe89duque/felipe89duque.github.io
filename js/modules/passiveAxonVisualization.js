class PassiveAxonVisualization {
  constructor(timeCanvasId, spaceCanvasId) {
    this.animationFrame = null;
    this.isAnimating = false;
    this.linesLocked = false;
    this.runNumber = 0;
    this.timeChart = this.createTimeChart(timeCanvasId);
    this.spaceChart = this.createSpaceChart(spaceCanvasId);
    this.spaceTimeChart = this.createSpaceTimeChart('voltageSpaceTimeChart');
  }

  createTimeChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;
    return new Chart(canvas, {
      type: 'line',
      data: {
        datasets: [
          { label: 'x = 0', baseLabel: 'x = 0', data: [], borderColor: '#d94f70', borderWidth: 2, pointRadius: 0, tension: 0.1 },
          { label: 'x = 0.25', baseLabel: 'x = 0.25', data: [], borderColor: '#e58f3d', borderWidth: 2, pointRadius: 0, tension: 0.1 },
          { label: 'x = 0.5', baseLabel: 'x = 0.5', data: [], borderColor: '#2c9a9a', borderWidth: 2, pointRadius: 0, tension: 0.1 },
          { label: 'x = 0.75', baseLabel: 'x = 0.75', data: [], borderColor: '#4169a1', borderWidth: 2, pointRadius: 0, tension: 0.1 }
        ]
      },
      options: this.chartOptions('Time (ms)', 'Membrane voltage (mV)', 'Voltage-vs-Time'),
      plugins: [this.timeCursorPlugin()]
    });
  }

  createSpaceChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;
    return new Chart(canvas, {
      type: 'line',
      data: {
        datasets: [{
          label: 'Voltage at final time',
          baseLabel: 'Voltage profile',
          data: [],
          borderColor: '#245c73',
          backgroundColor: 'rgba(36, 92, 115, 0.12)',
          borderWidth: 3,
          pointRadius: 0,
          fill: true,
          tension: 0.12
        }]
      },
      options: this.chartOptions('Position along axon', 'Membrane voltage (mV)', 'Voltage-vs-Space'),
      plugins: [this.spaceMarkerPlugin()]
    });
  }

  createSpaceTimeChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;
    return new Chart(canvas, {
      type: 'line',
      data: {
        datasets: [{
          label: 'Voltage at 0.0 ms',
          baseLabel: 'Space-time voltage',
          data: [],
          borderColor: '#245c73',
          backgroundColor: 'rgba(36, 92, 115, 0.12)',
          borderWidth: 3,
          pointRadius: 0,
          fill: true,
          tension: 0.12
        }]
      },
      options: this.chartOptions('Position along axon', 'Membrane voltage (mV)', 'Voltage-vs-Space over time'),
      plugins: [this.spaceMarkerPlugin()]
    });
  }

  timeCursorPlugin() {
    return {
      id: 'passive-time-cursor',
      afterDraw(chart) {
        const { ctx, chartArea, scales } = chart;
        if (!chartArea || !scales.x || typeof chart.currentTime !== 'number') return;
        const x = scales.x.getPixelForValue(chart.currentTime);
        if (x < chartArea.left || x > chartArea.right) return;
        ctx.save();
        ctx.strokeStyle = '#245c73';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.moveTo(x, chartArea.top);
        ctx.lineTo(x, chartArea.bottom);
        ctx.stroke();
        ctx.restore();
      }
    };
  }

  spaceMarkerPlugin() {
    const markers = [
      { position: 0, label: 'x = 0', color: '#d94f70' },
      { position: 0.25, label: 'x = 0.25', color: '#e58f3d' },
      { position: 0.5, label: 'x = 0.5', color: '#2c9a9a' },
      { position: 0.75, label: 'x = 0.75', color: '#4169a1' }
    ];

    return {
      id: 'passive-space-markers',
      afterDraw(chart) {
        const { ctx, chartArea, scales } = chart;
        if (!chartArea || !scales.x) return;

        ctx.save();
        ctx.setLineDash([5, 4]);
        ctx.font = '600 11px sans-serif';
        ctx.textAlign = 'center';
        markers.forEach(marker => {
          const x = scales.x.getPixelForValue(marker.position);
          ctx.strokeStyle = marker.color;
          ctx.fillStyle = marker.color;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(x, chartArea.top);
          ctx.lineTo(x, chartArea.bottom);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.fillText(marker.label, x, chartArea.top + 14);
          ctx.setLineDash([5, 4]);
        });
        ctx.restore();
      }
    };
  }

  chartOptions(xTitle, yTitle, title) {
    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        title: { display: true, text: title, font: { size: 14, weight: 'bold' } },
        legend: { display: true, position: 'top' }
      },
      scales: {
        x: { type: 'linear', title: { display: true, text: xTitle } },
        y: { title: { display: true, text: yTitle } }
      }
    };
  }

  update(history) {
    this.lastHistory = history;
    this.runNumber += 1;
    [this.timeChart, this.spaceChart].forEach(chart => this.prepareChartForRun(chart));
    if (this.spaceTimeChart) {
      this.spaceTimeChart.data.datasets.forEach(dataset => { dataset.currentRun = true; });
    }
    if (this.timeChart) {
      history.electrodeVoltages.forEach((voltages, index) => {
        this.setCurrentRunData(this.timeChart, index, history.timestamps.map((time, point) => ({ x: time, y: voltages[point] })));
      });
      this.timeChart.update('none');
    }
    if (this.spaceChart) {
      this.setCurrentRunData(this.spaceChart, 0, history.positions.map((position, index) => ({
        x: position,
        y: history.spaceVoltage[index]
      })));
      const currentDataset = this.spaceChart.data.datasets.find(dataset => dataset.currentRun);
      if (currentDataset) {
        currentDataset.label = `${currentDataset.baseLabel} at ${history.timestamps[history.timestamps.length - 1].toFixed(1)} ms${this.linesLocked ? ` (Run ${this.runNumber})` : ''}`;
      }
      this.spaceChart.update('none');
    }
    this.setSpaceTimeVoltageRange(history);
    this.startAnimation(history);
  }

  prepareChartForRun(chart) {
    if (!chart) return;
    chart.data.datasets.forEach(dataset => {
      if (typeof dataset.currentRun !== 'boolean') dataset.currentRun = true;
    });
    if (!this.linesLocked || this.runNumber === 1) return;
    chart.data.datasets.filter(dataset => dataset.currentRun).forEach(dataset => {
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

  setCurrentRunData(chart, index, data) {
    const currentDatasets = chart.data.datasets.filter(dataset => dataset.currentRun);
    const dataset = currentDatasets[index];
    if (!dataset) return;
    dataset.baseLabel = dataset.baseLabel || dataset.label;
    dataset.label = this.linesLocked ? `${dataset.baseLabel} (Run ${this.runNumber})` : dataset.baseLabel;
    dataset.data = data;
  }

  toggleLineLock() {
    this.linesLocked = !this.linesLocked;
    return this.linesLocked;
  }

  setSpaceTimeVoltageRange(history) {
    if (!this.spaceTimeChart || !history.spaceSnapshots || history.spaceSnapshots.length === 0) return;

    let minimum = Infinity;
    let maximum = -Infinity;
    history.spaceSnapshots.forEach(snapshot => {
      snapshot.forEach(voltage => {
        minimum = Math.min(minimum, voltage);
        maximum = Math.max(maximum, voltage);
      });
    });
    const span = Math.max(maximum - minimum, 1);
    const padding = span * 0.08;

    this.spaceTimeChart.options.scales.y.min = minimum - padding;
    this.spaceTimeChart.options.scales.y.max = maximum + padding;
  }

  startAnimation(history) {
    this.stopAnimation();
    if (!this.spaceTimeChart || !history.spaceSnapshots || history.spaceSnapshots.length === 0) return;

    this.isAnimating = true;
    const finalTime = history.timestamps[history.timestamps.length - 1];
    const playbackDuration = Math.max(3000, Math.min(10000, finalTime * 250));
    const startedAt = performance.now();

    const renderFrame = now => {
      if (!this.isAnimating) return;
      const elapsed = (now - startedAt) % playbackDuration;
      const progress = elapsed / playbackDuration;
      const frame = Math.min(
        history.timestamps.length - 1,
        history.spaceSnapshots.length - 1,
        Math.floor(progress * (history.spaceSnapshots.length - 1))
      );
      const time = history.timestamps[frame];
      const voltage = history.spaceSnapshots[frame] || history.spaceVoltage;
      if (!voltage || typeof time !== 'number') return;
      this.spaceTimeChart.data.datasets[0].data = history.positions.map((position, index) => ({ x: position, y: voltage[index] }));
      const currentDataset = this.spaceTimeChart.data.datasets.find(dataset => dataset.currentRun);
      if (currentDataset) currentDataset.label = `${currentDataset.baseLabel || 'Voltage'} at ${time.toFixed(1)} ms${this.linesLocked ? ` (Run ${this.runNumber})` : ''}`;
      this.spaceTimeChart.update('none');
      this.timeChart.currentTime = time;
      this.timeChart.update('none');
      const clock = document.getElementById('space-time-clock');
      if (clock) clock.textContent = `Time: ${time.toFixed(1)} / ${finalTime.toFixed(1)} ms`;
      this.animationFrame = requestAnimationFrame(renderFrame);
    };

    renderFrame(performance.now());
  }

  stopAnimation() {
    this.isAnimating = false;
    if (this.animationFrame !== null) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  toggleAnimation() {
    if (this.isAnimating) {
      this.stopAnimation();
      return false;
    }
    if (this.lastHistory) this.startAnimation(this.lastHistory);
    return this.isAnimating;
  }

  clear() {
    this.stopAnimation();
    this.lastHistory = null;
    this.runNumber = 0;
    [this.timeChart, this.spaceChart, this.spaceTimeChart].forEach(chart => {
      if (!chart) return;
      chart.data.datasets = chart.data.datasets.filter(dataset => dataset.currentRun !== false);
      chart.data.datasets.forEach(dataset => { dataset.data = []; });
      chart.update('none');
    });
  }

  resize() {
    [this.timeChart, this.spaceChart, this.spaceTimeChart].forEach(chart => { if (chart) chart.resize(); });
  }
}
