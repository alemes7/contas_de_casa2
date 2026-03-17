import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://bgqvouwyolsqzibtwify.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJncXZvdXd5b2xzcXppYnR3aWZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3MDY3ODAsImV4cCI6MjA4OTI4Mjc4MH0.b9BskxAduRa6PYHSxmNT8CGmHlohByukekaLDl6I6B8';

export const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

// ── Base path ─────────────────────────────────────────────
function basePath() {
  const parts   = window.location.pathname.split('/');
  const inPages = parts.includes('pages');
  const base    = inPages
    ? parts.slice(0, parts.indexOf('pages')).join('/')
    : parts.slice(0, -1).join('/');
  return base || '';
}

// ── Auth ──────────────────────────────────────────────────
export async function getSession() {
  const { data } = await sb.auth.getSession();
  return data.session;
}

export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    window.location.href = basePath() + '/login.html';
  }
  return session;
}

export async function login(email, senha) {
  const { data, error } = await sb.auth.signInWithPassword({ email, password: senha });
  if (error) throw error;
  return data;
}

// ── CRUD Contas ───────────────────────────────────────────
export async function getContas(categoria) {
  const { data, error } = await sb
    .from('contas')
    .select('*')
    .eq('categoria', categoria)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data;
}

export async function addConta(categoria, { mes, valor, data_pgto, paga }) {
  const { data, error } = await sb
    .from('contas')
    .insert({ categoria, mes, valor, data_pgto: data_pgto || null, paga })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteConta(id) {
  const { error } = await sb.from('contas').delete().eq('id', id);
  if (error) throw error;
}

export async function getTotais() {
  const { data, error } = await sb.from('contas').select('categoria, valor, mes');
  if (error) throw error;

  const mesesPT  = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
                    'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  const agora    = new Date();
  const mesAtual = mesesPT[agora.getMonth()] + '/' + agora.getFullYear();

  const totais    = { agua: 0, energia: 0, internet: 0, vivo: 0 };
  const counts    = { agua: 0, energia: 0, internet: 0, vivo: 0 };
  const totaisMes = { agua: 0, energia: 0, internet: 0, vivo: 0 };

  for (const row of data) {
    totais[row.categoria]  += parseFloat(row.valor);
    counts[row.categoria]++;
    if (row.mes?.trim().toLowerCase() === mesAtual.toLowerCase()) {
      totaisMes[row.categoria] += parseFloat(row.valor);
    }
  }
  return { totais, counts, totaisMes, mesAtual };
}
