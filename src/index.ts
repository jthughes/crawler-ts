import { argv } from "node:process";
import { crawlSiteAsync } from "./crawl";

async function main() {
  const args = argv.slice(2);
  if (args.length != 3) {
    console.log("wrong number of arguments");
    console.log(`usage: npm run start <base_url> <maxConcurrency> <maxPages>`);
    process.exit(1);
  }
  const [base_url, maxConcurrencyStr, maxPagesStr] = args;
  const maxConcurrency = Number(maxConcurrencyStr);
  const maxPages = Number(maxPagesStr);

  if (!Number.isFinite(maxConcurrency) || maxConcurrency <= 0) {
    console.log("invalid maxConcurrency");
    process.exit(1);
  }

  if (!Number.isFinite(maxPages) || maxPages <= 0) {
    console.log("invalid maxPages");
    process.exit(1);
  }

  console.log(`Starting to crawl '${base_url}'...`);
  const timer = "Crawl";
  console.time(timer);
  const pages = await crawlSiteAsync(base_url, maxPages, maxConcurrency);
  console.timeEnd(timer);
  console.log(pages);
  console.timeLog(timer);
  process.exit(0);
}

main();
