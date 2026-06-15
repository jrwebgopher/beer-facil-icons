# 🍺 Beer Fácil Icons

Biblioteca de ícones SVG para o projeto Beer Fácil, hospedada no Cloudflare Pages.
Ícones novos chegam automaticamente para todos os projetos — sem atualizar nenhum código.

---

## ⚡ Como o programador usa (só isso, nunca mais mexe)

```html
<link rel="stylesheet" href="https://SEU_DOMINIO.pages.dev/icons/bf-icons.css">
```

```html
<!-- Uso idêntico ao Bootstrap Icons -->
<i class="bf bf-cerveja"></i>
<i class="bf bf-chopp bf-xl bf-primary"></i>
<i class="bf bf-pedido bf-lg bf-success"></i>
```

---

## 📁 Estrutura do projeto

```
beer-facil-icons/
├── src/
│   └── svgs/              ← Adicione ícones novos aqui
│       ├── bf-cerveja.svg
│       ├── bf-chopp.svg
│       └── ...
├── dist/                  ← Gerado pelo build.js — sobe pro Cloudflare
│   ├── bf-icons.svg       ← Sprite com todos os ícones
│   └── bf-icons.css       ← CSS que o programador inclui
├── demo/
│   └── index.html         ← Vitrine dos ícones
├── build.js               ← Script de build
└── README.md
```

---

## ☁️ Deploy no Cloudflare Pages

### 1. Criar o projeto no Cloudflare

1. Acesse [dash.cloudflare.com](https://dash.cloudflare.com)
2. Vá em **Workers & Pages → Create application → Pages**
3. Conecte ao seu repositório Git (GitHub/GitLab)
4. Configure:
   - **Build command:** `node build.js --base-url https://SEU_DOMINIO.pages.dev/icons`
   - **Build output directory:** `dist`
5. Clique em **Save and Deploy**

### 2. Configurar o domínio personalizado (opcional)

No painel do Cloudflare Pages → Custom domains → Add domain.
Ex: `icons.beerfacil.com.br`

---

## ➕ Como adicionar um ícone novo

### Opção A — Via Git (recomendado)

1. Crie o arquivo SVG em `src/svgs/bf-nome-do-icone.svg`:

```svg
<!-- categoria: Bebidas -->
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
     stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
  <!-- seu path aqui -->
  <circle cx="12" cy="12" r="10"/>
</svg>
```

2. Commit + push → Cloudflare faz o build automático
3. **Todos os projetos já recebem o ícone novo** ✅

### Opção B — Upload direto no Cloudflare (sem Git)

1. Rode localmente:
```bash
node build.js --base-url https://SEU_DOMINIO.pages.dev/icons
```
2. Faça upload dos arquivos `dist/bf-icons.svg` e `dist/bf-icons.css` via dashboard

---

## 🎨 Regras para criar um ícone

| Propriedade         | Valor obrigatório                  |
|---------------------|------------------------------------|
| `viewBox`           | `"0 0 24 24"`                      |
| `fill`              | `"none"`                           |
| `stroke`            | `"currentColor"`                   |
| `stroke-width`      | `"1.8"`                            |
| `stroke-linecap`    | `"round"`                          |
| `stroke-linejoin`   | `"round"`                          |
| Nome do arquivo     | `bf-nome-do-icone.svg`             |
| Categoria (comentário no topo) | `<!-- categoria: NomeDaCategoria -->` |

---

## 📐 Classes disponíveis

### Tamanhos
| Classe   | Tamanho   |
|----------|-----------|
| `bf-xs`  | 0.75rem   |
| `bf-sm`  | 1rem      |
| `bf-md`  | 1.5rem    |
| `bf-lg`  | 2rem      |
| `bf-xl`  | 3rem      |
| `bf-2x`  | 2em       |
| `bf-3x`  | 3em       |

### Cores
| Classe          | Cor             |
|-----------------|-----------------|
| `bf-primary`    | #F5A623 (âmbar) |
| `bf-secondary`  | #6c757d         |
| `bf-success`    | #198754         |
| `bf-danger`     | #dc3545         |
| `bf-warning`    | #ffc107         |
| `bf-info`       | #0dcaf0         |
| `bf-dark`       | #212529         |
| `bf-light`      | #f8f9fa         |
| `bf-white`      | #ffffff         |

Cor customizada via CSS:
```html
<i class="bf bf-cerveja" style="--bf-icon-color: #ff6600; --bf-icon-size: 2.5rem;"></i>
```

---

## 🔄 Como funciona a atualização automática

```
Você adiciona src/svgs/bf-novo.svg
        ↓
Git push → Cloudflare Pages detecta a mudança
        ↓
Cloudflare roda: node build.js
        ↓
dist/bf-icons.svg e dist/bf-icons.css são atualizados
        ↓
CDN do Cloudflare distribui globalmente
        ↓
Todos os projetos que incluem o <link> já têm o ícone novo ✅
(sem precisar alterar nenhuma linha de código)
```

---

## 📦 Ícones disponíveis (v1.0.0)

**Bebidas:** `bf-cerveja` · `bf-chopp` · `bf-garrafa` · `bf-barril` · `bf-lata` · `bf-copo` · `bf-espuma` · `bf-lupulo` · `bf-cevada` · `bf-torneira`

**Estabelecimento:** `bf-mesa` · `bf-cardapio` · `bf-pedido` · `bf-estoque` · `bf-entrega` · `bf-pagamento`

**Sistema:** `bf-usuario` · `bf-premio` · `bf-estrela` · `bf-configuracao` · `bf-busca` · `bf-filtro` · `bf-alerta` · `bf-sucesso`
