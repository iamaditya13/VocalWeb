// Output format: single file — source: website.htmlContent (API: GET /websites/:id → data.data.htmlContent)

/**
 * Convert a display name into a URL/repo-safe slug.
 */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Base64-encode file content safely for Unicode strings.
 * Plain btoa() breaks on non-ASCII characters in generated HTML.
 */
export function encodeFileContent(content: string): string {
  return btoa(unescape(encodeURIComponent(content)));
}

export type DeployStatus =
  | "INITIALIZING"
  | "ANALYZING"
  | "BUILDING"
  | "DEPLOYING"
  | "READY"
  | "ERROR"
  | "CANCELED";

/**
 * Poll a Vercel deployment until it reaches READY or ERROR.
 * Calls onStatusUpdate with the current readyState on each poll.
 * Resolves with the final deployment URL on success.
 * Rejects with an Error on failure or timeout (5 min).
 */
export async function pollVercelDeployment(
  deploymentId: string,
  token: string,
  onStatusUpdate: (status: DeployStatus) => void
): Promise<string> {
  const MAX_POLLS = 100; // 100 × 3s = 5 minutes
  const INTERVAL_MS = 3000;

  for (let i = 0; i < MAX_POLLS; i++) {
    await new Promise((r) => setTimeout(r, INTERVAL_MS));

    const res = await fetch(
      `https://api.vercel.com/v13/deployments/${deploymentId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(
        body?.error?.message || `Polling failed with status ${res.status}`
      );
    }

    const data = await res.json();
    const state: DeployStatus = data.readyState ?? data.status;
    onStatusUpdate(state);

    if (state === "READY") {
      return data.url as string;
    }
    if (state === "ERROR" || state === "CANCELED") {
      throw new Error(
        data.errorMessage || `Deployment ${state.toLowerCase()}`
      );
    }
  }

  throw new Error("Deployment timed out after 5 minutes.");
}
