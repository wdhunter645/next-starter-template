const views = [
  ['activePrograms', 'Active Programs'],
  ['pmoPipeline', 'PMO Pipeline'],
  ['completedPrograms', 'Completed Programs'],
  ['incomplete', 'Incomplete']
];
const portfolioColumns = [
  'Program / Project Name',
  'Issue #',
  'Priority',
  'Status',
  '% Complete',
  '# of Tasks',
  '# of Tasks Completed',
  'Owner / Agent',
  'Program Description',
  'Anticipated Completion Date'
];
const incompleteColumns = [
  'Program / Project Name',
  'Issue #',
  'Labels',
  'Data-quality errors',
  'Required remediation',
  'Last updated'
];
const fmt = (value, fallback = '') => (value === null || value === undefined || value === '' ? fallback : String(value));
const esc = (value) => fmt(value, '').replace(/[&<>"']/g, (char) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
}[char]));
const pct = (value) => (typeof value === 'number' && Number.isFinite(value) ? `${value}%` : 'N/A');
const issueHref = (value) => {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname === 'github.com' ? url.href : '#';
  } catch {
    return '#';
  }
};
const formatList = (values) => (Array.isArray(values) && values.length ? values.map((value) => esc(value)).join('<br>') : '—');
const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? esc(value) : esc(date.toLocaleString());
};

function portfolioRowHtml(row, isChild = false) {
  const prefix = isChild ? '↳ ' : '';
  const childClass = isChild ? ' child-row' : '';
  const priority = row.priorityDisplay || row.priority || '';
  return `<tr class="${childClass.trim()}"><td><span class="row-prefix">${esc(prefix)}</span><a href="${issueHref(row.issueUrl)}">${esc(row.name || row.title || 'Unnamed PMO item')}</a><br><span class="pill">${esc(row.type || row.lifecycle || 'item')}</span></td><td><a href="${issueHref(row.issueUrl)}">#${esc(fmt(row.issueNumber))}</a></td><td>${esc(fmt(priority))}</td><td>${esc(fmt(row.status))}</td><td>${esc(pct(row.percentComplete))}</td><td>${esc(fmt(row.taskCount, '0'))}</td><td>${esc(fmt(row.tasksCompleted, '0'))}</td><td>${esc(fmt(row.ownerAgent, 'Pending Assignment'))}</td><td>${esc(fmt(row.description, ''))}</td><td>${esc(fmt(row.anticipatedCompletionDate, '—'))}</td></tr>`;
}

function incompleteRowHtml(row) {
  return `<tr><td><a href="${issueHref(row.issueUrl)}">${esc(row.name || row.title || 'Unnamed PMO item')}</a><br><span class="pill">${esc(row.type || 'incomplete')}</span></td><td><a href="${issueHref(row.issueUrl)}">#${esc(fmt(row.issueNumber))}</a></td><td>${formatList(row.labels)}</td><td>${formatList(row.dataQualityErrors)}</td><td>${formatList(row.requiredRemediation)}</td><td>${formatDate(row.updatedAt)}</td></tr>`;
}

function rowsHtml(row, viewKey) {
  if (viewKey === 'incomplete') return incompleteRowHtml(row);
  const parts = [portfolioRowHtml(row, false)];
  for (const child of row.children || []) parts.push(portfolioRowHtml(child, true));
  return parts.join('');
}

fetch('dashboard-data.json')
  .then((response) => response.json())
  .then((data) => {
    const modelNote = data.contractVersion === 'pmo-july-2026'
      ? ' PMO July 2026 contract.'
      : (data.trackingModel === 'pmo-label' ? ' PMO-label tracking.' : '');
    document.getElementById('dashboard').innerHTML = `<p class="meta">Generated ${esc(new Date(data.generatedAt).toLocaleString())} from ${esc(data.repository)} GitHub Issues.${esc(modelNote)}</p>`
      + views.map(([key, title]) => {
        const rows = data.views?.[key] || [];
        const columns = key === 'incomplete' ? incompleteColumns : portfolioColumns;
        return `<section><h2>${esc(title)}</h2>${rows.length
          ? `<div class="table-wrap"><table><thead><tr>${columns.map((column) => `<th>${esc(column)}</th>`).join('')}</tr></thead><tbody>${rows.map((row) => rowsHtml(row, key)).join('')}</tbody></table></div>`
          : `<p class="empty">No ${esc(title.toLowerCase())} rows are currently available.</p>`}</section>`;
      }).join('');
  })
  .catch((error) => {
    document.getElementById('dashboard').textContent = `Dashboard data could not be loaded: ${error.message}`;
  });
