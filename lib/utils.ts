// utils.ts
import type { Request as ExpressRequest } from "express";

/**
 * Convert an Express Request into a standard Fetch API Request.
 * Useful when calling libraries that expect WHATWG Fetch-style requests.
 */
export async function toFetchRequest(req: ExpressRequest): Promise<Request> {
    // Collect raw body (without using body-parsers that consume the stream).
    const rawBody: Buffer = await new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        req.on("data", (c) => chunks.push(c));
        req.on("end", () => resolve(Buffer.concat(chunks)));
        req.on("error", reject);
    });

    // Copy headers into a Fetch Headers object
    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
        if (Array.isArray(value)) {
            value.forEach((v) => headers.append(key, v));
        } else if (value !== undefined) {
            headers.set(key, String(value));
        }
    }

    // Build an absolute URL for the Fetch Request
    const proto =
        req.headers["x-forwarded-proto"]?.toString().split(",")[0] || "http";
    const host = req.headers.host || "localhost";
    const url = `${proto}://${host}${req.originalUrl || req.url}`;

    return new Request(url, {
        method: req.method,
        headers,
        body: rawBody.length > 0 ? rawBody : null,
    });
}
