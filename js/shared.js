// ── shared.js ── nav + table renderer + helpers ──

import { sb } from './supabase.js';

// ── Helpers ───────────────────────────────────────────────
export const brl   = v => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
export const total = list => list.reduce((s, c) => s + parseFloat(c.valor), 0);
export const media = list => list.length ? total(list) / list.length : 0;

// Converte "Março/2026" → Date para ordenação
const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
               'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

function mesToDate(mesStr) {
  if (!mesStr) return new Date(0);
  const [nome, ano] = mesStr.split('/');
  const idx = MESES.findIndex(m => m.toLowerCase() === nome?.toLowerCase());
  return new Date(parseInt(ano) || 0, idx >= 0 ? idx : 0);
}

// Converte "Março/2026" → "2026-03" para o input type="month"
function mesToMonthInput(mesStr) {
  if (!mesStr) return '';
  const [nome, ano] = mesStr.split('/');
  const idx = MESES.findIndex(m => m.toLowerCase() === nome?.toLowerCase());
  if (idx < 0 || !ano) return '';
  return `${ano}-${String(idx + 1).padStart(2, '0')}`;
}

// Converte "15/03/2026" → "2026-03-15" para o input type="date"
function dataPgtoToInput(dataStr) {
  if (!dataStr) return '';
  const [dia, mes, ano] = dataStr.split('/');
  if (!dia || !mes || !ano) return '';
  return `${ano}-${mes}-${dia}`;
}

// Converte "2026-03" → "Março/2026"
function monthInputToLabel(val) {
  if (!val) return '';
  const [ano, mes] = val.split('-');
  return MESES[parseInt(mes) - 1] + '/' + ano;
}

// Converte "2026-03-15" → "15/03/2026"
function dateInputToLabel(val) {
  if (!val) return '';
  const [ano, mes, dia] = val.split('-');
  return `${dia}/${mes}/${ano}`;
}

// ── Nav ───────────────────────────────────────────────────
function resolveHref(path) {
  const inPages = window.location.pathname.includes('/pages/');
  return inPages ? '../' + path : path;
}

function getNavItems() {
  return [
    { label: 'Início',   href: resolveHref('index.html'),         key: 'index'    },
    { label: 'Água',     href: resolveHref('pages/agua.html'),     key: 'agua'     },
    { label: 'Energia',  href: resolveHref('pages/energia.html'),  key: 'energia'  },
    { label: 'Internet', href: resolveHref('pages/internet.html'), key: 'internet' },
    { label: 'Vivo',     href: resolveHref('pages/vivo.html'),     key: 'vivo'     },
  ];
}

export async function renderNav(active) {
  const items = getNavItems();

  const links = items.map(n =>
    `<li><a href="${n.href}" class="${n.key === active ? 'active' : ''}">${n.label}</a></li>`
  ).join('');

  const mobileLinks = items.map(n =>
    `<a href="${n.href}" class="${n.key === active ? 'active' : ''}">${n.label}</a>`
  ).join('');

  let userName = '';
  try {
    const { data } = await sb.auth.getSession();
    const email = data?.session?.user?.email ?? '';
    userName = email ? email.split('@')[0] : '';
  } catch (_) {}

  document.querySelector('nav').innerHTML = `
    <a class="nav-brand" href="${resolveHref('index.html')}">CONTAS DE CASA</a>
    <ul class="nav-links">${links}</ul>
    <div class="nav-user">
      ${userName ? `<span class="nav-email">${userName}</span>` : ''}
      <button class="btn-logout" id="btn-logout" title="Sair">↪ Sair</button>
    </div>
    <button class="hamburger" id="hbg">☰</button>
  `;

  const menu = document.createElement('div');
  menu.className = 'mobile-menu';
  menu.id = 'mobile-menu';
  menu.innerHTML = mobileLinks;
  document.querySelector('nav').insertAdjacentElement('afterend', menu);

  document.querySelector('#hbg').addEventListener('click', () => {
    menu.classList.toggle('open');
  });

  document.querySelector('#btn-logout').addEventListener('click', async () => {
    await sb.auth.signOut();
    const inPages = window.location.pathname.includes('/pages/');
    window.location.href = inPages ? '../login.html' : 'login.html';
  });
}

// ── Chart ─────────────────────────────────────────────────
export function renderChart(canvasId, list, color) {
  if (!list.length) return;
  // ordena antes de plotar
  const sorted = [...list].sort((a, b) => mesToDate(a.mes) - mesToDate(b.mes));
  const labels = sorted.map(c => c.mes.replace('/', '\n'));
  const values = sorted.map(c => parseFloat(c.valor));

  return new Chart(document.getElementById(canvasId), {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Valor (R$)',
        data: values,
        borderColor: color,
        backgroundColor: color + '18',
        borderWidth: 2.5,
        pointBackgroundColor: color,
        pointRadius: 5,
        pointHoverRadius: 7,
        tension: 0.35,
        fill: true,
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => ' ' + Number(ctx.parsed.y).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
          },
          backgroundColor: '#111', titleColor: '#888',
          bodyColor: '#e8eaf0', borderColor: '#2a2f3d', borderWidth: 1,
        }
      },
      scales: {
        x: { grid: { color: '#2a2f3d' }, ticks: { color: '#6b7494', font: { family: 'IBM Plex Mono', size: 11 } } },
        y: { grid: { color: '#2a2f3d' }, ticks: { color: '#6b7494', font: { family: 'IBM Plex Mono', size: 11 }, callback: v => 'R$' + v } }
      }
    }
  });
}

