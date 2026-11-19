import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { applyPageMetadata } from "./seo";

export default function PageMeta() {
  const { pathname } = useLocation();
  useEffect(() => applyPageMetadata(document, pathname), [pathname]);
  return null;
}
