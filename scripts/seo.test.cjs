const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { APP_ROUTES, ROOT_DESCRIPTION, SITE_URL } = require('../build-ssr/seo');

test('only the public root is canonical, prerendered and included in the sitemap', () => {
  const html = readFileSync('build/index.html', 'utf8');
  assert.equal((html.match(/rel="canonical"/g) || []).length, 1);
  assert(html.includes(`href="${SITE_URL}/"`));
  assert.match(html, /<h1[^>]*>Builders Advocacy Group<\/h1>/);
  assert(html.includes(ROOT_DESCRIPTION));
  for (const href of ['/mint', '/members', 'https://bittrees.org/', 'https://index.bittrees.org/']) assert(html.includes(`href="${href}"`));
  assert(!html.includes('noindex'));
  assert(!html.includes('Freedom of Expression and Creativity'));
  assert(!html.includes('Best, Jonathan'));
  assert(html.includes('data-insights-site="bittrees-bag-ui"'));
  const sitemap = readFileSync('build/sitemap.xml', 'utf8');
  assert(sitemap.includes('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"'));
  assert.deepEqual([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]), [`${SITE_URL}/`]);
});

test('app routes retain their shell without a root canonical or restricted body', () => {
  const config = JSON.parse(readFileSync('vercel.json', 'utf8'));
  assert.equal(config.framework, null, 'disable the implicit CRA catch-all');
  for (const path of Object.keys(APP_ROUTES)) {
    const destination = `/seo/${path.slice(1)}.html`;
    assert(config.rewrites.some(rule => rule.source === path && rule.destination === destination));
    assert(config.rewrites.some(rule => rule.source === `${path}/` && rule.destination === destination));
    for (const source of [path, `${path}/`]) assert(config.headers.some(rule => rule.source === source && rule.headers.some(header => header.key === 'X-Robots-Tag' && header.value.includes('noindex'))));
    const html = readFileSync(`build${destination}`, 'utf8');
    assert(html.includes('content="noindex,follow"'));
    assert(!html.includes('rel="canonical"'));
    assert(!html.includes('property="og:url"'));
    assert(html.includes('<div id="root"></div>'));
    assert(html.includes('data-insights-site="bittrees-bag-ui"'));
    assert.match(html, /src="\/static\/js\//);
  }
  assert(config.rewrites.some(rule => rule.source === '/administration' && rule.destination === '/api/project-admin'));
  assert(config.rewrites.some(rule => rule.source === '/api/project-admin/:path*' && rule.destination === '/api/project-admin'));
  assert(!config.rewrites.some(rule => rule.destination === '/' || rule.destination === '/index.html'));
  const missing = readFileSync('build/404.html', 'utf8');
  assert(missing.includes('noindex,follow'));
  assert(!missing.includes('rel="canonical"'));
});
