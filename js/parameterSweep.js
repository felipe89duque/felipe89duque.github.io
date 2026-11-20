class ParameterSweep {
  constructor(calculator) {
    this.calculator = calculator;
    this.charts = new Map();
    this.sweeps = [
      { id: 'kOut', inputTableId: 'sweep-k-out-values', key: 'KOut', label: 'Extracellular potassium (mM)', valueLabel: 'potassium', unit: 'in millimolar', min: 0.5, max: 20, color: '#1f77b4' },
      { id: 'naOut', inputTableId: 'sweep-na-out-values', key: 'NaOut', label: 'Extracellular sodium (mM)', valueLabel: 'sodium', unit: 'in millimolar', min: 80, max: 200, color: '#ff7f0e' },
      { id: 'pK', inputTableId: 'sweep-pk-values', key: 'PK', label: 'Potassium permeability', valueLabel: 'potassium permeability', unit: '', min: 0, max: 1, color: '#2ca02c' },
      { id: 'pNa', inputTableId: 'sweep-pna-values', key: 'PNa', label: 'Sodium permeability', valueLabel: 'sodium permeability', unit: '', min: 0, max: 1, color: '#d62728' }
    ].filter((sweep) => document.getElementById(sweep.inputTableId));

    this.sweeps.forEach((sweep) => {
      const inputTable = document.getElementById(sweep.inputTableId);
      inputTable.append(this.createInputRow(sweep, 1));

      const canvas = document.getElementById(`sweep-chart-${sweep.id}`);
      this.charts.set(sweep.id, new Chart(canvas, {
        type: 'scatter',
        data: {
          datasets: [{
            label: 'Membrane potential (mV)',
            data: [],
            showLine: true,
            borderColor: sweep.color,
            backgroundColor: sweep.color,
            pointRadius: 5,
            pointHoverRadius: 7,
            borderWidth: 3,
            tension: 0.2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            title: { display: true, text: `${sweep.label} and membrane potential` }
          },
          scales: {
            x: {
              type: 'linear',
              title: { display: true, text: sweep.label }
            },
            y: {
              title: { display: true, text: 'Membrane potential (mV)' }
            }
          }
        }
      }));
    });

    document.querySelector('.parameter-sweeps').addEventListener('click', (event) => {
      const button = event.target.closest('button');
      if (!button) return;
      if (!button.classList.contains('add-sweep-row') &&
          !button.classList.contains('remove-sweep-row')) return;

      const card = button.closest('.sweep-card');
      const sweepId = card.querySelector('.add-sweep-row').dataset.sweepId;
      const sweep = this.sweeps.find((item) => item.id === sweepId);
      const inputTable = document.getElementById(sweep.inputTableId);
      const status = document.getElementById(`sweep-${sweep.id}-status`);

      if (button.classList.contains('add-sweep-row')) {
        const values = inputTable.querySelectorAll('.sweep-value');
        if (values.length >= 50) {
          status.textContent = 'A graph can contain no more than 50 values.';
          return;
        }
        const trial = values.length + 1;
        inputTable.append(this.createInputRow(sweep, trial));
        const input = inputTable.lastElementChild.querySelector('.sweep-value');
        input.focus();
        return;
      }

      if (button.classList.contains('remove-sweep-row')) {
        const rows = inputTable.querySelectorAll('tr');
        if (rows.length <= 1) {
          status.textContent = 'Keep at least one value in the input table.';
          return;
        }
        button.closest('tr').remove();
        this.relabelTrials(sweep, inputTable);
      }
    });
  }

  createInputRow(sweep, trial, value = '') {
    const row = document.createElement('tr');
    const rowHeader = document.createElement('th');
    rowHeader.scope = 'row';
    rowHeader.textContent = String(trial);
    const valueCell = document.createElement('td');
    const input = document.createElement('input');
    input.className = 'sweep-value';
    input.type = 'number';
    input.step = 'any';
    input.min = String(sweep.min);
    input.max = String(sweep.max);
    input.value = String(value);
    input.setAttribute('aria-label', `${sweep.valueLabel} trial ${trial} ${sweep.unit}`.trim());
    valueCell.append(input);

    const actionCell = document.createElement('td');
    const removeButton = document.createElement('button');
    removeButton.className = 'remove-sweep-row';
    removeButton.type = 'button';
    removeButton.textContent = 'Remove';
    removeButton.setAttribute('aria-label', `Remove ${sweep.valueLabel} trial ${trial}`);
    actionCell.append(removeButton);
    row.append(rowHeader, valueCell, actionCell);
    return row;
  }

  relabelTrials(sweep, inputTable) {
    inputTable.querySelectorAll('tr').forEach((row, index) => {
      const trial = index + 1;
      row.querySelector('th').textContent = String(trial);
      row.querySelector('.sweep-value').setAttribute('aria-label',
        `${sweep.valueLabel} trial ${trial} ${sweep.unit}`.trim());
      row.querySelector('.remove-sweep-row').setAttribute('aria-label',
        `Remove ${sweep.valueLabel} trial ${trial}`);
    });
  }

  parseValues(inputTable, sweep) {
    const inputs = Array.from(inputTable.querySelectorAll('.sweep-value'))
      .filter((input) => input.value.trim() !== '');
    if (inputs.length === 0) {
      throw new Error('Enter at least one value in the input table.');
    }
    if (inputs.length > 50) {
      throw new Error('Enter no more than 50 values.');
    }

    const invalidIndex = inputs.findIndex((input) => !input.checkValidity());
    if (invalidIndex !== -1) {
      const trial = inputs[invalidIndex].closest('tr').querySelector('th').textContent;
      throw new Error(`Enter a valid value between ${sweep.min} and ${sweep.max} for trial ${trial}.`);
    }
    return inputs.map((input) => Number(input.value));
  }

  removeEmptyRows(inputTable, sweep) {
    inputTable.querySelectorAll('tr').forEach((row) => {
      if (row.querySelector('.sweep-value').value.trim() === '') row.remove();
    });
    this.relabelTrials(sweep, inputTable);
  }

  calculatePoints(values, sweep, state) {
    return values.map((value) => {
      const ions = { ...state.ions };
      const permeability = { ...state.permeability };
      if (sweep.key.startsWith('P')) {
        permeability[sweep.key] = value;
      } else {
        ions[sweep.key] = value;
      }

      const membranePotential = this.calculator.ghk(
        permeability.PK,
        permeability.PNa,
        permeability.PCl,
        ions.KOut,
        ions.KIn,
        ions.NaOut,
        ions.NaIn,
        ions.ClOut,
        ions.ClIn
      );
      return { x: value, y: membranePotential };
    }).sort((first, second) => first.x - second.x);
  }

  run(state) {
    const errors = [];
    this.sweeps.forEach((sweep) => {
      const status = document.getElementById(`sweep-${sweep.id}-status`);
      const inputTable = document.getElementById(sweep.inputTableId);
      const chart = this.charts.get(sweep.id);
      let values;

      try {
        values = this.parseValues(inputTable, sweep);
      } catch (error) {
        chart.data.datasets[0].data = [];
        chart.update();
        status.textContent = error.message;
        errors.push(`${sweep.label}: ${error.message}`);
        return;
      }

      const points = this.calculatePoints(values, sweep, state);
      this.removeEmptyRows(inputTable, sweep);
      chart.data.datasets[0].data = points;
      chart.update();
      status.textContent = `${points.length} data points plotted.`;
    });

    return errors;
  }

  clear() {
    this.sweeps.forEach((sweep) => {
      this.charts.get(sweep.id).data.datasets[0].data = [];
      this.charts.get(sweep.id).update();
      document.getElementById(`sweep-${sweep.id}-status`).textContent =
        'Enter values, then run the simulation.';
      const inputTable = document.getElementById(sweep.inputTableId);
      inputTable.replaceChildren();
      inputTable.append(this.createInputRow(sweep, 1));
    });
  }
}
