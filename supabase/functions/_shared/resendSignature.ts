export async function validResendSignature(
  req: Request,
  raw: string,
  secret: string,
) {
  try {
    const id = req.headers.get("svix-id");
    const timestamp = req.headers.get("svix-timestamp");
    if (
      !id ||
      !timestamp ||
      !/^\d+$/.test(timestamp) ||
      Math.abs(Date.now() / 1000 - Number(timestamp)) > 300 ||
      !secret.startsWith("whsec_")
    )
      return false;
    const bytes = Uint8Array.from(atob(secret.slice(6)), (c) =>
      c.charCodeAt(0),
    );
    const key = await crypto.subtle.importKey(
      "raw",
      bytes,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"],
    );
    const message = new TextEncoder().encode(`${id}.${timestamp}.${raw}`);
    for (const entry of (req.headers.get("svix-signature") || "").split(" ")) {
      const [version, sig] = entry.split(",");
      if (version !== "v1" || !sig) continue;
      if (
        await crypto.subtle.verify(
          "HMAC",
          key,
          Uint8Array.from(atob(sig), (c) => c.charCodeAt(0)),
          message,
        )
      )
        return true;
    }
    return false;
  } catch {
    return false;
  }
}
