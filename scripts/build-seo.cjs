const { readFileSync, writeFileSync, mkdirSync } = require('node:fs');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { StaticRouter } = require('react-router-dom/server');
const App = require('../build-ssr/App').default;
const { SITE_URL, APP_ROUTES, metadataForPath } = require('../build-ssr/seo');

// The root App is pure presentation. Do not import index.tsx, wallet providers,
// member/document components, API handlers or live data into this renderer.
const template = readFileSync('build/index.html', 'utf8');
const escape = value => value.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function documentFor(path, body = '') {
  const meta = metadataForPath(path);
  const head = [
    `<title>${escape(meta.title)}</title>`,
    ...meta.tags.map(tag => `<meta ${tag.attribute}="${tag.key}" content="${escape(tag.content)}">`),
    ...(meta.canonical ? [`<link rel="canonical" href="${meta.canonical}">`] : []),
  ].join('\n');
  return template
    .replace(/<title>[\s\S]*?<\/title>/i, '')
    .replace(/<meta\s+name="(?:description|robots)"[^>]*>/gi, '')
    .replace('</head>', `${head}</head>`)
    .replace('<div id="root"></div>', `<div id="root">${body}</div>`);
}

const root = renderToStaticMarkup(React.createElement(StaticRouter, { location: '/' }, React.createElement(App)));
mkdirSync('build/seo', { recursive: true });
writeFileSync('build/index.html', documentFor('/', root));
for (const path of Object.keys(APP_ROUTES)) {
  writeFileSync(`build/seo/${path.slice(1)}.html`, documentFor(path));
}
writeFileSync('build/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${SITE_URL}/</loc></url>\n</urlset>\n`);
console.log('Prerendered the public BAG root; four app routes have noindex HTML without a canonical.');
