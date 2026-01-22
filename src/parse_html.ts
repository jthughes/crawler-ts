import { JSDOM } from "jsdom";

function urlToAbsolute(inputURL: string, baseURL: string): string {
  if (inputURL.includes("://")) {
    return inputURL;
  }
  const baseNoTrail = baseURL.endsWith("/") ? baseURL.slice(0, -1) : baseURL;

  return baseNoTrail + (inputURL.startsWith("/") ? inputURL : "/" + inputURL);
}

export function getURLsFromHTML(html: string, baseURL: string): string[] {
  const dom = new JSDOM(html);

  const document = dom.window.document;
  const anchors = document.querySelectorAll("a");

  const links = [];

  for (const anchor of anchors) {
    const link = anchor.getAttribute("href");
    if (link === null) {
      continue;
    }
    links.push(urlToAbsolute(link, baseURL));
  }
  return links;
}

export function getImagesFromHTML(html: string, baseURL: string): string[] {
  const dom = new JSDOM(html);

  const document = dom.window.document;
  const images = document.querySelectorAll("img");

  const sources = [];
  for (const image of images) {
    const source = image.getAttribute("src");
    if (source === null) {
      continue;
    }
    sources.push(urlToAbsolute(source, baseURL));
  }
  return sources;
}

export type ExtractedPageData = {
  url: string;
  h1: string;
  first_paragraph: string;
  outgoing_links: string[];
  image_urls: string[];
};

export function extractPageData(
  html: string,
  pageURL: string,
): ExtractedPageData {
  return {
    url: pageURL,
    h1: getH1FromHTML(html),
    first_paragraph: getFirstParagraphFromHTML(html),
    outgoing_links: getURLsFromHTML(html, pageURL),
    image_urls: getImagesFromHTML(html, pageURL),
  };
}

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
