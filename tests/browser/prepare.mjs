import { readFile, writeFile, mkdir, copyFile } from "node:fs/promises";
const target = new URL("../../out/__qa/", import.meta.url);
await mkdir(target, { recursive: true });
const html = await readFile(new URL("../../out/index.html", import.meta.url), "utf8");
await writeFile(new URL("index.html", target), html.replace("<head>", '<head><script src="/__qa/init.js"></script>'));
await copyFile(new URL("init.js", import.meta.url), new URL("init.js", target));
console.log("QA fixture prepared: /__qa/?qa=normal (local testing only; never deploy this directory)");
