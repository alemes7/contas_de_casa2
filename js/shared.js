/* ── shared.js ── localStorage + nav + helpers ── */

// ── Storage keys ──────────────────────────────────────────
const KEYS = { agua: 'cc_agua', energia: 'cc_energia', internet: 'cc_internet', vivo: 'cc_vivo' };

// Seed data (only inserted once, first ever load)
const SEED = {
  agua: [
    { id: 's1', mes: 'Fevereiro/2023', valor: 61.21,  data: '15/03/2023', paga: true  },
    { id: 's2', mes: 'Março/2023',     valor: 125.60, data: '15/04/2023', paga: true  },
    { id: 's3', mes: 'Abril/2023',     valor: 166.61, data: '15/05/2023', paga: true  },
    { id: 's4', mes: 'Maio/2023',      valor: 115.92, data: '15/06/2023', paga: true  },
    { id: 's5', mes: 'Junho/2023',     valor: 145.37, data: '15/07/2023', paga: true  },
    { id: 's6', mes: 'Julho/2023',     valor: 153.94, data: '15/08/2023', paga: true  },
    { id: 's7', mes: 'Agosto/2023',    valor: 100.86, data: '15/09/2023', paga: true  },
    { id: 's8', mes: 'Setembro/2023',  valor: 196.44, data: null,         paga: false },
  ],
  energia: [
    { id: 'e1', mes: 'Fevereiro/2023', valor: 102.77, data: '19/02/2023', paga: true },
    { id: 'e2', mes: 'Março/2023',     valor: 308.71, data: '06/04/2023', paga: true },
    { id: 'e3', mes: 'Abril/2023',     valor: 293.65, data: '06/05/2023', paga: true },
    { id: 'e4', mes: 'Maio/2023',      valor: 326.11, data: '06/06/2023', paga: true },
    { id: 'e5', mes: 'Junho/2023',     valor: 290.27, data: '06/07/2023', paga: true },
    { id: 'e6', mes: 'Julho/2023',     valor: 303.59, data: '04/08/2023', paga: true },
    { id: 'e7', mes: 'Agosto/2023',    valor: 342.71, data: '06/09/2023', paga: true },
  ],
  internet: [
    { id: 'i1', mes: 'Fevereiro/2023', valor: 125.60, data: '10/02/2023', paga: true },
  ],
  vivo: [
    { id: 'v1', mes: 'Fevereiro/2023', valor: 100.60, data: '10/02/2023', paga: true },
  ],
};

// ── CRUD ──────────────────────────────────────────────────
export function getContas(cat) {
  const key = KEYS[cat];
  const raw = localStorage.getItem(key);
  if (raw) return JSON.parse(raw);
  // first time: seed
  localStorage.setItem(key, JSON.stringify(SEED[cat]));
  return SEED[cat];
}

export function saveContas(cat, list) {
  localStorage.setItem(KEYS[cat], JSON.stringify(list));
}

export function addConta(cat, { mes, valor, data, paga }) {
  const list = getContas(cat);
  list.push({ id: crypto.randomUUID(), mes, valor, data: data || null, paga });
  saveContas(cat, list);
  return list;
}

export function deleteConta(cat, id) {
  const list = getContas(cat).filter(c => c.id !== id);
  saveContas(cat, list);
  return list;
}

// ── Helpers ───────────────────────────────────────────────
export const brl = v => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
export const total = list => list.reduce((s, c) => s + c.valor, 0);
export const media = list => list.length ? total(list) / list.length : 0;

// ── Nav ───────────────────────────────────────────────────
const NAV_ITEMS = [
  { label: 'Início',    href: '/index.html',              key: 'index'    },
  { label: 'Água',      href: '/pages/agua.html',         key: 'agua'     },
  { label: 'Energia',   href: '/pages/energia.html',      key: 'energia'  },
  { label: 'Internet',  href: '/pages/internet.html',     key: 'internet' },
  { label: 'Vivo',      href: '/pages/vivo.html',         key: 'vivo'     },
];

export function renderNav(active) {
  const links = NAV_ITEMS.map(n =>
    `<li><a href="${n.href}" class="${n.key === active ? 'active' : ''}">${n.label}</a></li>`
  ).join('');

  const mobileLinks = NAV_ITEMS.map(n =>
    `<a href="${n.href}" class="${n.key === active ? 'active' : ''}">${n.label}</a>`
  ).join('');

  document.querySelector('nav').innerHTML = `
    <a class="nav-brand" href="/index.html">CONTAS DE CASA</a>
    <ul class="nav-links">${links}</ul>
    <button class="hamburger" id="hbg">☰</button>
  `;

  // inject mobile menu after nav
  const menu = document.createElement('div');
  menu.className = 'mobile-menu';
  menu.id = 'mobile-menu';
  menu.innerHTML = mobileLinks;
  document.querySelector('nav').insertAdjacentElement('afterend', menu);

  document.querySelector('#hbg').addEventListener('click', () => {
    menu.classList.toggle('open');
  });
}

// ── Table renderer ────────────────────────────────────────
export function renderTable(cat, list, onDelete) {
  const container = document.querySelector('#bills-section');

  const count = document.querySelector('#bills-count');
  if (count) count.textContent = `${list.length} registro${list.length !== 1 ? 's' : ''}`;

  if (!list.length) {
    container.innerHTML = `<div class="empty">Nenhuma conta registrada ainda.<br>Use o formulário acima para adicionar.</div>`;
    return;
  }

  const rows = [...list].reverse().map(c => `
    <tr>
      <td>${c.mes}</td>
      <td class="valor">${brl(c.valor)}</td>
      <td>${c.data ?? '—'}</td>
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
