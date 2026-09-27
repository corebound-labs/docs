// Genera PDFs a partir del sitio Docsify de este repo, renderizando las
// páginas reales (con mermaid, prism, etc.) en Chrome headless y uniéndolas
// en un único PDF por colección, en el orden del _sidebar.md correspondiente.
//
// Uso:
//   node generate.mjs --target all|ecotrack|packages [--out <carpeta>]

import http from 'node:http';
import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';
import { PDFDocument } from 'pdf-lib';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');

const TARGETS = {
  ecotrack: {
    sidebar: 'ecotrack/_sidebar.md',
    prefix: '/ecotrack/',
    title: 'Guía de uso — EcoTrack',
    subtitle: 'Manual de la aplicación para usuarios finales',
    outFile: 'EcoTrack-Guia-de-uso.pdf',
  },
  packages: {
    sidebar: 'packages/_sidebar.md',
    prefix: '/packages/',
    title: 'Catálogo de paquetes',
    subtitle: 'Commons.* / UiMetadata.* — librerías reutilizables',
    outFile: 'Catalogo-de-paquetes.pdf',
  },
};

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.md': 'text/plain; charset=utf-8',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.ico': 'image/x-icon',
};

function parseArgs(argv) {
  const args = { target: 'all', out: path.join(__dirname, 'output') };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--target') args.target = argv[++i];
    else if (a.startsWith('--target=')) args.target = a.split('=')[1];
    else if (a === '--out') args.out = path.resolve(argv[++i]);
    else if (a.startsWith('--out=')) args.out = path.resolve(a.split('=')[1]);
  }
  return args;
}

function startServer(rootDir) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
      const filePath = path.join(rootDir, urlPath === '/' ? '/index.html' : urlPath);
      if (!filePath.startsWith(rootDir)) {
        res.writeHead(403);
        res.end();
        return;
      }
      fsSync.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(404);
          res.end('Not found');
          return;
        }
        const ext = path.extname(filePath).toLowerCase();
        res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
        res.end(data);
      });
    });
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

// Extrae, en orden, las rutas de página listadas en un _sidebar.md de Docsify
// que pertenecen a esta colección (ignora "← Inicio" y enlaces cruzados).
async function getOrderedRoutes(sidebarRelPath, prefix) {
  const raw = await fs.readFile(path.join(REPO_ROOT, sidebarRelPath), 'utf8');
  const linkRe = /\[([^\]]+)\]\((\/[^)\s]+)\)/g;
  const routes = [];
  const seen = new Set();
  let m;
  while ((m = linkRe.exec(raw))) {
    const [, text, href] = m;
    if (!href.startsWith(prefix)) continue;
    const route = href.endsWith('.md') ? href.slice(0, -3) : href;
    if (seen.has(route)) continue;
    seen.add(route);
    routes.push({ text: text.trim(), route });
  }
  return routes;
}

function coverHtml(title, subtitle) {
  const fecha = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
  return `<!doctype html>
<html><head><meta charset="utf-8"><style>
  @page { margin: 0; }
  html, body { height: 100%; margin: 0; }
  body {
    font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
    display: flex; flex-direction: column; justify-content: center; align-items: flex-start;
    height: 100vh; padding: 0 72px; box-sizing: border-box;
    background: linear-gradient(160deg, #0f172a 0%, #1e293b 55%, #2563eb 100%);
    color: #fff;
  }
  .kicker { font-size: 14px; letter-spacing: .16em; text-transform: uppercase; opacity: .75; margin-bottom: 18px; }
  h1 { font-size: 42px; line-height: 1.15; margin: 0 0 14px; font-weight: 700; }
  p.subtitle { font-size: 19px; opacity: .9; margin: 0 0 60px; max-width: 520px; }
  .meta { font-size: 13px; opacity: .65; border-top: 1px solid rgba(255,255,255,.25); padding-top: 14px; }
</style></head>
<body>
  <div class="kicker">Corebound Labs · Documentación</div>
  <h1>${title}</h1>
  <p class="subtitle">${subtitle}</p>
  <div class="meta">Generado automáticamente el ${fecha} a partir de la documentación viva del repo <strong>docs</strong>.</div>
</body></html>`;
}

const PRINT_CSS = `
  .sidebar, .app-nav, .sidebar-toggle, #docsify-searchbar, .search { display: none !important; }
  .content { margin-left: 0 !important; max-width: 100% !important; }
  .markdown-section { max-width: 100% !important; padding: 24px 36px !important; }
  body { background: #fff !important; }
  img { max-width: 100% !important; }
  pre, .mermaid { break-inside: avoid; }
  h1, h2 { break-after: avoid; }
`;

async function renderCover(browser, title, subtitle) {
  const page = await browser.newPage();
  await page.setContent(coverHtml(title, subtitle), { waitUntil: 'load' });
  const buf = await page.pdf({ format: 'A4', printBackground: true, margin: { top: 0, bottom: 0, left: 0, right: 0 } });
  await page.close();
  return buf;
}

async function renderRoute(browser, baseUrl, route) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1000, height: 1400 });
  await page.goto(`${baseUrl}/#${route}`, { waitUntil: 'networkidle0', timeout: 60000 });
  await page.waitForSelector('.markdown-section', { timeout: 30000 });
  // Deja tiempo a mermaid/ApexCharts (cargados por CDN) a terminar de renderizar.
  await page.waitForFunction(
    () => !document.querySelector('.markdown-section pre.mermaid, .markdown-section code.mermaid'),
    { timeout: 15000 }
  ).catch(() => {});
  await new Promise((r) => setTimeout(r, 1000));
  await page.addStyleTag({ content: PRINT_CSS });
  const buf = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: '14mm', bottom: '16mm', left: '14mm', right: '14mm' },
  });
  await page.close();
  return buf;
}

async function mergeBuffers(buffers) {
  const merged = await PDFDocument.create();
  for (const buf of buffers) {
    const src = await PDFDocument.load(buf);
    const pages = await merged.copyPages(src, src.getPageIndices());
    pages.forEach((p) => merged.addPage(p));
  }
  return merged.save();
}

async function buildTarget(browser, baseUrl, key, outDir) {
  const cfg = TARGETS[key];
  console.log(`\n[${key}] leyendo ${cfg.sidebar}...`);
  const routes = await getOrderedRoutes(cfg.sidebar, cfg.prefix);
  console.log(`[${key}] ${routes.length} páginas: ${routes.map((r) => r.route).join(', ')}`);

  const buffers = [await renderCover(browser, cfg.title, cfg.subtitle)];
  for (const { route, text } of routes) {
    console.log(`[${key}] renderizando ${route} (${text})...`);
    buffers.push(await renderRoute(browser, baseUrl, route));
  }

  console.log(`[${key}] uniendo ${buffers.length} PDFs...`);
  const merged = await mergeBuffers(buffers);
  const outPath = path.join(outDir, cfg.outFile);
  await fs.writeFile(outPath, merged);
  console.log(`[${key}] listo -> ${outPath}`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const keys = args.target === 'all' ? Object.keys(TARGETS) : [args.target];
  for (const k of keys) {
    if (!TARGETS[k]) throw new Error(`Target desconocido: ${k}. Usa: all, ${Object.keys(TARGETS).join(', ')}`);
  }

  await fs.mkdir(args.out, { recursive: true });

  console.log('Levantando servidor estático del sitio docs...');
  const server = await startServer(REPO_ROOT);
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    for (const key of keys) {
      await buildTarget(browser, baseUrl, key, args.out);
    }
  } finally {
    await browser.close();
    server.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