// ── Loading / Error ────────────────────────────────────────
export function showLoading(containerId) {
  document.querySelector('#' + containerId).innerHTML = '<div class="empty">Carregando…</div>';
}
export function showError(containerId, msg) {
  document.querySelector('#' + containerId).innerHTML =
    '<div class="empty" style="color:var(--energia)">Erro: ' + msg + '</div>';
}

// ── Table renderer (com edição inline + ordenação) ────────
export function renderTable(list, onDelete, onUpdate) {
  const container = document.querySelector('#bills-section');
  const count     = document.querySelector('#bills-count');

  // ordena por data crescente
  const sorted = [...list].sort((a, b) => mesToDate(a.mes) - mesToDate(b.mes));

  if (count) count.textContent = sorted.length + ' registro' + (sorted.length !== 1 ? 's' : '');

  if (!sorted.length) {
    container.innerHTML = '<div class="empty">Nenhuma conta registrada ainda.<br>Use o formulário acima para adicionar.</div>';
    return;
  }

  const rows = sorted.map(c => `
    <tr data-id="${c.id}" class="row-view">
      <td>${c.mes}</td>
      <td class="valor">${brl(c.valor)}</td>
      <td>${c.data_pgto ?? '—'}</td>
      <td><span class="badge ${c.paga ? 'badge-paga' : 'badge-aberto'}">${c.paga ? 'Paga' : 'Em aberto'}</span></td>
      <td class="actions-cell">
        <button class="btn-edit" data-id="${c.id}" title="Editar">✎</button>
        <button class="btn-del"  data-id="${c.id}" title="Remover">✕</button>
      </td>
    </tr>
    <tr data-id="${c.id}" class="row-edit" style="display:none">
      <td>
        <input class="edit-mes"   type="month" value="${mesToMonthInput(c.mes)}">
      </td>
      <td>
        <input class="edit-valor" type="number" step="0.01" min="0" value="${c.valor}">
      </td>
      <td>
        <input class="edit-data"  type="date" value="${dataPgtoToInput(c.data_pgto)}">
      </td>
      <td>
        <select class="edit-paga" style="font-family:'IBM Plex Mono',monospace;font-size:12px;padding:5px 8px;border:2px solid var(--border);background:var(--paper);color:var(--ink);">
          <option value="true"  ${c.paga ? 'selected' : ''}>Paga</option>
          <option value="false" ${!c.paga ? 'selected' : ''}>Em aberto</option>
        </select>
      </td>
      <td class="actions-cell">
        <button class="btn-save"   data-id="${c.id}" title="Salvar">✓</button>
        <button class="btn-cancel" data-id="${c.id}" title="Cancelar">✕</button>
      </td>
    </tr>
  `).join('');

  container.innerHTML = `
    <table>
      <thead><tr><th>Mês/Ano</th><th>Valor</th><th>Data pgto</th><th>Status</th><th></th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  `;

  // ── botão editar ──
  container.querySelectorAll('.btn-edit').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      container.querySelector(`.row-view[data-id="${id}"]`).style.display  = 'none';
      container.querySelector(`.row-edit[data-id="${id}"]`).style.display  = '';
    });
  });

  // ── botão cancelar ──
  container.querySelectorAll('.btn-cancel').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      container.querySelector(`.row-view[data-id="${id}"]`).style.display  = '';
      container.querySelector(`.row-edit[data-id="${id}"]`).style.display  = 'none';
    });
  });

  // ── botão salvar ──
  container.querySelectorAll('.btn-save').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id      = btn.dataset.id;
      const row     = container.querySelector(`.row-edit[data-id="${id}"]`);
      const mes     = monthInputToLabel(row.querySelector('.edit-mes').value);
      const valor   = parseFloat(row.querySelector('.edit-valor').value);
      const data_pgto = dateInputToLabel(row.querySelector('.edit-data').value);
      const paga    = row.querySelector('.edit-paga').value === 'true';

      if (!mes || isNaN(valor) || valor <= 0) {
        alert('Preencha mês e valor corretamente.'); return;
      }

      btn.textContent = '…';
      btn.disabled    = true;

      try {
        await onUpdate(id, { mes, valor, data_pgto, paga });
      } catch (err) {
        alert('Erro ao salvar: ' + err.message);
        btn.textContent = '✓';
        btn.disabled    = false;
      }
    });
  });

  // ── botão deletar ──
  container.querySelectorAll('.btn-del').forEach(btn => {
    btn.addEventListener('click', () => onDelete(btn.dataset.id));
  });
}
