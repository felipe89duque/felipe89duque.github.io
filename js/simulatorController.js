/**
 * Simulator Controller
 * Manages all UI interactions and updates
 */

class SimulatorController {
  constructor() {
    this.simulator = new Simulator();
    this.visualization = new Visualization('vmChart');
    this.membraneVisualization = new CellMembraneVisualization();
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

    this.setupPermeabilityListener('pK');
    this.setupPermeabilityListener('pNa');
    this.setupPermeabilityListener('pCl');

    document.querySelectorAll('.condition-btn').forEach((btn) => {
      btn.addEventListener('click', (event) => {
        this.applyCondition(event.target.dataset.condition);
      });
    });

    document.getElementById('reset-btn').addEventListener('click', () => this.reset());
    document.getElementById('run-btn').addEventListener('click', () => this.runSimulation());

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
    };

    const updateFromInput = () => {
      if (input.value.trim() === '') return;
      const newValue = Number(input.value);
      if (!Number.isFinite(newValue)) return;
      const clampedValue = Math.min(Number(slider.max), Math.max(Number(slider.min), newValue));
      slider.value = clampedValue;
      input.value = clampedValue;
      valueDisplay.textContent = clampedValue.toFixed(ionKey.includes('In') || ionKey.includes('Out') ? 1 : 0);
    };

