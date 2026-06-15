#!/usr/bin/env node
/**
 * Beer Fácil Icons — Build Script
 */

const fs   = require("fs");
const path = require("path");

const BASE_URL = process.argv.includes("--base-url")
  ? process.argv[process.argv.indexOf("--base-url") + 1]
  : "https://beer-facil-icons.pages.dev";

const SVGS_DIR = path.join(__dirname, "src/svgs");
const DIST_DIR = path.join(__dirname, "dist");
const SPRITE   = path.join(DIST_DIR, "bf-icons.svg");
const CSS_OUT  = path.join(DIST_DIR, "bf-icons.css");

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
const symbolsData = files.map(file => {
  const id      = path.basename(file, ".svg");
  const content = fs.readFileSync(path.join(SVGS_DIR, file), "utf8");
  const vbMatch = content.match(/viewBox="([^"]+)"/);
  const viewBox = vbMatch ? vbMatch[1] : "0 0 24 24";
  const catMatch = content.match(/<!--\s*categoria:\s*(.+?)\s*-->/i);
  const cat = catMatch ? catMatch[1] : "Geral";
  const inner = content
    .replace(/<\?xml[^>]*\?>/g, "")
    .replace(/<svg[^>]*>/g, "")
    .replace(/<\/svg>/g, "")
    .trim();
  return { id, viewBox, inner, cat };
});

const spriteSymbols = symbolsData.map(({ id, viewBox, inner }) =>
  `  <symbol id="${id}" viewBox="${viewBox}">\n    ${inner}\n  </symbol>`
);

const sprite = `<svg xmlns="http://www.w3.org/2000/svg" style="display:none">\n${spriteSymbols.join("\n\n")}\n</svg>\n`;
fs.writeFileSync(SPRITE, sprite);
console.log(`✅ Sprite gerado: ${SPRITE} (${files.length} ícones)`);

// ── Gera o CSS ───────────────────────────────────────────────
const categories = {};
symbolsData.forEach(({ id, cat }) => {
  if (!categories[cat]) categories[cat] = [];
  categories[cat].push(id);
});

let iconCSS = "";
Object.entries(categories).forEach(([cat, ids]) => {
  iconCSS += `\n/* --- ${cat} --- */\n`;
  ids.forEach(id => {
    iconCSS += `.${id.padEnd(22)}{ --bf-mask: url("${BASE_URL}/bf-icons.svg#${id}"); }\n`;
  });
});

