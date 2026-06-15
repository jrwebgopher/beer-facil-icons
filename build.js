#!/usr/bin/env node
/**
 * Beer Fácil Icons — Build Script
 * - SVGs individuais em dist/svgs/ (sem display:none)
 * - PNGs em dist/imgs/
 * - Suporte a múltiplas categorias: <!-- categoria: App, Painel Admin -->
 */

const fs   = require("fs");
const path = require("path");

const BASE_URL = process.argv.includes("--base-url")
  ? process.argv[process.argv.indexOf("--base-url") + 1]
  : "https://beer-facil-icons.pages.dev";

const SVGS_DIR  = path.join(__dirname, "src/svgs");
const DIST_DIR  = path.join(__dirname, "dist");
const DIST_SVGS = path.join(DIST_DIR, "svgs");
const DIST_IMGS = path.join(DIST_DIR, "imgs");
const CSS_OUT   = path.join(DIST_DIR, "bf-icons.css");

[DIST_DIR, DIST_SVGS, DIST_IMGS].forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

// ── Lê todos os arquivos ─────────────────────────────────────
const allFiles = fs.readdirSync(SVGS_DIR)
  .filter(f => f.endsWith(".svg") || f.endsWith(".png"))
  .sort();

if (allFiles.length === 0) {
  console.error("Nenhum ícone encontrado em src/svgs/");
  process.exit(1);
}

const svgFiles = allFiles.filter(f => f.endsWith(".svg"));
const pngFiles = allFiles.filter(f => f.endsWith(".png"));

// ── Normaliza SVG ────────────────────────────────────────────
function normalizeSVG(content) {
  const vbMatch = content.match(/viewBox="([^"]+)"/);
  const viewBox = vbMatch ? vbMatch[1] : "0 0 24 24";

  const inner = content
    .replace(/<\?xml[^>]*\?>/g, "")
    .replace(/<!DOCTYPE[^>]*>/g, "")
    .replace(/<svg[^>]*>/g, "")
    .replace(/<\/svg>/g, "")
    .replace(/<clipPath[^>]*>[\s\S]*?<\/clipPath>/g, "")
    .replace(/clip-path="[^"]*"/g, "")
    .replace(/<defs>[\s\S]*?<\/defs>/g, "")
    .replace(/fill="none"/gi, "%%NONE%%")
    .replace(/fill="white"/gi, "%%NONE%%")
    .replace(/fill="[^%][^"]*"/g, 'fill="currentColor"')
    .replace(/stroke="none"/gi, "%%SNONE%%")
    .replace(/stroke="[^%][^"]*"/g, 'stroke="currentColor"')
    .replace(/%%NONE%%/g, 'fill="none"')
    .replace(/%%SNONE%%/g, 'stroke="none"')
    .trim();

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">\n${inner}\n</svg>`;
}

// ── Extrai categorias (suporta múltiplas separadas por vírgula) ──
function getCats(content) {
  const match = content.match(/<!--\s*categoria:\s*(.+?)\s*-->/i);
  if (!match) return ["Geral"];
  return match[1].split(",").map(c => c.trim()).filter(Boolean);
}

// ── Processa SVGs ────────────────────────────────────────────
const svgData = svgFiles.map(file => {
  const id      = path.basename(file, ".svg");
  const content = fs.readFileSync(path.join(SVGS_DIR, file), "utf8");
  const cats    = getCats(content);
  const normalized = normalizeSVG(content);
  fs.writeFileSync(path.join(DIST_SVGS, file), normalized);
  return { id, cats, type: "svg" };
});

// ── Processa PNGs ────────────────────────────────────────────
// Categoria vem do nome do arquivo após "--"
// Exemplos:
//   bf-waving-hand--app.png         → id: bf-waving-hand, cats: ["App"]
//   bf-beer--panel.png              → id: bf-beer,         cats: ["Painel Admin"]
//   bf-fire--app--panel.png         → id: bf-fire,         cats: ["App", "Painel Admin"]
//   bf-emoji.png                    → id: bf-emoji,        cats: ["Geral"]
const CAT_ALIAS = { "app": "App", "panel": "Painel Admin", "painel": "Painel Admin" };

const pngData = pngFiles.map(file => {
  const raw  = path.basename(file, ".png");   // ex: bf-fire--app--panel
  const parts = raw.split("--");
  const id   = parts[0];                      // ex: bf-fire
  const cats = parts.slice(1).length > 0
    ? parts.slice(1).map(p => CAT_ALIAS[p.toLowerCase()] || p)
    : ["Geral"];

  // Copia para dist/imgs/ usando o id limpo (sem --categoria)
  fs.copyFileSync(path.join(SVGS_DIR, file), path.join(DIST_IMGS, id + ".png"));
  return { id, cats, type: "png" };
});

console.log(`📦 SVGs: ${svgFiles.length} | PNGs: ${pngFiles.length}`);

// ── Agrupa por categoria (ícone pode aparecer em várias) ──────
const categories = {};
[...svgData, ...pngData].forEach(({ id, cats, type }) => {
  cats.forEach(cat => {
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push({ id, type });
  });
});

// ── Gera CSS ─────────────────────────────────────────────────
let iconCSS = "\n/* --- Ícones SVG --- */\n";
svgData.forEach(({ id }) => {
  iconCSS += `.${id.padEnd(24)}{ --bf-mask: url("${BASE_URL}/svgs/${id}.svg"); }\n`;
});

