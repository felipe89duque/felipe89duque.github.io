/**
 * Ion Concentration Manager
 * Handles physiological states, pathological conditions, and experimental manipulations
 */

class IonConcentrations {
  constructor() {
    // Normal physiological state
    this.normal = {
      KOut: 5,
      KIn: 140,
      NaOut: 145,
      NaIn: 12,
      ClOut: 110,
      ClIn: 4
    };

    // Current state
    this.current = { ...this.normal };

    // Defined conditions
    this.conditions = {
      normal: { ...this.normal },
      hyperkalemia: { ...this.normal, KOut: 10 },
      severeHyperkalemia: { ...this.normal, KOut: 15 },
      hypokalemia: { ...this.normal, KOut: 2.5 },
      severeHypokalemia: { ...this.normal, KOut: 1.5 },
      highNa: { ...this.normal, NaOut: 200 },
      lowNa: { ...this.normal, NaOut: 100 },
      nPermeable: { ...this.normal } // Becomes Na+ permeable in simulator
    };
  }

  /**
   * Get current ion concentrations
   * @returns {object} Current ion concentrations
   */
  getCurrent() {
    return { ...this.current };
  }

  /**
   * Set all concentrations
   * @param {object} ions - Ion concentrations {KOut, KIn, NaOut, NaIn, ClOut, ClIn}
   */
  setConcentrations(ions) {
    this.current = {
      KOut: ions.KOut || this.current.KOut,
      KIn: ions.KIn || this.current.KIn,
      NaOut: ions.NaOut || this.current.NaOut,
      NaIn: ions.NaIn || this.current.NaIn,
      ClOut: ions.ClOut || this.current.ClOut,
      ClIn: ions.ClIn || this.current.ClIn
    };
  }

  /**
   * Update a single ion concentration
   * @param {string} ion - Ion identifier (e.g., 'KOut', 'NaOut')
   * @param {number} value - New concentration in mM
   */
  updateIon(ion, value) {
    if (this.current.hasOwnProperty(ion)) {
      this.current[ion] = Math.max(0.1, value); // Prevent zero/negative values
    }
  }

  /**
   * Apply a predefined condition
   * @param {string} conditionName - Name of condition
   */
  applyCondition(conditionName) {
    if (this.conditions[conditionName]) {
      this.setConcentrations(this.conditions[conditionName]);
      return true;
    }
    return false;
  }

  /**
   * Reset to normal
   */
  reset() {
    this.setConcentrations(this.normal);
  }

  /**
   * Get all predefined conditions
   * @returns {object} All available conditions
   */
  getConditions() {
    return this.conditions;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = IonConcentrations;
}
