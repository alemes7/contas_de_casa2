// ── shared.js ── nav + table renderer + helpers ──

// ── Helpers ───────────────────────────────────────────────
export const brl   = v => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
export const total = list => list.reduce((s, c) => s + parseFloat(c.valor), 0);
export const media = list => list.length ? total(list) / list.length : 0;

// ── Nav ───────────────────────────────────────────────────
// Usa caminhos relativos para funcionar no GitHub Pages com subpasta

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

export function renderNav(active) {
  const items = getNavItems();

  const links = items.map(n =>
    `<li><a href="${n.href}" class="${n.key === active ? 'active' : ''}">${n.label}</a></li>`
  ).join('');

  const mobileLinks = items.map(n =>
    `<a href="${n.href}" class="${n.key === active ? 'active' : ''}">${n.label}</a>`
  ).join('');

  document.querySelector('nav').innerHTML = `
    <a class="nav-brand" href="${resolveHref('index.html')}">CONTAS DE CASA</a>
    <ul class="nav-links">${links}</ul>
    <button class="hamburger" id="hbg">☰</button>
    <button class="btn-logout" id="btn-logout" title="Sair">↪ Sair</button>
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
    const { logout } = await import(window.location.pathname.includes('/pages/') ? '../js/supabase.js' : './supabase.js');
    await logout();
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
