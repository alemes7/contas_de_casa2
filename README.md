# Contas de Casa 🏠
**Stack:** HTML + CSS + JS puro · Supabase (banco + auth) · GitHub Pages (hospedagem)
**Custo:** R$ 0,00

---

## Passo 1 — Criar o projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e crie uma conta gratuita
2. Clique em **New Project**
3. Dê um nome (ex: `contas-de-casa`), escolha uma senha pro banco, região **South America (São Paulo)**
4. Aguarde ~2 minutos enquanto o projeto sobe

---

## Passo 2 — Criar as tabelas

1. No menu lateral do Supabase, clique em **SQL Editor**
2. Clique em **New Query**
3. Cole o conteúdo do arquivo `supabase/schema.sql`
4. Clique em **Run** (▶)

Isso cria a tabela `contas`, ativa o RLS (Row Level Security) e já insere o histórico de 2023.

---

## Passo 3 — Pegar as credenciais do projeto

1. No menu lateral, clique em **Project Settings → API**
2. Copie:
   - **Project URL** → algo como `https://abcdefgh.supabase.co`
   - **anon / public key** → começa com `eyJ...`

---

## Passo 4 — Colar as credenciais no código

Abra o arquivo `js/supabase.js` e substitua as duas linhas no topo:

```js
const SUPABASE_URL = 'https://SEU-ID.supabase.co';   // ← sua URL aqui
const SUPABASE_KEY = 'eyJ...';                         // ← sua anon key aqui
```

> ⚠️ A `anon key` é pública por design — ela só dá acesso ao que o RLS permite (usuários autenticados). Pode deixar exposta no frontend sem problema.

---

## Passo 5 — Criar os usuários (seus pais)

1. No Supabase, vá em **Authentication → Users**
2. Clique em **Add User → Create new user**
3. Crie um usuário pra cada pessoa da família (email + senha)

Eles vão usar esse email e senha pra entrar no site.

---

## Passo 6 — Subir no GitHub Pages

1. Crie um repositório no GitHub (pode ser público ou privado)
2. Faça push de todos os arquivos desta pasta
3. Vá em **Settings → Pages → Branch: main → / (root) → Save**
4. Aguarde ~1 min e acesse `https://SEU-USUARIO.github.io/NOME-DO-REPO`

---

## Como usar no dia a dia

- Acesse o site pelo celular ou computador
- Faça login com email e senha
- Na página de cada conta (Água, Energia, etc), clique em **REGISTRAR NOVA CONTA**
- Preencha: mês/ano, valor, data de pagamento e se já foi paga
- Todos que estão logados veem os mesmos dados em tempo real

---

## Estrutura dos arquivos

```
contas-de-casa/
├── index.html              # Dashboard com totais por categoria
├── login.html              # Tela de login
├── css/
│   └── style.css           # Todo o estilo
├── js/
│   ├── supabase.js         # ← CONFIGURE AQUI as credenciais
│   └── shared.js           # Nav, tabela, helpers
├── pages/
│   ├── agua.html
│   ├── energia.html
│   ├── internet.html
│   └── vivo.html
└── supabase/
    └── schema.sql          # Script SQL para rodar uma vez no Supabase
```

---

## Testar localmente antes de subir

O `fetch` do Supabase funciona normalmente via `file://`, mas pra evitar qualquer problema:

```bash
npx serve .
# ou
python3 -m http.server 8080
```

Acesse `http://localhost:8080`.
