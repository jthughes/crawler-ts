import { JSDOM } from "jsdom";
import { getFirstParagraphFromHTML, getH1FromHTML } from "./crawl";

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
