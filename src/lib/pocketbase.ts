import PocketBase from "pocketbase";

// In production (Coolify), PocketBase is proxied through Next.js at /pb
// In local dev, connect directly to PocketBase
const pbUrl =
  process.env.NEXT_PUBLIC_POCKETBASE_URL || // local dev: http://127.0.0.1:8090
  (typeof window !== "undefined" ? `${window.location.origin}/pb` : "/pb"); // production: same domain

export const pb = new PocketBase(pbUrl);

pb.autoCancellation(false);
