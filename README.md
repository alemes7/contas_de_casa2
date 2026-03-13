# Contas de Casa 🏠

Dashboard de administração de contas domésticas. Feito com HTML, CSS e JS puro — sem frameworks, sem build step, funciona direto no GitHub Pages.

## Estrutura

```
contas-casa/
├── index.html          # Dashboard principal
├── data.json           # ← EDITE AQUI para adicionar contas
├── css/
│   └── style.css
├── js/
│   └── shared.js       # Sidebar, utilitários, carregamento do JSON
└── pages/
    ├── gastos.html
    ├── pagas_agua.html
    ├── pagas_energia.html
    ├── pagas_internet.html
    ├── pagas_vivo.html
    ├── economia_agua.html
    └── economia_energia.html
```

## Como adicionar uma nova conta

Abra `data.json` e adicione um objeto na lista correspondente:

```json
{
  "agua": [
    { "mes": "Outubro", "valor": 132.50, "data": "15/11/2023", "paga": true },
    ...
  ]
}
```

Campos:
- `mes` — nome do mês em português
- `valor` — valor em reais (número)
- `data` — data de pagamento no formato `dd/mm/aaaa`, ou `null` se ainda não paga
- `paga` — `true` ou `false`

## Deploy no GitHub Pages

1. Crie um repositório no GitHub (pode ser público ou privado com Pages ativado)
2. Faça push de todos os arquivos
3. Vá em **Settings → Pages → Branch: main → / (root)**
4. Aguarde ~1 minuto e acesse `https://seu-usuario.github.io/nome-do-repo`

> ⚠️ **Atenção**: O GitHub Pages serve arquivos estáticos via HTTP. O `fetch('data.json')` funciona normalmente nesse ambiente. Só não abre direto pelo sistema de arquivos (file://) — use um servidor local como `npx serve .` para testar localmente.

## Testar localmente

```bash
npx serve .
# ou
python3 -m http.server 8080
```

Depois acesse `http://localhost:8080`.
