// ── shared.js ── nav + table renderer + helpers ──

import { sb } from './supabase.js';

// ── Helpers ───────────────────────────────────────────────
export const brl   = v => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
export const total = list => list.reduce((s, c) => s + parseFloat(c.valor), 0);
export const media = list => list.length ? total(list) / list.length : 0;

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

  // pega email do usuário logado direto pelo sb importado
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

  // logout direto pelo sb — sem import dinâmico
  document.querySelector('#btn-logout').addEventListener('click', async () => {
    await sb.auth.signOut();
    const inPages = window.location.pathname.includes('/pages/');
    window.location.href = inPages ? '../login.html' : 'login.html';
  });
}

// ── Chart (linha) ─────────────────────────────────────────
export function renderChart(canvasId, list, color) {
  if (!list.length) return;
  const labels = list.map(c => c.mes.replace('/', '\n'));
  const values = list.map(c => parseFloat(c.valor));

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
          backgroundColor: '#111',
          titleColor: '#888',
          bodyColor: '#e8eaf0',
          borderColor: '#2a2f3d',
          borderWidth: 1,
        }
      },
      scales: {
        x: {
          grid: { color: '#2a2f3d' },
          ticks: { color: '#6b7494', font: { family: 'IBM Plex Mono', size: 11 } }
        },
        y: {
          grid: { color: '#2a2f3d' },
          ticks: {
            color: '#6b7494',
            font: { family: 'IBM Plex Mono', size: 11 },
            callback: v => 'R$' + v
          }
        }
      }
    }
  });
}

// ── Loading / Error states ─────────────────────────────────
export function showLoading(containerId) {
  document.querySelector('#' + containerId).innerHTML =
    '<div class="empty">Carregando…</div>';
}

export function showError(containerId, msg) {
  document.querySelector('#' + containerId).innerHTML =
    '<div class="empty" style="color:var(--energia)">Erro: ' + msg + '</div>';
}

// ── Table renderer ────────────────────────────────────────
export function renderTable(list, onDelete) {
  const container = document.querySelector('#bills-section');
  const count     = document.querySelector('#bills-count');
  if (count) count.textContent = list.length + ' registro' + (list.length !== 1 ? 's' : '');

  if (!list.length) {
    container.innerHTML = '<div class="empty">Nenhuma conta registrada ainda.<br>Use o formulário acima para adicionar.</div>';
    return;
  }

  const rows = [...list].reverse().map(c => `
    <tr>
      <td>${c.mes}</td>
      <td class="valor">${brl(c.valor)}</td>
      <td>${c.data_pgto ?? '—'}</td>
      <td><span class="badge ${c.paga ? 'badge-paga' : 'badge-aberto'}">${c.paga ? 'Paga' : 'Em aberto'}</span></td>
      <td class="del-cell"><button class="btn-del" data-id="${c.id}" title="Remover">✕</button></td>
    </tr>
  `).join('');

  container.innerHTML = `
    <table>
      <thead><tr><th>Mês/Ano</th><th>Valor</th><th>Data pgto</th><th>Status</th><th></th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  `;

  container.querySelectorAll('.btn-del').forEach(btn => {
    btn.addEventListener('click', () => onDelete(btn.dataset.id));
  });
}
