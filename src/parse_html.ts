import { JSDOM } from "jsdom";

function urlToAbsolute(inputURL: string, baseURL: string): string {
  const url = new URL(inputURL, baseURL);

  return url.toString();
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
    try {
      const absoluteURL = new URL(link, baseURL).toString();
      links.push(absoluteURL);
    } catch (error) {
      console.error(`invalid src '${link}':`, error);
    }
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
    try {
      const absoluteURL = new URL(source, baseURL).toString();
      sources.push(absoluteURL);
    } catch (error) {
      console.error(`invalid src '${source}':`, error);
    }
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
  const url = new URL(inputURL);

  let formattedURL = `${url.host}${url.pathname}`;

  if (formattedURL.slice(-1) === "/") {
    formattedURL = formattedURL.slice(0, -1);
  }
  return formattedURL;
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
