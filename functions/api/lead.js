const LIMITS = { name: 80, contact: 120, topic: 80, message: 2000 };

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}

function clean(value, max) {
  if (typeof value !== "string") return "";
  return value.replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, max);
}

export async function onRequestPost(context) {
  const request = context.request;
  const env = context.env;
  const type = request.headers.get("content-type") || "";
  if (type.indexOf("application/json") === -1) {
    return json({ ok: false, error: "bad_request" }, 400);
  }

  let body;
  try {
    body = await request.json();
  } catch (error) {
    return json({ ok: false, error: "bad_json" }, 400);
  }
  if (!body || typeof body !== "object") {
    return json({ ok: false, error: "bad_body" }, 400);
  }

  // Honeypot: bots fill the hidden field, humans never see it.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return json({ ok: true });
  }

  const name = clean(body.name, LIMITS.name);
  const contact = clean(body.contact, LIMITS.contact);
  const topic = clean(body.topic, LIMITS.topic) || "Другое";
  const message = clean(body.message, LIMITS.message);
  const token = clean(body.token, 2048);

  if (!name || !contact || body.consent !== true || contact.length < 3) {
    return json({ ok: false, error: "validation" }, 400);
  }

  const secret = env.TURNSTILE_SECRET;
  if (!secret) {
    return json({ ok: false, error: "not_configured" }, 500);
  }

  const form = new URLSearchParams();
  form.set("secret", secret);
  form.set("response", token);
  const ip = request.headers.get("CF-Connecting-IP");
  if (ip) form.set("remoteip", ip);

  let captchaOk = false;
  try {
    const verify = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: form
    });
    const result = await verify.json();
    captchaOk = result.success === true;
  } catch (error) {
    captchaOk = false;
  }
  if (!captchaOk) {
    return json({ ok: false, error: "captcha" }, 400);
  }

  const botToken = env.TELEGRAM_BOT_TOKEN;
  const chatId = env.TELEGRAM_CHAT_ID;
  if (botToken && chatId) {
    const text =
      "Новая заявка China Guide\n" +
      "Имя: " + name + "\n" +
      "Контакт: " + contact + "\n" +
      "Тема: " + topic + "\n" +
      "Комментарий: " + (message || "—");
    try {
      await fetch("https://api.telegram.org/bot" + botToken + "/sendMessage", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text: text, disable_web_page_preview: true })
      });
    } catch (error) {
      // The lead is validated; notification failure should not break the request.
    }
  }

  return json({ ok: true });
}

export async function onRequestGet() {
  return json({ ok: false, error: "method_not_allowed" }, 405);
}
