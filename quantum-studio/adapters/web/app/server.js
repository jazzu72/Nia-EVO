"use strict";
const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname);
const WORLD_FILE = path.resolve(__dirname, "../../../worlds/money-munchkins/world.json");
const PORT = 3310;

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".css": "text/css; charset=utf-8"
};

http.createServer((req, res) => {
  const requested = decodeURIComponent(req.url.split("?")[0]);

  if (requested === "/world.json") {
    return fs.readFile(WORLD_FILE, (err, data) => {
      if (err) {
        res.writeHead(500, {"Content-Type": "text/plain; charset=utf-8"});
        return res.end("WORLD_LOAD_FAILED");
      }

      res.writeHead(200, {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store"
      });
      res.end(data);
    });
  }

  const file = path.resolve(ROOT, requested === "/" ? "index.html" : (requested === "/play" ? "play.html" : "." + requested));

  if (!file.startsWith(ROOT)) {
    res.writeHead(403);
    return res.end("FORBIDDEN");
  }

  fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(404);
      return res.end("NOT_FOUND");
    }

    res.writeHead(200, {
      "Content-Type": TYPES[path.extname(file)] || "application/octet-stream",
      "Cache-Control": "no-store"
    });
    res.end(data);
  });
}).listen(PORT, "127.0.0.1", () => {
  console.log(`MONEY MUNCHKINS WEB: http://127.0.0.1:${PORT}`);
  console.log("STATUS: WEB_SERVER_READY");
});
