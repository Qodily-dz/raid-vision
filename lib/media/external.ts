/**
 * Turns a pasted video link into a privacy-friendly embed URL.
 *
 * Only YouTube and Vimeo are embedded. Anything else (a Drive link, a raw file,
 * an unknown host) is left alone so the admin can attach an uploaded file
 * instead — no third-party iframe is created without an explicit intent.
 */
export function toEmbedUrl(url: string | null | undefined): string | null {
  if (!url) return null;

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }

  const host = parsed.hostname.replace(/^www\./, "");

  if (host === "youtube.com" || host === "m.youtube.com") {
    const id = parsed.searchParams.get("v");
    if (id) return `https://www.youtube-nocookie.com/embed/${id}`;
  }

  if (host === "youtu.be") {
    const id = parsed.pathname.slice(1);
    if (id) return `https://www.youtube-nocookie.com/embed/${id}`;
  }

  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const id = (host === "vimeo.com" ? parsed.pathname.slice(1) : parsed.pathname)
      .split("/")
      .filter(Boolean)[0];
    if (id && /^\d+$/.test(id)) return `https://player.vimeo.com/video/${id}`;
  }

  return null;
}
