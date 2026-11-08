const http = require("http");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const port = Number(process.env.PORT || 4173);
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".ico": "image/x-icon"
};

function sendFile(res, file) {
  fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      res.end("404 — not found");
      return;
    }
    res.writeHead(200, {
      "content-type": types[path.extname(file).toLowerCase()] || "application/octet-stream",
      "cache-control": "no-cache"
    });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
  let relative = urlPath;
  if (relative === "/" || relative === "") relative = "/index.html";
  if (relative.endsWith("/")) relative += "index.html";

  const safe = path.normalize(relative).replace(/^(\.\.[\/\\])+/, "");
  const file = path.join(root, safe);

  fs.readFile(file, (err) => {
    if (!err) {
      sendFile(res, file);
      return;
    }
    if (!path.extname(file)) {
      sendFile(res, file + ".html");
      return;
    }
    sendFile(res, file);
  });
});

server.listen(port, "127.0.0.1", () => {
  console.log("China Guide preview: http://127.0.0.1:" + port + "/");
});
