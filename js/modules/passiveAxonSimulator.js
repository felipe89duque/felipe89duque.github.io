class PassiveAxonSimulator {
  constructor() {
    this.nodeCount = 101;
    this.length = 1;
    this.axialResistivity = 100;
    this.restingPotential = -70;
    this.dt = 0.0025;
    this.parameters = {
      membraneResistance: 10000,
      diameter: 20,
      capacitance: 1,
      stimulusAmplitude: 10,
      stimulusStart: 0,
      stimulusDuration: 20,
      totalTime: 20,
      electrodePosition: 0
    };
    this.reset();
  }

  setParameters(parameters) {
    this.parameters = { ...this.parameters, ...parameters };
  }

  getSpatialStep() {
    return this.length / (this.nodeCount - 1);
  }

  getLengthConstant() {
    const diameterCm = this.parameters.diameter / 10000;
    return Math.sqrt((this.parameters.membraneResistance * diameterCm) / (4 * this.axialResistivity));
  }

  getTimeConstant() {
    return this.parameters.membraneResistance * this.parameters.capacitance / 1000;
  }

  getStimulusNode() {
    return Math.max(0, Math.min(this.nodeCount - 1,
      Math.round(this.parameters.electrodePosition * (this.nodeCount - 1))));
  }

  reset() {
    this.time = 0;
    this.voltage = new Array(this.nodeCount).fill(this.restingPotential);
    this.history = {
      timestamps: [],
      electrodeVoltages: [[], [], [], []],
      spaceVoltage: [...this.voltage],
      spaceSnapshots: [],
      positions: Array.from({ length: this.nodeCount }, (_, index) => index / (this.nodeCount - 1)),
      stimulus: []
    };
  }

  isStimulusOn(time) {
    return time >= this.parameters.stimulusStart &&
      time < this.parameters.stimulusStart + this.parameters.stimulusDuration;
  }

  record() {
    const electrodePositions = [0, 0.25, 0.5, 0.75];
    this.history.timestamps.push(this.time);
    this.history.spaceSnapshots.push([...this.voltage]);
    electrodePositions.forEach((position, index) => {
      const node = Math.round(position * (this.nodeCount - 1));
      this.history.electrodeVoltages[index].push(this.voltage[node]);
    });
    this.history.stimulus.push(this.isStimulusOn(this.time) ? this.parameters.stimulusAmplitude : 0);
  }

  step() {
    const { membraneResistance, diameter, capacitance, stimulusAmplitude } = this.parameters;
    const dx = this.getSpatialStep();
    const tau = this.getTimeConstant();
    const lambda = this.getLengthConstant();
    const diffusion = (lambda * lambda) / tau;
    const nextVoltage = new Array(this.nodeCount);
    const stimulusNode = this.getStimulusNode();
    const stimulusOn = this.isStimulusOn(this.time);
    const stimulusCurrent = stimulusOn ? stimulusAmplitude : 0;
    const stimulusScale = 1 / capacitance;

    for (let index = 0; index < this.nodeCount; index += 1) {
      const left = index === 0 ? this.voltage[1] : this.voltage[index - 1];
      const right = index === this.nodeCount - 1 ? this.voltage[index - 1] : this.voltage[index + 1];
      const axialTerm = diffusion * (left - (2 * this.voltage[index]) + right) / (dx * dx);
      const leakTerm = -(this.voltage[index] - this.restingPotential) / tau;
      const injectedTerm = index === stimulusNode ? stimulusCurrent * stimulusScale : 0;
      nextVoltage[index] = this.voltage[index] + this.dt * (axialTerm + leakTerm + injectedTerm);
    }

    this.voltage = nextVoltage;
    this.time += this.dt;
    this.record();
  }

  run() {
    this.reset();
    this.record();
    while (this.time < this.parameters.totalTime) {
      this.step();
    }
    this.history.spaceVoltage = [...this.voltage];
    this.history.lengthConstant = this.getLengthConstant();
    this.history.timeConstant = this.getTimeConstant();
    this.history.stimulusNode = this.getStimulusNode();
    return this.history;
  }
}
