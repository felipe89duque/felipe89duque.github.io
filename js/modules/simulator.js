/**
 * Neurophysiology Simulator
 * Manages real-time simulation state and calculations
 */

class Simulator {
  constructor() {
    this.ghkCalculator = new GHKCalculator();
    this.ionConcentrations = new IonConcentrations();

    // Permeability state (glial cell - primarily K+ permeable)
    this.permeability = {
      PK: 1.0,
      PNa: 0.04,
      PCl: 0.2
    };

    // Simulation state
    this.state = {
      Vm: 0,
      EK: 0,
      ENa: 0,
      ECl: 0
    };

    // History for plotting
    this.history = {
      timestamps: [],
      Vm: [],
      EK: [],
      ENa: [],
      ECl: [],
      PK: [],
      PNa: [],
      PCl: []
    };

    this.maxHistoryPoints = 100;
    this.timestep = 0;

    // Initial calculation
    this.update();
  }

  /**
   * Update simulation state
   */
  update() {
    const ions = this.ionConcentrations.getCurrent();

    // Calculate membrane potential
    this.state.Vm = this.ghkCalculator.ghk(
      this.permeability.PK,
      this.permeability.PNa,
      this.permeability.PCl,
      ions.KOut,
      ions.KIn,
      ions.NaOut,
      ions.NaIn,
      ions.ClOut,
      ions.ClIn
    );

    // Calculate equilibrium potentials
    const eqs = this.ghkCalculator.calculateEquilibriumPotentials(ions);
    this.state.EK = eqs.EK;
    this.state.ENa = eqs.ENa;
    this.state.ECl = eqs.ECl;

    // Add to history
    this.addToHistory();
  }

  /**
   * Add current state to history
   */
  addToHistory() {
    this.history.timestamps.push(this.timestep);
    this.history.Vm.push(this.state.Vm);
    this.history.EK.push(this.state.EK);
    this.history.ENa.push(this.state.ENa);
    this.history.ECl.push(this.state.ECl);
    this.history.PK.push(this.permeability.PK);
    this.history.PNa.push(this.permeability.PNa);
    this.history.PCl.push(this.permeability.PCl);

    // Keep history within max points
    if (this.history.timestamps.length > this.maxHistoryPoints) {
      this.history.timestamps.shift();
      this.history.Vm.shift();
      this.history.EK.shift();
      this.history.ENa.shift();
      this.history.ECl.shift();
      this.history.PK.shift();
      this.history.PNa.shift();
      this.history.PCl.shift();
    }

    this.timestep++;
  }

  /**
   * Update ion concentration
   * @param {string} ion - Ion identifier (e.g., 'KOut')
   * @param {number} value - New concentration
   */
  updateIon(ion, value) {
    this.ionConcentrations.updateIon(ion, value);
    this.update();
  }

  /**
   * Update permeability
   * @param {string} ionType - 'K', 'Na', or 'Cl'
   * @param {number} value - Permeability (0-1)
   */
  updatePermeability(ionType, value) {
    const key = 'P' + ionType;
    if (this.permeability.hasOwnProperty(key)) {
      this.permeability[key] = Math.max(0, Math.min(1, value));
      this.update();
    }
  }

  /**
   * Apply a condition
   * @param {string} condition - Condition name
   */
  applyCondition(condition) {
    this.ionConcentrations.applyCondition(condition);
    this.update();
  }

  /**
   * Set Na+ permeability mode (for Q3)
   * @param {boolean} naPermeable - Whether membrane is Na+ permeable
   */
  setNaPermeableMode(naPermeable) {
    if (naPermeable) {
      this.permeability.PK = 0.01;
      this.permeability.PNa = 1.0;
      this.permeability.PCl = 0.2;
    } else {
      this.permeability.PK = 1.0;
      this.permeability.PNa = 0.04;
      this.permeability.PCl = 0.2;
    }
    this.update();
  }

  /**
   * Get current state
   */
  getState() {
    return {
      ...this.state,
      ions: this.ionConcentrations.getCurrent(),
      permeability: { ...this.permeability }
    };
  }

  /**
   * Get history for plotting
   */
  getHistory() {
    return { ...this.history };
  }

  /**
   * Clear history
   */
  clearHistory() {
    this.history = {
      timestamps: [],
      Vm: [],
      EK: [],
      ENa: [],
      ECl: [],
      PK: [],
      PNa: [],
      PCl: []
    };
    this.timestep = 0;
  }

  /**
   * Reset to defaults
   */
  reset() {
    this.ionConcentrations.reset();
    this.permeability = {
      PK: 1.0,
      PNa: 0.04,
      PCl: 0.2
    };
    this.clearHistory();
    this.update();
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Simulator;
}
