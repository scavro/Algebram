/* Cliente CDP mínimo sin dependencias (Node ≥22: WebSocket global). */
const { spawn } = require("child_process");
const http = require("http");

const CHROME = "/usr/bin/google-chrome";
const PORT = 9333;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function httpGetJson(url) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, (res) => {
      let buf = "";
      res.on("data", (d) => (buf += d));
      res.on("end", () => {
        try {
          resolve(JSON.parse(buf));
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on("error", reject);
    req.setTimeout(4000, () => req.destroy(new Error("http timeout")));
  });
}

async function launch() {
  const args = [
    CHROME,
    "--headless=new",
    "--disable-gpu",
    "--no-sandbox",
    "--disable-dev-shm-usage",
    "--hide-scrollbars",
    "--force-device-scale-factor=1",
    `--remote-debugging-port=${PORT}`,
    "--user-data-dir=/tmp/user/1000/opencode/cdp-r2-profile",
    "about:blank",
  ];
  const proc = spawn(args[0], args.slice(1), { stdio: ["ignore", "ignore", "pipe"] });
  let stderr = "";
  proc.stderr.on("data", (d) => (stderr += d));
  let list = null;
  for (let i = 0; i < 40; i++) {
    await sleep(250);
    try {
      list = await httpGetJson(`http://127.0.0.1:${PORT}/json/list`);
      if (list && list.find((t) => t.type === "page")) break;
    } catch (e) {
      /* chrome aún arrancando */
    }
  }
  if (!list) throw new Error("Chrome no expone CDP. stderr: " + stderr.slice(-500));
  const target = list.find((t) => t.type === "page");
  return { proc, wsUrl: target.webSocketDebuggerUrl };
}

class CDP {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    this.sessionId = null;
    ws.addEventListener("message", (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) reject(new Error(JSON.stringify(msg.error)));
        else resolve(msg.result);
      }
    });
  }
  static async connect(wsUrl) {
    const ws = new WebSocket(wsUrl);
    await new Promise((res, rej) => {
      ws.addEventListener("open", res, { once: true });
      ws.addEventListener("error", rej, { once: true });
    });
    return new CDP(ws);
  }
  send(method, params) {
    const id = ++this.id;
    const payload = { id, method, params: params || {} };
    if (this.sessionId) payload.sessionId = this.sessionId;
    this.ws.send(JSON.stringify(payload));
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id);
          reject(new Error("CDP timeout: " + method));
        }
      }, 30000);
    });
  }
  async eval(expr, awaitPromise = true) {
    const r = await this.send("Runtime.evaluate", {
      expression: expr,
      awaitPromise,
      returnByValue: true,
      userGesture: true,
    });
    if (r.exceptionDetails) {
      const d = r.exceptionDetails;
      throw new Error("EXC: " + (d.exception && d.exception.description ? d.exception.description.slice(0, 300) : d.text));
    }
    return r.result ? r.result.value : undefined;
  }
  async goto(url, waitMs = 1200) {
    await this.send("Page.enable");
    await this.send("Runtime.enable");
    await this.send("Page.navigate", { url });
    await sleep(waitMs);
    // espera a que el DOM esté completo (reintento ante flakiness)
    for (let i = 0; i < 20; i++) {
      const st = await this.eval("document.readyState").catch(() => "loading");
      if (st === "complete" || st === "interactive") break;
      await sleep(300);
    }
    await sleep(350);
  }
  async shot(path, w, h, full) {
    if (w && h) {
      await this.send("Emulation.setDeviceMetricsOverride", {
        width: w,
        height: h,
        deviceScaleFactor: 1,
        mobile: w < 500,
      });
      await sleep(300);
    }
    const r = await this.send("Page.captureScreenshot", {
      format: "png",
      captureBeyondViewport: !!full,
      ...(full ? { clip: { x: 0, y: 0, scale: 1 } } : {}),
    });
    require("fs").writeFileSync(path, Buffer.from(r.data, "base64"));
  }
  async close() {
    try {
      this.ws.close();
    } catch (e) {}
  }
}

module.exports = { launch, CDP, sleep, PORT };
