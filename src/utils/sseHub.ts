import { Response } from "express";

// Map<userId, Set<Response>> — Set permite múltiplas conexões por user (multi-aba)
const connections = new Map<number, Set<Response>>();

export function register(userId: number, res: Response) {
    if (!connections.has(userId)) {
        connections.set(userId, new Set());
    }
    connections.get(userId)!.add(res);
}

export function unregister(userId: number, res: Response) {
    const set = connections.get(userId);
    if (!set) return;
    set.delete(res);
    if (set.size === 0) {
        connections.delete(userId);
    }
}

export function emit(userId: number, event: string, data: unknown) {
    const set = connections.get(userId);
    if (!set || set.size === 0) return;

    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;

    for (const res of set) {
        res.write(payload);
    }
}
