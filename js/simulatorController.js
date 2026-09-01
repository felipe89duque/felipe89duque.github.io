/**
 * Simulator Controller
 * Manages all UI interactions and updates
 */

class SimulatorController {
  constructor() {
    this.simulator = new Simulator();
    this.visualization = new Visualization('vmChart');
    this.setupEventListeners();
    this.syncControlsFromModel();
    this.updateDisplay();
  }

  setupEventListeners() {
    this.setupControlListener('kOut', 'KOut');
    this.setupControlListener('naOut', 'NaOut');
    this.setupControlListener('clOut', 'ClOut');
    this.setupControlListener('kIn', 'KIn');
    this.setupControlListener('naIn', 'NaIn');
    this.setupControlListener('clIn', 'ClIn');

    this.setupPermeabilityListener('pK', 'K');
    this.setupPermeabilityListener('pNa', 'Na');
    this.setupPermeabilityListener('pCl', 'Cl');

    document.querySelectorAll('.condition-btn').forEach((btn) => {
      btn.addEventListener('click', (event) => {
        this.applyCondition(event.target.dataset.condition);
      });
    });

    document.getElementById('reset-btn').addEventListener('click', () => this.reset());
    document.getElementById('clear-btn').addEventListener('click', () => this.clearHistory());

    const toggleCalc = document.getElementById('toggle-calc');
    if (toggleCalc) {
      toggleCalc.addEventListener('click', () => {
        const content = document.getElementById('calc-content');
        if (content) {
          content.classList.toggle('calc-hidden');
        }
      });
    }

    document.querySelectorAll('.guide-btn').forEach((btn) => {
      btn.addEventListener('click', (event) => {
        this.applyGuideSetup(event.target.dataset.setup);
      });
    });
  }

  setupControlListener(elementId, ionKey) {
    const slider = document.getElementById(elementId);
    const input = document.getElementById(elementId + '-input');
    const valueDisplay = document.getElementById(elementId + '-value');

    if (!slider || !input || !valueDisplay) return;

    const updateFromSlider = () => {
      const newValue = Number(slider.value);
      if (!Number.isFinite(newValue)) return;
      input.value = newValue;
      valueDisplay.textContent = newValue.toFixed(ionKey.includes('In') || ionKey.includes('Out') ? 1 : 0);
      this.simulator.updateIon(ionKey, newValue);
      this.updateDisplay();
    };

    const updateFromInput = () => {
      const newValue = Number(input.value);
      if (!Number.isFinite(newValue)) return;
      const clampedValue = Math.min(Number(slider.max), Math.max(Number(slider.min), newValue));
      slider.value = clampedValue;
      input.value = clampedValue;
      valueDisplay.textContent = clampedValue.toFixed(ionKey.includes('In') || ionKey.includes('Out') ? 1 : 0);
      this.simulator.updateIon(ionKey, clampedValue);
      this.updateDisplay();
    };

    slider.addEventListener('input', updateFromSlider);
    input.addEventListener('input', updateFromInput);
  }

  setupPermeabilityListener(elementId, ionType) {
    const slider = document.getElementById(elementId);
    const input = document.getElementById(elementId + '-input');
    const valueDisplay = document.getElementById(elementId + '-value');

    if (!slider || !input || !valueDisplay) return;

    const updateFromSlider = () => {
      const newValue = Number(slider.value);
      if (!Number.isFinite(newValue)) return;
      input.value = newValue;
      valueDisplay.textContent = newValue.toFixed(2);
      this.simulator.updatePermeability(ionType, newValue);
      this.updateDisplay();
    };

    const updateFromInput = () => {
      const newValue = Number(input.value);
      if (!Number.isFinite(newValue)) return;
      const clampedValue = Math.min(Number(slider.max), Math.max(Number(slider.min), newValue));
      slider.value = clampedValue;
      input.value = clampedValue;
      valueDisplay.textContent = clampedValue.toFixed(2);
      this.simulator.updatePermeability(ionType, clampedValue);
      this.updateDisplay();
    };

    slider.addEventListener('input', updateFromSlider);
    input.addEventListener('input', updateFromInput);
  }

