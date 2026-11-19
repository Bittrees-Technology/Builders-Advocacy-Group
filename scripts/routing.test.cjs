const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync, readdirSync } = require('node:fs');
const config = JSON.parse(readFileSync(new URL('../vercel.json', `file://${__filename}`), 'utf8'));
const guard = config.routes.find(route => route.status === 404);
const matches = path => new RegExp(guard.src).test(new URL(path, 'https://www.buildersadvocacy.org').pathname);

test('unknown extensionless URLs cannot receive the indexable homepage', () => {
  assert.equal(guard.dest, '/404.html');
  assert.match(guard.headers['X-Robots-Tag'], /noindex/);
  for (const path of ['/missing-seo-check-20261119', '/missing?from=seo', '/missing/', '/missing/nested', '/members/private', '/membership', '/visionstatement/draft']) {
    assert.equal(matches(path), true, path);
  }
});

test('the 404 guard preserves declared app routes, APIs, redirects and static files', () => {
  const appPaths = ['/members', '/mint', '/visionstatement', '/billofrights'];
  const existingPaths = ['/', '/index.html', '/sitemap.xml', '/administration', '/administration/', '/api/project-admin', '/api/project-admin/session', '/api/shared-roles-health', '/static/js/main.test.js', '/static/css/main.test.css', '/seo/members.html'];
  const publicPaths = readdirSync(new URL('../public/', `file://${__filename}`), { recursive: true, withFileTypes: true })
    .filter(entry => entry.isFile())
    .map(entry => '/' + entry.name);
  for (const path of [...existingPaths, ...publicPaths, ...appPaths.flatMap(path => [path, path + '/', path + '?from=seo'])]) {
    assert.equal(matches(path), false, path);
  }
  for (const path of appPaths) {
    assert(config.rewrites.some(rule => rule.source === path && rule.destination === `/seo${path}.html`));
  }
  assert(config.rewrites.some(rule => rule.source === '/administration' && rule.destination === '/api/project-admin'));
  assert(config.rewrites.some(rule => rule.source === '/api/project-admin/:path*' && rule.destination === '/api/project-admin'));
});
