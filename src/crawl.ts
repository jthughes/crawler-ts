import { JSDOM } from "jsdom";

export function normalizeURL(inputURL: string): string {
  let formattedURL = inputURL;

  if (inputURL.indexOf("://") == -1) {
    formattedURL = `http://${formattedURL}`;
  }

  const url = new URL(formattedURL);

  let normalized = url.host;
  if (url.pathname !== "/") {
    normalized += url.pathname;
  }
  if (normalized.endsWith("/")) {
    normalized = normalized.substring(0, normalized.length - 1);
  }

  return normalized;
}

export function getH1FromHTML(html: string): string {
  const dom = new JSDOM(html);

  const document = dom.window.document;
  const h1El = document.querySelector("h1");
  const textNode = h1El?.firstChild;
  if (textNode != null && textNode != undefined) {
    return textNode.nodeValue || "";
  }
  return "";
}

export function getFirstParagraphFromHTML(html: string): string {
  const dom = new JSDOM(html);

  const document = dom.window.document;
  const mainEl = document.querySelector("main");
  const p = mainEl?.querySelector("p") ?? document.querySelector("p");

  return p?.textContent ?? "";
}
