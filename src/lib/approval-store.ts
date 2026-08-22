import { getRedis } from '@/lib/redis';
import type { ApprovalType } from '@/lib/telegram';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

type ApprovalEntry = {
    status: ApprovalStatus;
    type: ApprovalType;
    createdAt: number;
};

const TTL_SECONDS = 30 * 60;
const KEY_PREFIX = 'approval:';

const globalForApproval = globalThis as typeof globalThis & {
    __approvalStore?: Map<string, ApprovalEntry>;
};

const memoryStore = globalForApproval.__approvalStore ?? new Map<string, ApprovalEntry>();
globalForApproval.__approvalStore = memoryStore;

function memoryKey(sessionId: string) {
    return `${KEY_PREFIX}${sessionId}`;
}

function cleanupExpiredMemory() {
    const now = Date.now();
    for (const [id, entry] of memoryStore) {
        if (now - entry.createdAt > TTL_SECONDS * 1000) {
            memoryStore.delete(id);
        }
    }
}

async function setEntry(sessionId: string, entry: ApprovalEntry) {
    const redis = getRedis();

    if (redis) {
        await redis.set(memoryKey(sessionId), entry, { ex: TTL_SECONDS });
        return;
    }

    cleanupExpiredMemory();
    memoryStore.set(sessionId, entry);
}

async function getEntry(sessionId: string): Promise<ApprovalEntry | null> {
    const redis = getRedis();

    if (redis) {
        const entry = await redis.get<ApprovalEntry>(memoryKey(sessionId));
        return entry ?? null;
    }

    cleanupExpiredMemory();
    return memoryStore.get(sessionId) ?? null;
}

export async function createApproval(sessionId: string, type: ApprovalType) {
    await setEntry(sessionId, { status: 'pending', type, createdAt: Date.now() });
}

export async function getApproval(sessionId: string): Promise<ApprovalEntry | undefined> {
    const entry = await getEntry(sessionId);
    return entry ?? undefined;
}

export async function setApprovalStatus(sessionId: string, status: Exclude<ApprovalStatus, 'pending'>) {
    const entry = await getEntry(sessionId);
    if (!entry) return false;

    await setEntry(sessionId, { ...entry, status });
    return true;
}
