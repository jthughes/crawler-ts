import { expect, test } from "vitest";
import {
  getFirstParagraphFromHTML,
  getH1FromHTML,
  normalizeURL,
} from "./crawl";

test("https with path and /", () => {
  expect(normalizeURL("https://blog.boot.dev/path/")).toBe(
    "blog.boot.dev/path",
  );
});

test("https with path and no /", () => {
  expect(normalizeURL("https://blog.boot.dev/path")).toBe("blog.boot.dev/path");
});

test("http with path and /", () => {
  expect(normalizeURL("http://blog.boot.dev/path/")).toBe("blog.boot.dev/path");
});

test("https with no path and no /", () => {
  expect(normalizeURL("https://blog.boot.dev")).toBe("blog.boot.dev");
});

test("http with path and no /", () => {
  expect(normalizeURL("http://blog.boot.dev/path")).toBe("blog.boot.dev/path");
});

test("no protocol with path and /", () => {
  expect(normalizeURL("blog.boot.dev/path/")).toBe("blog.boot.dev/path");
});

test("no protocol with path and no /", () => {
  expect(normalizeURL("blog.boot.dev/path")).toBe("blog.boot.dev/path");
});

test("no protocol only host no /", () => {
  expect(normalizeURL("blog.boot.dev")).toBe("blog.boot.dev");
});

test("no protocol only host /", () => {
  expect(normalizeURL("blog.boot.dev/")).toBe("blog.boot.dev");
});

test("no protocol no sub domain only host no /", () => {
  expect(normalizeURL("boot.dev")).toBe("boot.dev");
});

// getH1FromHTML
test("no h1 gets empty string", () => {
  expect(
    getH1FromHTML(
      "<html><head><title>Hello</title></head><body><p>World!</p></html>",
    ),
  ).toBe("");
  expect(getH1FromHTML("<h2>Wrong header</h2>")).toBe("");
});

test("empty string gets empty string", () => {
  expect(getH1FromHTML("")).toBe("");
});

test("one h1 gets h1 contents", () => {
  expect(
    getH1FromHTML(
      "<html><head><title>Hello</title></head><body><h1>Header</h1><p>World!</p></html>",
    ),
  ).toBe("Header");
  expect(getH1FromHTML("<h1>Hello there!</h1>")).toBe("Hello there!");
  expect(getH1FromHTML("<h1>It's a me!</h1><h2>Mario!</h2>")).toBe(
    "It's a me!",
  );
});

test("get first h1 when multiple present", () => {
  expect(getH1FromHTML("<h1>First</h1><h1>Second</h1>")).toBe("First");
  expect(getH1FromHTML("<h1>First</h1><h2>1.1</h2><h1>2.0</h1>"));
});

// getFirstParagraphFromHTML

test("return empty if none found", () => {
  expect(
    getFirstParagraphFromHTML(
      "<head><title>Test</title></head><body><h1>1.0</h1><h2>1.1</h2></body>",
    ),
  ).toBe("");
});

test("single p returned", () => {
  expect(
    getFirstParagraphFromHTML(
      "<html><body><h1>1.0</h1><p>3.1415</p></body></html>",
    ),
  ).toBe("3.1415");
  expect(getFirstParagraphFromHTML("<html><body><p>Hi</p></body></html>")).toBe(
    "Hi",
  );
});

test("First <p> returned when multiple and no main", () => {
  expect(
    getFirstParagraphFromHTML(
      "<html><body><h1>1.0</h1><div><p>First in div</p></div><p>Second out of div</p></body></html>",
    ),
  ).toBe("First in div");
  expect(
    getFirstParagraphFromHTML(
      "<html><body><p>First</p><p>Second</p></body></html>",
    ),
  ).toBe("First");
});

test("First <p> in main returned when multiple and main", () => {
  expect(
    getFirstParagraphFromHTML(
      "<html><body><h1>1.0</h1><div><p>First in div</p></div><main><p>Second out of div</p></main></body></html>",
    ),
  ).toBe("Second out of div");
  expect(
    getFirstParagraphFromHTML(
      "<html><body><main><p>First</p></main><p>Second</p></body></html>",
    ),
  ).toBe("First");
});
