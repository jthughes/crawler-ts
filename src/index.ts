import { argv, argv0 } from "node:process";
import { crawlPage, getHTML } from "./crawl";

async function main() {
  const args = argv.slice(2);
  if (args.length != 1) {
    console.log("wrong number of arguments");
    console.log(`usage: npm run start <base_url>`);
    process.exit(1);
  }
  console.log(`Starting to crawl '${args[0]}'...`);
  const pages = await crawlPage(args[0]);
  console.log(pages);
  process.exit(0);
}

main();