iconCSS += "\n/* --- Ícones PNG (cores originais, sem máscara) --- */\n";
pngData.forEach(({ id }) => {
  iconCSS += `.${id} { background-image: url("${BASE_URL}/imgs/${id}.png"); background-size: contain; background-repeat: no-repeat; background-position: center; }\n`;
  iconCSS += `.${id}::before { display: none; }\n`;
});

const css = `/*!
 * Beer Fácil Icons v1.0.0
 * Gerado em ${new Date().toISOString().slice(0,10)} — ${allFiles.length} ícones
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
  -webkit-mask-size: contain;
          mask-size: contain;
  -webkit-mask-position: center;
          mask-position: center;
}

.bf-png::before { display: none; }
.bf-png {
  background-image: var(--bf-png);
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
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
console.log(`✅ CSS gerado: ${CSS_OUT}`);

// ── Gera Demo ────────────────────────────────────────────────
const demoIconCSS = [
  ...svgData.map(({ id }) =>
    `.${id} { --bf-mask: url("${BASE_URL}/svgs/${id}.svg"); }`),
  ...pngData.map(({ id }) => [
    `.${id} { --bf-png: url("${BASE_URL}/imgs/${id}.png"); background-image:var(--bf-png); background-size:contain; background-repeat:no-repeat; background-position:center; }`,
    `.${id}::before { display:none; }`
  ].join("\n"))
].join("\n");

// Ordena categorias: App e Painel Admin primeiro, Geral por último
const catOrder = ["App", "Painel Admin"];
const sortedCats = [
  ...catOrder.filter(c => categories[c]),
  ...Object.keys(categories).filter(c => !catOrder.includes(c))
];

const catSections = sortedCats.map(cat => {
  const icons = categories[cat];
  const cards = icons.map(({ id, type }) => `
    <div class="icon-card" onclick="copy('${id}')">
      <i class="bf ${id} bf-xl${type === "svg" ? " bf-primary" : ""}"></i>
      <span class="icon-name">${id}</span>
      <span class="icon-type">${type.toUpperCase()}</span>
    </div>`).join("");
  return `
  <div class="section-title">${cat.toUpperCase()} <span class="section-count">${icons.length} ícones</span></div>
  <div class="icon-grid">${cards}
  </div>`;
}).join("\n");

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
    .section-title { font-size:.68rem; text-transform:uppercase; letter-spacing:.14em; color:#F5A623; margin:2rem 0 .75rem; padding-bottom:.4rem; border-bottom:1px solid #F5A62320; display:flex; align-items:center; gap:.75rem; }
    .section-count { font-size:.65rem; color:#5a5a6a; font-weight:400; letter-spacing:0; text-transform:none; }
    .icon-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(110px,1fr)); gap:.6rem; }
    .icon-card { background:#1a1a24; border:1px solid #ffffff0a; border-radius:10px; padding:1.1rem .75rem .9rem; display:flex; flex-direction:column; align-items:center; gap:.5rem; cursor:pointer; transition:border-color .15s,background .15s,transform .1s; }
    .icon-card:hover { border-color:#F5A62360; background:#221811; transform:translateY(-2px); }
    .icon-name { font-family:"SF Mono","Fira Code",monospace; font-size:.62rem; color:#7a7a8a; text-align:center; word-break:break-all; }
    .icon-type { font-size:.55rem; padding:.1rem .4rem; border-radius:999px; background:#ffffff10; color:#555; }
    .toast { position:fixed; bottom:1.5rem; left:50%; transform:translateX(-50%) translateY(8px); background:#F5A623; color:#1a0a00; font-size:.82rem; font-weight:600; padding:.45rem 1.2rem; border-radius:999px; opacity:0; pointer-events:none; transition:opacity .2s,transform .2s; z-index:999; }
    .toast.show { opacity:1; transform:translateX(-50%) translateY(0); }
    :root { --bf-icon-size:1em; --bf-icon-color:currentColor; }
    .bf { display:inline-block; width:var(--bf-icon-size); height:var(--bf-icon-size); vertical-align:-0.125em; overflow:hidden; }
    .bf::before { content:""; display:block; width:100%; height:100%; background-color:var(--bf-icon-color); -webkit-mask-image:var(--bf-mask); mask-image:var(--bf-mask); -webkit-mask-repeat:no-repeat; mask-repeat:no-repeat; -webkit-mask-size:contain; mask-size:contain; -webkit-mask-position:center; mask-position:center; }
    .bf-xs{--bf-icon-size:.75rem} .bf-sm{--bf-icon-size:1rem} .bf-md{--bf-icon-size:1.5rem} .bf-lg{--bf-icon-size:2rem} .bf-xl{--bf-icon-size:3rem}
    .bf-primary{--bf-icon-color:#F5A623} .bf-success{--bf-icon-color:#198754} .bf-danger{--bf-icon-color:#dc3545}
    ${demoIconCSS}
  </style>
</head>
<body>
<header class="hero">
  <h1>🍺 Beer<span>Fácil</span> Icons</h1>
  <p>Biblioteca de ícones SVG + PNG. Adicione novos no Cloudflare — todos os projetos atualizam automaticamente.</p>
  <span class="badge">v1.0.0 · ${allFiles.length} ícones</span>
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

fs.writeFileSync(path.join(DIST_DIR, "index.html"), demo);
console.log(`✅ Demo gerada`);
console.log(`\n📋 Vitrine: ${BASE_URL}`);