const css = `/*!
 * Beer Fácil Icons v1.0.0
 * Gerado em ${new Date().toISOString().slice(0,10)} — ${files.length} ícones
 * Uso: <link rel="stylesheet" href="${BASE_URL}/bf-icons.css">
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
  width: 100%;
  height: 100%;
  background-color: var(--bf-icon-color);
  -webkit-mask-image: var(--bf-mask);
          mask-image: var(--bf-mask);
  -webkit-mask-repeat: no-repeat;
          mask-repeat: no-repeat;
  -webkit-mask-size: 100% 100%;
          mask-size: 100% 100%;
}

.bf-xs { --bf-icon-size: 0.75rem; }
.bf-sm { --bf-icon-size: 1rem;    }
.bf-md { --bf-icon-size: 1.5rem;  }
.bf-lg { --bf-icon-size: 2rem;    }
.bf-xl { --bf-icon-size: 3rem;    }
.bf-2x { --bf-icon-size: 2em;     }
.bf-3x { --bf-icon-size: 3em;     }
.bf-4x { --bf-icon-size: 4em;     }
.bf-5x { --bf-icon-size: 5em;     }

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

// ── Gera a Demo ──────────────────────────────────────────────
// Agrupa ícones por categoria para a vitrine
const catSections = Object.entries(categories).map(([cat, ids]) => {
  const cards = ids.map(id => `
    <div class="icon-card" onclick="copy('${id}')">
      <i class="bf ${id} bf-xl bf-primary"></i>
      <span class="icon-name">${id}</span>
    </div>`).join("");
  return `
  <div class="section-title">${cat.toUpperCase()}</div>
  <div class="icon-grid">${cards}
  </div>`;
}).join("\n");

// Sprite inline para a demo (sem depender de URL externa)
const spriteInline = `<svg xmlns="http://www.w3.org/2000/svg" style="display:none">\n${spriteSymbols.join("\n\n")}\n</svg>`;

// CSS dos ícones usando referência local (#id) para a demo funcionar
const demoIconCSS = symbolsData.map(({ id }) =>
  `.${id} { --bf-mask: url(#${id}); }`
).join("\n");

const demo = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Beer Fácil Icons — Vitrine</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f1117; color: #e8e8e8; min-height: 100vh; }

    .hero { background: linear-gradient(135deg, #1a0a00, #2d1500, #1a0a00); border-bottom: 1px solid #F5A62330; padding: 3rem 2rem 2rem; text-align: center; }
    .hero h1 { font-size: clamp(2rem,5vw,3.5rem); font-weight: 800; color: #F5A623; }
    .hero h1 span { color: #fff; }
    .hero p { margin-top: .5rem; color: #9a8a7a; font-size: 1rem; }
    .badge { display:inline-block; margin-top:.75rem; padding:.2rem .75rem; background:#F5A62315; border:1px solid #F5A62340; border-radius:999px; font-size:.75rem; color:#F5A623; }

    .install { max-width:860px; margin:2rem auto 0; padding:0 1.5rem; }
    .install-box { background:#0a0a12; border:1px solid #F5A62330; border-radius:10px; padding:1rem 1.25rem; }
    .install-label { font-size:.68rem; text-transform:uppercase; letter-spacing:.1em; color:#F5A623; margin-bottom:.35rem; }
    .install-code { font-family:"SF Mono","Fira Code",monospace; font-size:.82rem; color:#a8d8a8; word-break:break-all; }

    .container { max-width:960px; margin:0 auto; padding:2rem 1.5rem 4rem; }
    .section-title { font-size:.68rem; text-transform:uppercase; letter-spacing:.14em; color:#F5A623; margin:2rem 0 .75rem; padding-bottom:.4rem; border-bottom:1px solid #F5A62320; }
    .icon-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(110px,1fr)); gap:.6rem; }
    .icon-card { background:#1a1a24; border:1px solid #ffffff0a; border-radius:10px; padding:1.1rem .75rem .9rem; display:flex; flex-direction:column; align-items:center; gap:.5rem; cursor:pointer; transition:border-color .15s,background .15s,transform .1s; }
    .icon-card:hover { border-color:#F5A62360; background:#221811; transform:translateY(-2px); }
    .icon-name { font-family:"SF Mono","Fira Code",monospace; font-size:.62rem; color:#7a7a8a; text-align:center; word-break:break-all; }

    .toast { position:fixed; bottom:1.5rem; left:50%; transform:translateX(-50%) translateY(8px); background:#F5A623; color:#1a0a00; font-size:.82rem; font-weight:600; padding:.45rem 1.2rem; border-radius:999px; opacity:0; pointer-events:none; transition:opacity .2s,transform .2s; z-index:999; }
    .toast.show { opacity:1; transform:translateX(-50%) translateY(0); }

    /* ── Icon base ── */
    :root { --bf-icon-size:1em; --bf-icon-color:currentColor; }
    .bf { display:inline-block; width:var(--bf-icon-size); height:var(--bf-icon-size); vertical-align:-0.125em; overflow:hidden; }
    .bf::before { content:""; display:block; width:100%; height:100%; background-color:var(--bf-icon-color); -webkit-mask-image:var(--bf-mask); mask-image:var(--bf-mask); -webkit-mask-repeat:no-repeat; mask-repeat:no-repeat; -webkit-mask-size:100% 100%; mask-size:100% 100%; }
    .bf-xs{--bf-icon-size:.75rem} .bf-sm{--bf-icon-size:1rem} .bf-md{--bf-icon-size:1.5rem} .bf-lg{--bf-icon-size:2rem} .bf-xl{--bf-icon-size:3rem}
    .bf-primary{--bf-icon-color:#F5A623} .bf-success{--bf-icon-color:#198754} .bf-danger{--bf-icon-color:#dc3545} .bf-warning{--bf-icon-color:#ffc107} .bf-info{--bf-icon-color:#0dcaf0} .bf-light{--bf-icon-color:#f8f9fa}
    /* ícones com referência inline */
    ${demoIconCSS}
  </style>
</head>
<body>

${spriteInline}

<header class="hero">
  <h1>🍺 Beer<span>Fácil</span> Icons</h1>
  <p>Biblioteca de ícones SVG. Adicione novos no Cloudflare — todos os projetos atualizam automaticamente.</p>
  <span class="badge">v1.0.0 · ${files.length} ícones</span>
</header>

<div class="install">
  <div class="install-box">
    <div class="install-label">Incluir no projeto — só esta linha</div>
    <code class="install-code">&lt;link rel="stylesheet" href="${BASE_URL}/bf-icons.css"&gt;</code>
  </div>
</div>

<main class="container">
${catSections}
</main>

<div class="toast" id="toast"></div>

<script>
function copy(name) {
  navigator.clipboard.writeText('<i class="bf ' + name + '"></i>').then(() => {
    const t = document.getElementById("toast");
    t.textContent = "✓  " + name + "  copiado!";
    t.classList.add("show");
    setTimeout(() => t.classList.remove("show"), 1800);
  });
}
</script>
</body>
</html>`;

const demoOut = path.join(DIST_DIR, "index.html");
fs.writeFileSync(demoOut, demo);
console.log(`✅ Demo gerada:   ${demoOut}`);
console.log(`\n📋 Acesse: ${BASE_URL}`);
console.log(`📋 CSS:    <link rel="stylesheet" href="${BASE_URL}/bf-icons.css">`);