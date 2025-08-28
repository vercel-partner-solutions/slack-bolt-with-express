// utils.ts
import type { Request as ExpressRequest, Response as ExpressResponse } from "express";

export async function toFetchRequest(req: ExpressRequest): Promise<Request> {
    const rawBody: Buffer = await new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        req.on("data", (c) => chunks.push(c));
        req.on("end", () => resolve(Buffer.concat(chunks)));
        req.on("error", reject);
    });

    const headers = new Headers();
    for (const [k, v] of Object.entries(req.headers)) {
        if (Array.isArray(v)) v.forEach((vv) => headers.append(k, vv));
        else if (v != null) headers.set(k, String(v));
    }

    const proto = req.headers["x-forwarded-proto"]?.toString().split(",")[0] || "http";
    const host = req.headers.host || "localhost";
    const url = `${proto}://${host}${(req as any).originalUrl || req.url}`;

    return new Request(url, {
        method: req.method,
        headers,
        body: rawBody.length ? rawBody : null,
    });
}

export async function sendFetchResponse(res: ExpressResponse, fetchRes: Response) {
    res.status(fetchRes.status);
    fetchRes.headers.forEach((v, k) => res.setHeader(k, v));
    const ab = await fetchRes.arrayBuffer();
    if (ab.byteLength === 0) return res.end();
    return res.send(Buffer.from(ab));
}
