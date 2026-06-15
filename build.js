#!/usr/bin/env node
/**
 * Beer Fácil Icons — Build Script
 * 
 * Uso: node build.js [--base-url https://seu-dominio.pages.dev/icons]
 * 
 * O que faz:
 *  1. Lê todos os arquivos .svg em src/svgs/
 *  2. Gera o sprite combinado dist/bf-icons.svg
 *  3. Gera o CSS dist/bf-icons.css com todas as classes
 * 
 * Para adicionar um ícone novo:
 *  1. Crie src/svgs/bf-nome.svg  (viewBox 24x24, stroke=currentColor)
 *  2. Rode: node build.js
 *  3. Faça deploy no Cloudflare — pronto! Nenhum programador precisa atualizar nada.
 */

const fs   = require("fs");
const path = require("path");

// ── Configurações ────────────────────────────────────────────
const BASE_URL  = process.argv.includes("--base-url")
  ? process.argv[process.argv.indexOf("--base-url") + 1]
  : "https://SEU_DOMINIO.pages.dev/icons";

const SVGS_DIR  = path.join(__dirname, "src/svgs");
const DIST_DIR  = path.join(__dirname, "dist");
const SPRITE    = path.join(DIST_DIR, "bf-icons.svg");
const CSS_OUT   = path.join(DIST_DIR, "bf-icons.css");

if (!fs.existsSync(DIST_DIR)) fs.mkdirSync(DIST_DIR, { recursive: true });

// ── Lê todos os SVGs ─────────────────────────────────────────
const files = fs.readdirSync(SVGS_DIR)
  .filter(f => f.endsWith(".svg"))
  .sort();

if (files.length === 0) {
  console.error("Nenhum SVG encontrado em src/svgs/");
  process.exit(1);
}

// ── Gera o Sprite ────────────────────────────────────────────
const symbols = files.map(file => {
  const id      = path.basename(file, ".svg");
  const content = fs.readFileSync(path.join(SVGS_DIR, file), "utf8");

  // Extrai o viewBox do arquivo
  const vbMatch = content.match(/viewBox="([^"]+)"/);
  const viewBox = vbMatch ? vbMatch[1] : "0 0 24 24";

  // Extrai o conteúdo interno do <svg>
  const inner = content
    .replace(/<\?xml[^>]*\?>/g, "")
    .replace(/<svg[^>]*>/g, "")
    .replace(/<\/svg>/g, "")
    .trim();

  return `  <symbol id="${id}" viewBox="${viewBox}">\n    ${inner}\n  </symbol>`;
});

const sprite = `<svg xmlns="http://www.w3.org/2000/svg" style="display:none">\n${symbols.join("\n\n")}\n</svg>\n`;
fs.writeFileSync(SPRITE, sprite);
console.log(`✅ Sprite gerado: ${SPRITE} (${files.length} ícones)`);

// ── Gera o CSS ───────────────────────────────────────────────
// Agrupa ícones por categoria (prefixo no nome do arquivo)
const categories = {};
files.forEach(file => {
  const id = path.basename(file, ".svg");
  // Nome como bf-cerveja → tenta encontrar comentário de categoria no SVG
  const content = fs.readFileSync(path.join(SVGS_DIR, file), "utf8");
  const catMatch = content.match(/<!--\s*categoria:\s*(.+?)\s*-->/i);
  const cat = catMatch ? catMatch[1] : "Geral";
  if (!categories[cat]) categories[cat] = [];
  categories[cat].push(id);
});

let iconCSS = "";
Object.entries(categories).forEach(([cat, ids]) => {
  iconCSS += `\n/* --- ${cat} --- */\n`;
  ids.forEach(id => {
    const padded = id.padEnd(20);
    iconCSS += `.${padded}{ --bf-mask: url("${BASE_URL}/bf-icons.svg#${id}"); }\n`;
  });
});

const css = `/*!
 * Beer Fácil Icons v1.0.0
 * Gerado automaticamente por build.js em ${new Date().toISOString().slice(0,10)}
 * ${files.length} ícones disponíveis
 * Inclua no projeto: <link rel="stylesheet" href="${BASE_URL}/bf-icons.css">
 */

:root {
  --bf-icon-size:  1em;
  --bf-icon-color: currentColor;
}

.bf {
  display: inline-block;
  width:  var(--bf-icon-size);
  height: var(--bf-icon-size);
  vertical-align: -0.125em;
  overflow: hidden;
}

.bf::before {
  content: "";
  display: block;
  width:  100%;
  height: 100%;
  background-color: var(--bf-icon-color);
  -webkit-mask-image: var(--bf-mask);
          mask-image: var(--bf-mask);
  -webkit-mask-repeat: no-repeat;
          mask-repeat: no-repeat;
  -webkit-mask-size: 100% 100%;
          mask-size: 100% 100%;
}

/* Tamanhos */
.bf-xs { --bf-icon-size: 0.75rem; }
.bf-sm { --bf-icon-size: 1rem;    }
.bf-md { --bf-icon-size: 1.5rem;  }
.bf-lg { --bf-icon-size: 2rem;    }
.bf-xl { --bf-icon-size: 3rem;    }
.bf-2x { --bf-icon-size: 2em;     }
.bf-3x { --bf-icon-size: 3em;     }
.bf-4x { --bf-icon-size: 4em;     }
.bf-5x { --bf-icon-size: 5em;     }

/* Cores */
.bf-primary   { --bf-icon-color: #F5A623; }
.bf-secondary { --bf-icon-color: #6c757d; }
.bf-success   { --bf-icon-color: #198754; }
.bf-danger    { --bf-icon-color: #dc3545; }
.bf-warning   { --bf-icon-color: #ffc107; }
.bf-info      { --bf-icon-color: #0dcaf0; }
.bf-dark      { --bf-icon-color: #212529; }
.bf-light     { --bf-icon-color: #f8f9fa; }
.bf-white     { --bf-icon-color: #ffffff; }
${iconCSS}`;

fs.writeFileSync(CSS_OUT, css);
console.log(`✅ CSS gerado:    ${CSS_OUT}`);
console.log(`\n📋 Inclua no projeto:\n   <link rel="stylesheet" href="${BASE_URL}/bf-icons.css">\n`);
console.log(`📋 Uso:\n   <i class="bf bf-cerveja bf-lg bf-primary"></i>\n`);
