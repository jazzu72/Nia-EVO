const https = require("https");

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {headers: {"User-Agent": "NIA-Capital-OS/1.0"}}, res => {
      let data = "";
      res.on("data", c => data += c);
      res.on("end", () => resolve({
        statusCode: res.statusCode,
        finalUrl: res.headers.location || url,
        bytes: data.length,
        contentType: res.headers["content-type"] || ""
      }));
    }).on("error", reject);
  });
}

async function checkSource(url) {
  try {
    const r = await fetch(url);
    return {
      url,
      reachable: r.statusCode >= 200 && r.statusCode < 400,
      statusCode: r.statusCode,
      bytes: r.bytes,
      contentType: r.contentType
    };
  } catch (e) {
    return {url, reachable: false, error: e.message};
  }
}

module.exports = { checkSource };
