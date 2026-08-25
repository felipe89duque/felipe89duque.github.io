/**
 * GHK Calculator
 * Implements the Goldman-Hodgkin-Katz equation and Nernst potential calculations
 * Temperature: 37°C
 */

class GHKCalculator {
  constructor() {
    // Constants at 37°C
    this.RT_F = 61.5; // mV (2.303 * RT/F at 37°C)
    this.FARADAY = 96485; // C/mol
  }

  /**
   * Calculate Nernst equilibrium potential for a single ion
   * @param {number} concOut - Extracellular concentration (mM)
   * @param {number} concIn - Intracellular concentration (mM)
   * @param {number} charge - Ion charge (+1 for K+/Na+, -1 for Cl-)
   * @returns {number} Equilibrium potential in mV
   */
  nernst(concOut, concIn, charge = 1) {
    if (concIn <= 0 || concOut <= 0) {
      console.warn('Invalid concentration values for Nernst calculation');
      return 0;
    }
    const ratio = concOut / concIn;
    return (this.RT_F / charge) * Math.log10(ratio);
  }

  /**
   * Calculate GHK membrane potential
   * @param {number} PK - Permeability to K+ (0-1)
   * @param {number} PNa - Permeability to Na+ (0-1)
   * @param {number} PCl - Permeability to Cl- (0-1)
   * @param {number} KOut - Extracellular K+ (mM)
   * @param {number} KIn - Intracellular K+ (mM)
   * @param {number} NaOut - Extracellular Na+ (mM)
   * @param {number} NaIn - Intracellular Na+ (mM)
   * @param {number} ClOut - Extracellular Cl- (mM)
   * @param {number} ClIn - Intracellular Cl- (mM)
   * @returns {number} Membrane potential in mV
   */
  ghk(PK, PNa, PCl, KOut, KIn, NaOut, NaIn, ClOut, ClIn) {
    // GHK equation: numerator uses intracellular for anions (Cl-), extracellular for cations
    const numerator = 
      PK * KOut + 
      PNa * NaOut + 
      PCl * ClIn;

    const denominator = 
      PK * KIn + 
      PNa * NaIn + 
      PCl * ClOut;

    if (denominator === 0) {
      return 0;
    }

    const ratio = numerator / denominator;
    return this.RT_F * Math.log10(ratio);
  }

  /**
   * Calculate all equilibrium potentials for current state
   * @param {object} ions - Ion concentrations {KOut, KIn, NaOut, NaIn, ClOut, ClIn}
   * @returns {object} Equilibrium potentials {EK, ENa, ECl}
   */
  calculateEquilibriumPotentials(ions) {
    return {
      EK: this.nernst(ions.KOut, ions.KIn, 1),
      ENa: this.nernst(ions.NaOut, ions.NaIn, 1),
      ECl: this.nernst(ions.ClOut, ions.ClIn, -1)
    };
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GHKCalculator;
}
