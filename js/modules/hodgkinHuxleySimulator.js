/**
 * Hodgkin-Huxley Action Potential Simulator
 * Implements the classical Hodgkin-Huxley equations
 */

class HodgkinHuxleySimulator {
  constructor() {
    // Ion concentrations (mM)
    this.concentrations = {
      kOut: 5.0,    // K+ outside
      kIn: 140.0,   // K+ inside
      naOut: 145.0, // Na+ outside
      naIn: 12.0    // Na+ inside
    };

    // Membrane capacitance (µF/cm²)
    this.Cm = 1.0;

    // Leak conductance (mS/cm²)
    this.gL = 0.3;
    this.EL = -65.0; // Leak reversal potential (mV)

    // Maximum conductances (mS/cm²)
    this.gNa_max = 120.0;
    this.gK_max = 36.0;

    // Gating variables
    this.m = 0.05;  // Na+ activation
    this.h = 0.6;   // Na+ inactivation
    this.n = 0.32;  // K+ activation

    // State variables
    this.Vm = -65.0; // Membrane potential (mV)

    // Stimulation parameters
    this.stimCurrent = 0.0; // Applied current (µA/cm²)
    this.stimStart = 0.0;   // Start time (ms)
    this.stimDuration = 1.0; // Duration (ms)
    this.stimAmplitude = 0.0; // Amplitude (µA/cm²)

    // Simulation parameters
    this.dt = 0.01; // Time step (ms)
    this.time = 0.0;
    this.totalTime = 20.0; // Total simulation time (ms)

    // History for plotting
    this.history = {
      timestamps: [],
      Vm: [],
      stimCurrent: [],
      INa: [],
      IK: [],
      IL: [],
      I_stim: [],
      VNa: [],
      VK: []
    };

    this.maxHistoryPoints = 10000;
  }

  /**
   * Set ion concentrations
   */
  setConcentrations(kOut, kIn, naOut, naIn) {
    this.concentrations.kOut = kOut;
    this.concentrations.kIn = kIn;
    this.concentrations.naOut = naOut;
    this.concentrations.naIn = naIn;
  }

  /**
   * Set maximum conductances
   */
  setConductances(gNa_max, gK_max, gL) {
    this.gNa_max = gNa_max;
    this.gK_max = gK_max;
    this.gL = gL;
  }

  /**
   * Set stimulation parameters
   */
  setStimulation(amplitude, start, duration) {
    this.stimAmplitude = amplitude;
    this.stimStart = start;
    this.stimDuration = duration;
  }

  /**
   * Set total simulation time
   */
  setTotalTime(time) {
    this.totalTime = time;
  }

  /**
   * Calculate equilibrium potentials using Nernst equation
   */
  calculateEquilibriumPotentials() {
    const RT_F = 61.5; // RT/F at 37°C, converts to mV (ln converts to log10)

    // Nernst equation: E = (RT/F) * ln([ion]_out / [ion]_in)
    const EK = RT_F * Math.log10(this.concentrations.kOut / this.concentrations.kIn);
    const ENa = RT_F * Math.log10(this.concentrations.naOut / this.concentrations.naIn);

    return { EK, ENa };
  }

  /**
   * Alpha and beta functions for gating variables (temperature-corrected to 37°C)
   */
  alphaM(Vm) {
    return 0.1 * (Vm + 40) / (1 - Math.exp(-(Vm + 40) / 10));
  }

  betaM(Vm) {
    return 4 * Math.exp(-(Vm + 65) / 18);
  }

  alphaH(Vm) {
    return 0.07 * Math.exp(-(Vm + 65) / 20);
  }

  betaH(Vm) {
    return 1 / (1 + Math.exp(-(Vm + 35) / 10));
  }

  alphaN(Vm) {
    return 0.01 * (Vm + 55) / (1 - Math.exp(-(Vm + 55) / 10));
  }

  betaN(Vm) {
    return 0.125 * Math.exp(-(Vm + 65) / 80);
  }

