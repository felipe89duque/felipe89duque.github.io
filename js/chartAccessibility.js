const accessibleChartTables = {
  id: 'accessibleChartTables',
  afterUpdate(chart) {
    const canvas = chart.canvas;
    const title = chart.options.plugins?.title?.text || canvas.getAttribute('aria-label') || 'Chart';
    const detailsId = `${canvas.id}-accessible-data`;
    let details = document.getElementById(detailsId);

    if (!details) {
      details = document.createElement('details');
      details.id = detailsId;
      details.className = 'chart-data-details';
      const summary = document.createElement('summary');
      summary.textContent = 'View graph data table';
      details.append(summary);
      const chartContainer = canvas.closest('.sweep-chart, .potential-chart-canvas');
      (chartContainer || canvas).insertAdjacentElement('afterend', details);
    }

    const descriptionId = `${canvas.id}-accessible-description`;
    let description = document.getElementById(descriptionId);
    if (!description) {
      description = document.createElement('p');
      description.id = descriptionId;
      description.className = 'visually-hidden';
      const chartContainer = canvas.closest('.sweep-chart, .potential-chart-canvas');
      (chartContainer || canvas).insertAdjacentElement('afterend', description);
    }

    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', `Graph: ${title}. A data table follows.`);
    description.textContent = `The ${title} graph is followed by a data table with the same plotted values.`;
    canvas.setAttribute('aria-describedby', descriptionId);

    const datasets = chart.data.datasets;
    const table = document.createElement('table');
    const caption = document.createElement('caption');
    caption.textContent = `${title} data`;
    table.append(caption);

    const scales = chart.options.scales || {};
    const xAxisTitle = scales.x?.title?.text || scales.xAxis?.title?.text || 'Data point';
    const head = document.createElement('thead');
    const headerRow = document.createElement('tr');
    const xHeader = document.createElement('th');
    xHeader.scope = 'col';
    xHeader.textContent = xAxisTitle;
    headerRow.append(xHeader);
    datasets.forEach((dataset) => {
      const header = document.createElement('th');
      header.scope = 'col';
      header.textContent = dataset.label || 'Value';
      headerRow.append(header);
    });
    head.append(headerRow);
    table.append(head);

    const body = document.createElement('tbody');
    const rowCount = Math.max(0, ...datasets.map((dataset) => dataset.data.length));
    if (rowCount === 0) {
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      cell.colSpan = datasets.length + 1;
      cell.textContent = 'Run the simulation to generate graph data.';
      row.append(cell);
      body.append(row);
    } else {
      for (let index = 0; index < rowCount; index += 1) {
        const row = document.createElement('tr');
        const label = chart.data.labels[index] ??
          datasets.find((dataset) => dataset.data[index] && typeof dataset.data[index] === 'object')?.data[index]?.x ??
          String(index + 1);
        const rowHeader = document.createElement('th');
        rowHeader.scope = 'row';
        rowHeader.textContent = String(label);
        row.append(rowHeader);

        datasets.forEach((dataset) => {
          const cell = document.createElement('td');
          const value = dataset.data[index];
          cell.textContent = value == null
            ? '—'
            : typeof value === 'object'
              ? String(value.y ?? '')
              : Array.isArray(value)
                ? value.join(', ')
                : String(value);
          row.append(cell);
        });
        body.append(row);
      }
    }
    table.append(body);

    const existingTable = details.querySelector('table');
    if (existingTable) existingTable.remove();
    details.append(table);
  }
};

Chart.register(accessibleChartTables);
