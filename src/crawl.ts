import { JSDOM } from "jsdom";
import { extractPageData, normalizeURL } from "./parse_html";

export async function getHTML(url: string) {
  const headers = new Headers();
  headers.set("User-Agent", "BootCrawler/1.0");
  let resp;
  try {
    resp = await fetch(url, {
      headers: { "User-Agent": "BootCrawler/1.0" },
    });
  } catch (error) {
    throw new Error(`Network error: ${error}`);
  }
  if (resp.status > 399) {
    console.log(`error fetching url: ${resp.statusText}`);
    return;
  }
  if (!resp.headers.get("content-type")?.includes("text/html")) {
    console.log(
      `expected content to be 'text/html' got '${resp.headers.get("content-type")}'`,
    );
    return;
  }
  return resp.text();
}

export async function crawlPage(
  baseURL: string,
  currentURL: string = baseURL,
  pages: Record<string, number> = {},
) {
  const normedBase = normalizeURL(baseURL);
  const normedCurrent = normalizeURL(currentURL);
  if (!normedCurrent.startsWith(normedBase)) {
    return pages;
  }
  if (currentURL in pages) {
    pages[normedCurrent] += 1;
    return pages;
  }
  pages[normedCurrent] = 1;

  console.log(`Getting '${currentURL}`);
  let html;
  try {
    html = await getHTML(currentURL);
  } catch (error) {
    console.log(`Failed to fetch ${currentURL}: ${error}`);
    return pages;
  }
  if (html == undefined) {
    return pages;
  }
  const page = extractPageData(html, currentURL);
  for (const url of page.image_urls) {
    pages = await crawlPage(baseURL, url, pages);
  }
  return pages;
}