  /**
   * Calculate steady-state and time constant for gating variables
   */
  getGatingInfo(Vm) {
    const alphaM_val = this.alphaM(Vm);
    const betaM_val = this.betaM(Vm);
    const alphaH_val = this.alphaH(Vm);
    const betaH_val = this.betaH(Vm);
    const alphaN_val = this.alphaN(Vm);
    const betaN_val = this.betaN(Vm);

    return {
      m_inf: alphaM_val / (alphaM_val + betaM_val),
      tau_m: 1 / (alphaM_val + betaM_val),
      h_inf: alphaH_val / (alphaH_val + betaH_val),
      tau_h: 1 / (alphaH_val + betaH_val),
      n_inf: alphaN_val / (alphaN_val + betaN_val),
      tau_n: 1 / (alphaN_val + betaN_val)
    };
  }

  /**
   * Calculate ionic currents
   */
  calculateCurrents() {
    const { EK, ENa } = this.calculateEquilibriumPotentials();

    // Sodium current: INa = gNa * m³ * h * (Vm - ENa)
    const gNa = this.gNa_max * Math.pow(this.m, 3) * this.h;
    const INa = gNa * (this.Vm - ENa);

    // Potassium current: IK = gK * n⁴ * (Vm - EK)
    const gK = this.gK_max * Math.pow(this.n, 4);
    const IK = gK * (this.Vm - EK);

    // Leak current: IL = gL * (Vm - EL)
    const IL = this.gL * (this.Vm - this.EL);

    return { INa, IK, IL, gNa, gK };
  }

  /**
   * Perform one simulation step
   */
  step() {
    // Update stimulus current
    if (this.time >= this.stimStart && this.time < this.stimStart + this.stimDuration) {
      this.stimCurrent = this.stimAmplitude;
    } else {
      this.stimCurrent = 0;
    }

    // Get gating variable info
    const gatingInfo = this.getGatingInfo(this.Vm);

    // Update gating variables using exponential Euler method
    this.m += (gatingInfo.m_inf - this.m) * (1 - Math.exp(-this.dt / gatingInfo.tau_m));
    this.h += (gatingInfo.h_inf - this.h) * (1 - Math.exp(-this.dt / gatingInfo.tau_h));
    this.n += (gatingInfo.n_inf - this.n) * (1 - Math.exp(-this.dt / gatingInfo.tau_n));

    // Calculate currents
    const { INa, IK, IL } = this.calculateCurrents();

    // Calculate total membrane current
    const I_total = this.stimCurrent - INa - IK - IL;

    // Update membrane potential using forward Euler
    this.Vm += (I_total / this.Cm) * this.dt;

    // Calculate driving forces
    const { EK, ENa } = this.calculateEquilibriumPotentials();
    const VNa = this.Vm - ENa;
    const VK = this.Vm - EK;

    // Store history
    if (this.history.timestamps.length < this.maxHistoryPoints) {
      this.history.timestamps.push(this.time);
      this.history.Vm.push(this.Vm);
      this.history.stimCurrent.push(this.stimCurrent);
      this.history.INa.push(INa);
      this.history.IK.push(IK);
      this.history.IL.push(IL);
      this.history.I_stim.push(this.stimCurrent);
      this.history.VNa.push(VNa);
      this.history.VK.push(VK);
    }

    // Increment time
    this.time += this.dt;
  }

  /**
   * Run the complete simulation
   */
  run() {
    this.reset();
    
    while (this.time < this.totalTime) {
      this.step();
    }

    return this.history;
  }

  /**
   * Run simulation step by step and update UI
   */
  runInteractive() {
    this.reset();
    return this.history;
  }

  /**
   * Reset simulation to initial conditions
   */
  reset() {
    this.Vm = -65.0;
    this.m = 0.05;
    this.h = 0.6;
    this.n = 0.32;
    this.time = 0;
    this.stimCurrent = 0;

    this.history = {
      timestamps: [],
      Vm: [],
      stimCurrent: [],
      INa: [],
      IK: [],
      IL: [],
      I_stim: [],
      VNa: [],
      VK: []
    };
  }

  /**
   * Get current state
   */
  getState() {
    const { EK, ENa } = this.calculateEquilibriumPotentials();
    const { INa, IK, IL } = this.calculateCurrents();

    return {
      Vm: this.Vm,
      EK,
      ENa,
      INa,
      IK,
      IL,
      m: this.m,
      h: this.h,
      n: this.n,
      time: this.time
    };
  }
}