  syncControlsFromModel() {
    const state = this.simulator.getState();
    const ions = state.ions;
    const permeability = state.permeability;

    const map = {
      kOut: [ions.KOut, 'KOut'],
      naOut: [ions.NaOut, 'NaOut'],
      clOut: [ions.ClOut, 'ClOut'],
      kIn: [ions.KIn, 'KIn'],
      naIn: [ions.NaIn, 'NaIn'],
      clIn: [ions.ClIn, 'ClIn'],
      pK: [permeability.PK, 'K'],
      pNa: [permeability.PNa, 'Na'],
      pCl: [permeability.PCl, 'Cl']
    };

    Object.entries(map).forEach(([key, [value, label]]) => {
      const slider = document.getElementById(key);
      const input = document.getElementById(`${key}-input`);
      const valueDisplay = document.getElementById(`${key}-value`);
      if (!slider || !input || !valueDisplay) return;
      const numericValue = Number(value);
      slider.value = numericValue;
      input.value = numericValue;
      valueDisplay.textContent = key.startsWith('p') ? numericValue.toFixed(2) : numericValue.toFixed(1);
      if (key.startsWith('p')) {
        this.simulator.updatePermeability(label, numericValue);
      } else {
        this.simulator.updateIon(label, numericValue);
      }
    });
  }

  applyCondition(conditionName) {
    const enabled = this.simulator.applyCondition(conditionName);
    if (!enabled) return;

    document.querySelectorAll('.condition-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.condition === conditionName);
    });

    this.syncControlsFromModel();
    this.updateDisplay();
  }

  applyGuideSetup(setup) {
    const settings = {
      isolateK: {
        ions: { KOut: 5, KIn: 140, NaOut: 145, NaIn: 12, ClOut: 110, ClIn: 4 },
        permeability: { PK: 1.0, PNa: 0, PCl: 0 }
      },
      isolateNa: {
        ions: { KOut: 5, KIn: 140, NaOut: 145, NaIn: 12, ClOut: 110, ClIn: 4 },
        permeability: { PK: 0, PNa: 1.0, PCl: 0 }
      },
      hyperkalemia: {
        ions: { KOut: 10, KIn: 140, NaOut: 145, NaIn: 12, ClOut: 110, ClIn: 4 },
        permeability: { PK: 1.0, PNa: 0.25, PCl: 0.2 }
      }
    };

    const chosen = settings[setup];
    if (!chosen) return;

    Object.entries(chosen.ions).forEach(([key, value]) => {
      this.simulator.updateIon(key, Number(value));
    });

    this.simulator.permeability.PK = chosen.permeability.PK;
    this.simulator.permeability.PNa = chosen.permeability.PNa;
    this.simulator.permeability.PCl = chosen.permeability.PCl;
    this.simulator.update();

    this.syncControlsFromModel();
    this.updateDisplay();
  }

  updateDisplay() {
    const state = this.simulator.getState();
    const ions = state.ions;

    const vmDisplay = document.getElementById('vm-display');
    const ekDisplay = document.getElementById('ek-display');
    const enaDisplay = document.getElementById('ena-display');
    const eclDisplay = document.getElementById('ecl-display');
    
    if (vmDisplay) vmDisplay.textContent = state.Vm.toFixed(1);
    if (ekDisplay) ekDisplay.textContent = state.EK.toFixed(1);
    if (enaDisplay) enaDisplay.textContent = state.ENa.toFixed(1);
    if (eclDisplay) eclDisplay.textContent = state.ECl.toFixed(1);

    const calcContent = document.getElementById('ghk-equation');
    const calcValues = document.getElementById('ghk-values');
    if (calcContent && calcValues) {
      const numerator = state.permeability.PK * ions.KOut + state.permeability.PNa * ions.NaOut + state.permeability.PCl * ions.ClIn;
      const denominator = state.permeability.PK * ions.KIn + state.permeability.PNa * ions.NaIn + state.permeability.PCl * ions.ClOut;
      calcContent.innerHTML = 'V<sub>m</sub> = 61.5 × log₁₀(' + numerator.toFixed(2) + ' / ' + denominator.toFixed(2) + ')';
      calcValues.textContent = `Numerator = ${numerator.toFixed(2)}, Denominator = ${denominator.toFixed(2)}`;
    }

    const interpretationText = document.getElementById('interpretation-text');
    if (interpretationText) {
      const pk = state.permeability.PK;
      const pNa = state.permeability.PNa;

      if (pk > pNa) {
        interpretationText.textContent = 'The membrane potential remains strongly influenced by K⁺ because K⁺ permeability exceeds Na⁺ permeability.';
      } else if (pNa > pk) {
        interpretationText.textContent = 'Na⁺ permeability is now dominant, pulling the membrane potential upward toward ENa.';
      } else {
        interpretationText.textContent = 'Both ions contribute comparably, so the membrane potential sits between EK and ENa.';
      }
    }

    this.visualization.updateChart(this.simulator.getHistory());
  }

  clearHistory() {
    this.simulator.clearHistory();
    this.updateDisplay();
  }

  reset() {
    this.simulator.reset();
    document.querySelectorAll('.condition-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.condition === 'normal');
    });
    this.syncControlsFromModel();
    this.updateDisplay();
  }
}

// Make controller globally available
window.simulatorController = new SimulatorController();
