// ================================================================
// js/supabase.js
// Configure as duas variáveis abaixo com os dados do seu projeto:
//   Supabase → Project Settings → API
// ================================================================

const SUPABASE_URL = 'https://bgqvouwyolsqzibtwify.supabase.co';
const SUPABASE_KEY = 'sb_publishable_TZb7EU5duyf6SGy-97ABaw_Rq-Lo18A';
// ── Cliente ──────────────────────────────────────────────────
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
export const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

// ── Auth ─────────────────────────────────────────────────────

/** Retorna a sessão atual ou null */
export async function getSession() {
  const { data } = await sb.auth.getSession();
  return data.session;
}

/** Redireciona para login.html se não houver sessão */
export async function requireAuth(base = '..') {
  const session = await getSession();
  if (!session) {
    window.location.href = `${base}/login.html`;
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
  window.location.href = '/login.html';
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
