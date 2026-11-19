export const SITE_URL = "https://www.buildersadvocacy.org";
export const ROOT_TITLE = "Builders Advocacy Group (BAG)";
// Existing public introduction from MintPage; no new membership promises.
export const ROOT_DESCRIPTION = "Builders Advocacy Group (BAG) is a representative body, unifying and amplifying the experience of Voxels builders.";

export const APP_ROUTES: Record<string, string> = {
  "/members": "Member Services",
  "/mint": "BAG Membership",
  "/visionstatement": "Vision Statement",
  "/billofrights": "Bill of Rights",
};

type MetaTag = { attribute: "name" | "property"; key: string; content: string };
export type PageMetadata = { title: string; canonical?: string; tags: MetaTag[] };

export function metadataForPath(pathname: string): PageMetadata {
  const path = pathname.replace(/\/+$/, "") || "/";
  const isPublicRoot = path === "/";
  const title = isPublicRoot ? ROOT_TITLE : `${APP_ROUTES[path] || "Workspace"} | Builders Advocacy Group`;
  const description = isPublicRoot ? ROOT_DESCRIPTION : "Builders Advocacy Group wallet workspace. Membership and wallet checks apply to the available services and actions.";
  const tags: MetaTag[] = [
    { attribute: "name", key: "description", content: description },
    { attribute: "name", key: "robots", content: isPublicRoot ? "index,follow,max-image-preview:large" : "noindex,follow" },
  ];
  if (isPublicRoot) {
    tags.push(
      { attribute: "property", key: "og:type", content: "website" },
      { attribute: "property", key: "og:site_name", content: "Builders Advocacy Group" },
      { attribute: "property", key: "og:title", content: title },
      { attribute: "property", key: "og:description", content: description },
      { attribute: "property", key: "og:url", content: `${SITE_URL}/` },
      { attribute: "property", key: "og:image", content: `${SITE_URL}/android-chrome-512x512.png` },
      { attribute: "property", key: "og:image:alt", content: "Builders Advocacy Group logo" },
      { attribute: "name", key: "twitter:card", content: "summary" },
      { attribute: "name", key: "twitter:title", content: title },
      { attribute: "name", key: "twitter:description", content: description },
      { attribute: "name", key: "twitter:image", content: `${SITE_URL}/android-chrome-512x512.png` },
      { attribute: "name", key: "twitter:image:alt", content: "Builders Advocacy Group logo" },
    );
  }
  return { title, tags, ...(isPublicRoot ? { canonical: `${SITE_URL}/` } : {}) };
}

export function applyPageMetadata(doc: Document, pathname: string): void {
  const metadata = metadataForPath(pathname);
  doc.title = metadata.title;
  doc.head.querySelectorAll('meta[name="description"],meta[name="robots"],meta[property^="og:"],meta[name^="twitter:"],link[rel="canonical"]')
    .forEach((tag) => tag.remove());
  for (const tag of metadata.tags) {
    const element = doc.createElement("meta");
    element.setAttribute(tag.attribute, tag.key);
    element.setAttribute("content", tag.content);
    doc.head.appendChild(element);
  }
  if (metadata.canonical) {
    const canonical = doc.createElement("link");
    canonical.setAttribute("rel", "canonical");
    canonical.setAttribute("href", metadata.canonical);
    doc.head.appendChild(canonical);
  }
}
