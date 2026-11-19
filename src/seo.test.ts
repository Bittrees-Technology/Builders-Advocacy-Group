import { applyPageMetadata, APP_ROUTES, SITE_URL } from "./seo";

beforeEach(() => {
  document.head.innerHTML = '<meta name="theme-color" content="#000000"><script src="https://insights.bittrees.org/consent.js" data-insights-site="bittrees-bag-ui"></script>';
});

test("client navigation removes root identity from every app route", () => {
  for (const path of [...Object.keys(APP_ROUTES), "/missing-page"]) {
    applyPageMetadata(document, "/");
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute("href")).toBe(`${SITE_URL}/`);
    applyPageMetadata(document, path);
    expect(document.querySelector('link[rel="canonical"]')).toBeNull();
    expect(document.querySelector('meta[property="og:url"]')).toBeNull();
    expect(document.querySelector('meta[name="robots"]')?.getAttribute("content")).toBe("noindex,follow");
  }
});

test("returning to the root restores one identity and preserves consent", () => {
  applyPageMetadata(document, "/members");
  applyPageMetadata(document, "/");
  applyPageMetadata(document, "/");
  expect(document.querySelectorAll('link[rel="canonical"]')).toHaveLength(1);
  expect(document.querySelectorAll('meta[name="description"]')).toHaveLength(1);
  expect(document.querySelector('meta[name="robots"]')?.getAttribute("content")).toBe("index,follow,max-image-preview:large");
  expect(document.querySelector('script[data-insights-site="bittrees-bag-ui"]')).not.toBeNull();
  expect(document.querySelector('meta[name="theme-color"]')?.getAttribute("content")).toBe("#000000");
});
