document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.numeric-input').forEach((input) => {
    if (input.hasAttribute('aria-label')) return;

    const slider = document.getElementById(input.id.replace(/-input$/, ''));
    const label = slider && document.querySelector(`label[for="${slider.id}"]`);
    if (!label) return;

    const labelCopy = label.cloneNode(true);
    labelCopy.querySelectorAll('span').forEach((value) => value.remove());
    input.setAttribute('aria-label', `Set ${labelCopy.textContent.trim()}`);
  });

  document.querySelectorAll('.group-toggle').forEach((toggle, index) => {
    const content = toggle.nextElementSibling;
    if (!content || !content.classList.contains('group-content')) return;

    if (!content.id) content.id = `parameter-group-${index + 1}`;
    toggle.setAttribute('aria-controls', content.id);
    if (!toggle.hasAttribute('aria-expanded')) {
      toggle.setAttribute('aria-expanded', String(toggle.parentElement.classList.contains('is-open')));
    }
  });

  const narrowViewport = window.matchMedia('(max-width: 800px)');
  document.querySelectorAll('.simulator-section').forEach((section) => {
    const parameterPanel = section.querySelector('.parameter-panel');
    const resizer = section.querySelector('.panel-resizer');
    if (!parameterPanel) return;

    section.querySelectorAll('[data-simulator-view]').forEach((button) => {
      button.addEventListener('click', () => {
        if (!narrowViewport.matches) return;
        const showParameters = button.dataset.simulatorView === 'parameters';
        section.classList.toggle('mobile-parameters', showParameters);
        section.querySelectorAll('[data-simulator-view]').forEach((viewButton) => {
          viewButton.setAttribute(
            'aria-pressed',
            String((viewButton.dataset.simulatorView === 'parameters') === showParameters)
          );
        });
        if (showParameters) parameterPanel.scrollTop = 0;
      });
    });

    if (!resizer) return;
    const minPanelWidth = Number(resizer.getAttribute('aria-valuemin'));
    const maxPanelWidth = Number(resizer.getAttribute('aria-valuemax'));
    const minChartWidth = 320;

    const setPanelWidth = (width) => {
      const chartPadding = document.body.classList.contains('chart-expanded') ? 24 : 52;
      const availableWidth = section.clientWidth - resizer.offsetWidth - minChartWidth - chartPadding;
      const maximum = Math.max(minPanelWidth, Math.min(maxPanelWidth, availableWidth));
      const boundedWidth = Math.round(Math.max(minPanelWidth, Math.min(maximum, width)));
      section.style.setProperty('--parameter-panel-width', `${boundedWidth}px`);
      resizer.setAttribute('aria-valuemax', String(Math.round(maximum)));
      resizer.setAttribute('aria-valuenow', String(boundedWidth));
      resizer.setAttribute('aria-valuetext', `${boundedWidth} pixels`);
    };

    if (!narrowViewport.matches) {
      setPanelWidth(parameterPanel.getBoundingClientRect().width);
    }

    const pointerPanelWidth = (event) => (
      event.clientX -
      section.getBoundingClientRect().left -
      section.clientLeft -
      resizer.offsetWidth / 2
    );

    resizer.addEventListener('pointerdown', (event) => {
      if (narrowViewport.matches) return;
      event.preventDefault();
      resizer.setPointerCapture(event.pointerId);
      document.body.classList.add('resizing-simulator-panel');
      setPanelWidth(pointerPanelWidth(event));
    });

    resizer.addEventListener('pointermove', (event) => {
      if (resizer.hasPointerCapture(event.pointerId)) {
        setPanelWidth(pointerPanelWidth(event));
      }
    });

    const stopResizing = (event) => {
      if (!resizer.hasPointerCapture(event.pointerId)) return;
      resizer.releasePointerCapture(event.pointerId);
      document.body.classList.remove('resizing-simulator-panel');
    };
    resizer.addEventListener('pointerup', stopResizing);
    resizer.addEventListener('pointercancel', stopResizing);

    resizer.addEventListener('keydown', (event) => {
      if (narrowViewport.matches || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
      event.preventDefault();
      const currentWidth = parseFloat(
        getComputedStyle(section).getPropertyValue('--parameter-panel-width')
      ) || parameterPanel.getBoundingClientRect().width;
      setPanelWidth(currentWidth + (event.key === 'ArrowRight' ? 16 : -16));
    });
  });
});
