import { expect, test } from "vitest";
import {
  getImagesFromHTML,
  getURLsFromHTML,
  extractPageData,
} from "./parse_html";

const html_simple =
  '<body><a href="https://www.google.com.au">Google</a></body>';

const html_with_rel =
  '<body><p>Hi there </br> <a href="https://www.google.com.au/">Google</a><a href="/about/info#chapter">Read More</a><a href="#welcome">Welcome</a>';

const base_url = "https://www.boot.dev/";

test("tests simple absolute url", () => {
  expect(getURLsFromHTML(html_simple, base_url)).toContain(
    "https://www.google.com.au",
  );
});

test("tests relative urls", () => {
  const actual = getURLsFromHTML(html_with_rel, base_url);
  console.log(actual);
  expect(actual).toContain("https://www.google.com.au/");
  expect(actual).toContain("https://www.boot.dev/about/info#chapter");
  expect(actual).toContain("https://www.boot.dev/#welcome");
});

test("getImagesFromHTML absolute", () => {
  const inputBody = `<html><body><img src="https://www.google.com.au/logo.png" alt="Logo"></body></html>`;

  const actual = getImagesFromHTML(inputBody, base_url);
  const expected = ["https://www.google.com.au/logo.png"];

  expect(actual).toEqual(expected);
});

test("getImagesFromHTML no image", () => {
  const inputBody = `<html><body><img ></body></html>`;

  const actual = getImagesFromHTML(inputBody, base_url);

  expect(actual).empty;
});

test("getImagesFromHTML relative", () => {
  const inputURL = "https://blog.boot.dev";
  const inputBody = `<html><body><img src="/logo.png" alt="Logo"></body></html>`;

  const actual = getImagesFromHTML(inputBody, inputURL);
  const expected = ["https://blog.boot.dev/logo.png"];

  expect(actual).toEqual(expected);
});

test("extractPageData basic", () => {
  const inputURL = "https://blog.boot.dev";
  const inputBody = `
    <html><body>
      <h1>Test Title</h1>
      <p>This is the first paragraph.</p>
      <a href="/link1">Link 1</a>
      <img src="/image1.jpg" alt="Image 1">
    </body></html>
  `;

  const actual = extractPageData(inputBody, inputURL);
  const expected = {
    url: "https://blog.boot.dev",
    h1: "Test Title",
    first_paragraph: "This is the first paragraph.",
    outgoing_links: ["https://blog.boot.dev/link1"],
    image_urls: ["https://blog.boot.dev/image1.jpg"],
  };

  expect(actual).toEqual(expected);
});
