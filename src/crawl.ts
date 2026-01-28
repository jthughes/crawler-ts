import { getURLsFromHTML, normalizeURL } from "./parse_html";

import pLimit, { LimitFunction } from "p-limit";

export class ConcurrentCrawler {
  baseURL: string;
  pages: Record<string, number>;
  concurrencyLimit: LimitFunction;
  maxPages: number;

  shouldStop = false;
  allTasks = new Set<Promise<void>>();
  abortController = new AbortController();

  constructor(baseURL: string, maxPages: number, concurrencyLimit: number = 5) {
    this.baseURL = baseURL;
    this.pages = {};
    this.concurrencyLimit = pLimit(concurrencyLimit);
    this.maxPages = Math.max(1, maxPages);
  }

  /// returns true if first visit
  private addPageVisit(normalizedURL: string): boolean {
    if (this.shouldStop) {
      return false;
    }
    if (Object.keys(this.pages).length >= this.maxPages) {
      this.shouldStop = true;
      console.log("Reached maximum number of pages to crawl.");
      this.abortController.abort();
      return false;
    }
    if (normalizedURL in this.pages) {
      this.pages[normalizedURL] += 1;
      return false;
    }
    this.pages[normalizedURL] = 1;
    return true;
  }

  private async getHTML(currentURL: string): Promise<string> {
    const { signal } = this.abortController;

    return await this.concurrencyLimit(async () => {
      let resp;
      try {
        resp = await fetch(currentURL, {
          headers: { "User-Agent": "BootCrawler/1.0" },
          signal,
        });
      } catch (error) {
        if ((error as any)?.name === "AbortError") {
          throw new Error("Fetch aborted");
        }
        throw new Error(`Network error: ${(error as Error).message}`);
      }
      if (resp.status > 399) {
        throw new Error(`HTTP error: ${resp.status} ${resp.statusText}`);
      }

      const contentType = resp.headers.get("content-type");
      if (!contentType || !contentType.includes("text/html")) {
        throw new Error(`Got non-HTML respons: ${contentType}`);
      }
      return resp.text();
    });
  }

  private async crawlPage(currentURL: string): Promise<void> {
    if (this.shouldStop) return;
    const currentURLObj = new URL(currentURL);
    const baseURLObj = new URL(this.baseURL);
    if (currentURLObj.hostname !== baseURLObj.hostname) {
      return;
    }
    const normedCurrent = normalizeURL(currentURL);
    const firstVisit = this.addPageVisit(normedCurrent);
    if (!firstVisit) {
      return;
    }
    let html;
    try {
      html = await this.getHTML(currentURL);
    } catch (error) {
      console.log(`Failed to fetch ${currentURL}: ${(error as Error).message}`);
      return;
    }
    if (html == undefined) return;
    if (this.shouldStop) return;

    const urls = getURLsFromHTML(html, this.baseURL);

    const promises: Promise<void>[] = [];
    for (const url of urls) {
      if (this.shouldStop) break;

      const task = this.crawlPage(url);
      this.allTasks.add(task);
      task.finally(() => this.allTasks.delete(task));
      promises.push(task);
    }

    await Promise.all(promises);
  }

  public async crawl(): Promise<Record<string, number>> {
    const rootTask = this.crawlPage(this.baseURL);
    this.allTasks.add(rootTask);
    try {
      await rootTask;
    } finally {
      this.allTasks.delete(rootTask);
    }
    await Promise.allSettled(Array.from(this.allTasks));
    return this.pages;
  }
}

export async function crawlSiteAsync(
  baseURL: string,
  maxPages: number,
  concurrencyLimit: number = 5,
): Promise<Record<string, number>> {
  const crawler = new ConcurrentCrawler(baseURL, maxPages, concurrencyLimit);
  const pages = await crawler.crawl();
  return pages;
}
