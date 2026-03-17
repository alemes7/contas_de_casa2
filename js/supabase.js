// ================================================================
// js/supabase.js
// Configure as duas variáveis abaixo com os dados do seu projeto:
//   Supabase → Project Settings → API
// ================================================================

const SUPABASE_URL = 'https://bgqvouwyolsqzibtwify.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJncXZvdXd5b2xzcXppYnR3aWZ5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzcwNjc4MCwiZXhwIjoyMDg5MjgyNzgwfQ.VVj5lait3lG8u8TxsRnuKFmu78QDSgzeschMlGIAA6w';

// ── Cliente ──────────────────────────────────────────────────
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
export const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

// ── Base path (funciona no GitHub Pages e local) ─────────────
// Ex: https://alemes7.github.io/contas_de_casa2  →  /contas_de_casa2
function basePath() {
  // pega tudo até a última pasta que contém index.html ou login.html
  const path = window.location.pathname;
  // remove /pages/arquivo.html ou /arquivo.html, fica só o root do projeto
  const parts = path.split('/');
  // se estiver em /pages/, sobe dois níveis; senão sobe um
  const inPages = parts.includes('pages');
  const base = inPages
    ? parts.slice(0, parts.indexOf('pages')).join('/')
    : parts.slice(0, -1).join('/');
  return base || '';
}

// ── Auth ─────────────────────────────────────────────────────

/** Retorna a sessão atual ou null */
export async function getSession() {
  const { data } = await sb.auth.getSession();
  return data.session;
}

/** Redireciona para login.html se não houver sessão */
export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    window.location.href = basePath() + '/login.html';
  }
  return session;
}

/** Login com email + senha */
export async function login(email, senha) {
  const { data, error } = await sb.auth.signInWithPassword({ email, password: senha });
  if (error) throw error;
  return data;
}

/** Logout */
export async function logout() {
  await sb.auth.signOut();
  window.location.href = basePath() + '/login.html';
}

// ── CRUD Contas ───────────────────────────────────────────────

/** Busca todas as contas de uma categoria, ordem cronológica */
export async function getContas(categoria) {
  const { data, error } = await sb
    .from('contas')
    .select('*')
    .eq('categoria', categoria)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
}

/** Insere uma nova conta */
export async function addConta(categoria, { mes, valor, data_pgto, paga }) {
  const { data, error } = await sb
    .from('contas')
    .insert({ categoria, mes, valor, data_pgto: data_pgto || null, paga })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Remove uma conta pelo id */
export async function deleteConta(id) {
  const { error } = await sb.from('contas').delete().eq('id', id);
  if (error) throw error;
}

/** Busca totais de todas as categorias de uma vez (para o index) */
export async function getTotais() {
  const { data, error } = await sb.from('contas').select('categoria, valor');
  if (error) throw error;

  const totais = { agua: 0, energia: 0, internet: 0, vivo: 0 };
  const counts = { agua: 0, energia: 0, internet: 0, vivo: 0 };
  for (const row of data) {
    totais[row.categoria] += parseFloat(row.valor);
    counts[row.categoria]++;
  }
  return { totais, counts };
}
