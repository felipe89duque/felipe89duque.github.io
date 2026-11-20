class CellMembraneVisualization {
  constructor() {
    this.ballCount = 60;
    this.previousOutsideCounts = new Map();
    this.animations = new Set();
    this.ions = [
      { key: 'K', label: 'Potassium', concentration: 'KOut', intracellular: 'KIn', permeability: 'PK' },
      { key: 'Na', label: 'Sodium', concentration: 'NaOut', intracellular: 'NaIn', permeability: 'PNa' },
      { key: 'Cl', label: 'Chloride', concentration: 'ClOut', intracellular: 'ClIn', permeability: 'PCl' }
    ];
  }

  update(state) {
    this.animations.forEach((animation) => animation.finish());

    this.ions.forEach((ion) => {
      const outsideConcentration = state.ions[ion.concentration];
      const insideConcentration = state.ions[ion.intracellular];
      const totalConcentration = outsideConcentration + insideConcentration;
      let outsideCount = totalConcentration > 0
        ? Math.round(this.ballCount * outsideConcentration / totalConcentration)
        : Math.floor(this.ballCount / 2);
      if (outsideConcentration > 0 && insideConcentration > 0) {
        outsideCount = Math.max(1, Math.min(this.ballCount - 1, outsideCount));
      }
      const insideCount = this.ballCount - outsideCount;
      const permeability = state.permeability[ion.permeability];
      const outsidePool = document.getElementById(`${ion.key.toLowerCase()}Out-ions`);
      const insidePool = document.getElementById(`${ion.key.toLowerCase()}In-ions`);
      const channel = document.getElementById(`${ion.key.toLowerCase()}-channel`);
      const channelWidth = document.getElementById(`${ion.key.toLowerCase()}-channel-pore`);

      channelWidth.style.width = `${permeability * 100}%`;
      channelWidth.hidden = permeability === 0;
      channel.setAttribute('aria-label',
        `${ion.label} channel, permeability ${permeability.toFixed(2)} on a scale from 0 to 1.`);
      channel.title =
        `${ion.label} channel. Permeability is ${permeability.toFixed(2)} on a scale from 0 to 1; a wider opening means the ion crosses more easily.`;
      channel.dataset.tooltip =
        `${ion.label} channel opening: permeability ${permeability.toFixed(2)}. A wider opening means easier ion flow.`;

      const previousOutsideCount = this.previousOutsideCounts.get(ion.key);
      if (previousOutsideCount === undefined) {
        this.createBalls(ion, outsidePool, outsideCount);
        this.createBalls(ion, insidePool, insideCount);
      } else {
        this.moveBalls(
          outsidePool,
          insidePool,
          channel,
          outsideCount - previousOutsideCount
        );
      }

      const outsideDescription =
        `${ion.label} ions outside the cell. Concentration is ${outsideConcentration} millimolar; relative ion amount represents concentration ratio.`;
      const insideDescription =
        `${ion.label} ions inside the cell. Concentration is ${insideConcentration} millimolar; relative ion amount represents concentration ratio.`;
      outsidePool.setAttribute('aria-label',
        outsideDescription);
      outsidePool.title = outsideDescription;
      outsidePool.dataset.tooltip =
        `${ion.label} outside the cell: ${outsideConcentration} mM. Relative ion amount represents extracellular concentration.`;
      insidePool.setAttribute('aria-label',
        insideDescription);
      insidePool.title = insideDescription;
      insidePool.dataset.tooltip =
        `${ion.label} inside the cell: ${insideConcentration} mM. Relative ion amount represents intracellular concentration.`;
      this.previousOutsideCounts.set(ion.key, outsideCount);
    });
  }

  createBalls(ion, pool, count) {
    for (let index = 0; index < count; index += 1) {
      pool.append(this.createBall(ion));
    }
  }

  createBall(ion) {
    const ball = document.createElement('span');
    ball.className = `ion-ball ion-${ion.key.toLowerCase()}`;
    ball.setAttribute('aria-hidden', 'true');
    return ball;
  }

  moveBalls(outsidePool, insidePool, channel, outsideCountChange) {
    if (outsideCountChange === 0) return;

    const movingOutward = outsideCountChange > 0;
    const source = movingOutward ? insidePool : outsidePool;
    const destination = movingOutward ? outsidePool : insidePool;
    const count = Math.abs(outsideCountChange);
    const movingBalls = Array.from(source.children).slice(0, count);
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const membrane = channel.parentElement;

    movingBalls.forEach((ball) => {
      const start = ball.getBoundingClientRect();
      destination.append(ball);
      if (reduceMotion) return;

      const end = ball.getBoundingClientRect();
      const channelBounds = channel.querySelector('.channel-track').getBoundingClientRect();
      const membraneBounds = membrane.getBoundingClientRect();
      const crossingPoint = {
        left: channelBounds.left + (channelBounds.width - start.width) / 2,
        top: membraneBounds.top + (membraneBounds.height - start.height) / 2
      };

      Object.assign(ball.style, {
        position: 'fixed',
        left: `${start.left}px`,
        top: `${start.top}px`,
        zIndex: '20',
        margin: '0',
        pointerEvents: 'none'
      });
      document.body.append(ball);
      const animation = ball.animate([
        { left: `${start.left}px`, top: `${start.top}px` },
        { left: `${crossingPoint.left}px`, top: `${crossingPoint.top}px` },
        { left: `${end.left}px`, top: `${end.top}px` }
      ], {
        duration: 800,
        easing: 'ease-in-out'
      });
      this.animations.add(animation);
      animation.addEventListener('finish', () => {
        destination.append(ball);
        ball.removeAttribute('style');
        this.animations.delete(animation);
      }, { once: true });
    });
  }
}