    slider.addEventListener('input', updateFromSlider);
    input.addEventListener('input', updateFromInput);
  }

  setupPermeabilityListener(elementId) {
    const slider = document.getElementById(elementId);
    const input = document.getElementById(elementId + '-input');
    const valueDisplay = document.getElementById(elementId + '-value');

    if (!slider || !input || !valueDisplay) return;

    const updateFromSlider = () => {
      const newValue = Number(slider.value);
      if (!Number.isFinite(newValue)) return;
      input.value = newValue;
      valueDisplay.textContent = newValue.toFixed(2);
    };

    const updateFromInput = () => {
      if (input.value.trim() === '') return;
      const newValue = Number(input.value);
      if (!Number.isFinite(newValue)) return;
      const clampedValue = Math.min(Number(slider.max), Math.max(Number(slider.min), newValue));
      slider.value = clampedValue;
      input.value = clampedValue;
      valueDisplay.textContent = clampedValue.toFixed(2);
    };

    slider.addEventListener('input', updateFromSlider);
    input.addEventListener('input', updateFromInput);
  }

  syncControlsFromModel() {
    const state = this.simulator.getState();
    const ions = state.ions;
    const permeability = state.permeability;

    const map = {
      kOut: ions.KOut,
      naOut: ions.NaOut,
      clOut: ions.ClOut,
      kIn: ions.KIn,
      naIn: ions.NaIn,
      clIn: ions.ClIn,
      pK: permeability.PK,
      pNa: permeability.PNa,
      pCl: permeability.PCl
    };

    Object.entries(map).forEach(([key, value]) => {
      const slider = document.getElementById(key);
      const input = document.getElementById(`${key}-input`);
      const valueDisplay = document.getElementById(`${key}-value`);
      if (!slider || !input || !valueDisplay) return;
      const numericValue = Number(value);
      slider.value = numericValue;
      input.value = numericValue;
      valueDisplay.textContent = key.startsWith('p') ? numericValue.toFixed(2) : numericValue.toFixed(1);
    });
  }

  runSimulation() {
    const parameterInputs = document.querySelectorAll('.numeric-input');
    const invalidInput = Array.from(parameterInputs).find((input) =>
      input.value.trim() === '' || !input.checkValidity()
    );
    if (invalidInput) {
      document.getElementById('simulation-status').textContent =
        `Enter a valid value between ${invalidInput.min} and ${invalidInput.max} for ${invalidInput.getAttribute('aria-label')}.`;
      invalidInput.focus();
      return;
    }

    const ions = {
      KOut: Number(document.getElementById('kOut-input').value),
      NaOut: Number(document.getElementById('naOut-input').value),
      ClOut: Number(document.getElementById('clOut-input').value),
      KIn: Number(document.getElementById('kIn-input').value),
      NaIn: Number(document.getElementById('naIn-input').value),
      ClIn: Number(document.getElementById('clIn-input').value)
    };
    const permeability = {
      PK: Number(document.getElementById('pK-input').value),
      PNa: Number(document.getElementById('pNa-input').value),
      PCl: Number(document.getElementById('pCl-input').value)
    };

    this.simulator.ionConcentrations.setConcentrations(ions);
    this.simulator.permeability = permeability;
    this.simulator.update();
    const saved = this.saveStateForParameterExperiments();
    this.updateDisplay();
    document.getElementById('simulation-status').textContent =
      `Simulation complete. Membrane potential: ${this.simulator.state.Vm.toFixed(1)} mV.${saved ? ' Settings are ready for the parameter experiments page.' : ' Settings could not be saved for the parameter experiments page.'}`;
  }

  saveStateForParameterExperiments() {
    try {
      localStorage.setItem('axonTutorial1State', JSON.stringify(this.simulator.getState()));
      return true;
    } catch (error) {
      console.error('Unable to save Tutorial 1 settings for parameter experiments.', error);
      return false;
    }
  }

  applyCondition(conditionName) {
    const ions = this.simulator.ionConcentrations.getConditions()[conditionName];
    if (!ions) return;

    document.querySelectorAll('.condition-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.condition === conditionName);
    });

    this.setControlsFromValues(ions, this.simulator.permeability);
    document.getElementById('simulation-status').textContent =
      'Preset parameters selected. Run the simulation to update the graphs.';
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

    this.setControlsFromValues(chosen.ions, chosen.permeability);
    document.getElementById('simulation-status').textContent =
      'Guide parameters selected. Run the simulation to update the graphs.';
  }

  setControlsFromValues(ions, permeability) {
    const values = {
      kOut: ions.KOut,
      naOut: ions.NaOut,
      clOut: ions.ClOut,
      kIn: ions.KIn,
      naIn: ions.NaIn,
      clIn: ions.ClIn,
      pK: permeability.PK,
      pNa: permeability.PNa,
      pCl: permeability.PCl
    };

    Object.entries(values).forEach(([key, value]) => {
      const slider = document.getElementById(key);
      const input = document.getElementById(`${key}-input`);
      const valueDisplay = document.getElementById(`${key}-value`);
      if (!slider || !input || !valueDisplay) return;
      const numericValue = Number(value);
      slider.value = numericValue;
      input.value = numericValue;
      valueDisplay.textContent = key.startsWith('p') ? numericValue.toFixed(2) : numericValue.toFixed(1);
    });
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

    // const interpretationText = document.getElementById('interpretation-text');
    // if (interpretationText) {
    //   const pk = state.permeability.PK;
    //   const pNa = state.permeability.PNa;

    //   if (pk > pNa) {
    //     interpretationText.textContent = 'The membrane potential remains strongly influenced by K⁺ because K⁺ permeability exceeds Na⁺ permeability.';
    //   } else if (pNa > pk) {
    //     interpretationText.textContent = 'Na⁺ permeability is now dominant, pulling the membrane potential upward toward ENa.';
    //   } else {
    //     interpretationText.textContent = 'Both ions contribute comparably, so the membrane potential sits between EK and ENa.';
    //   }
    // }

    this.visualization.updateChart(state);
    this.membraneVisualization.update(state);
  }

  reset() {
    this.simulator.reset();
    document.querySelectorAll('.condition-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.condition === 'normal');
    });
    this.syncControlsFromModel();
    this.updateDisplay();
    const saved = this.saveStateForParameterExperiments();
    document.getElementById('simulation-status').textContent =
      saved
        ? 'Parameters reset to their default values. The same settings are available on the parameter experiments page.'
        : 'Parameters reset to their default values. Settings could not be saved for the parameter experiments page.';
  }
}

// Make controller globally available
window.simulatorController = new SimulatorController();
