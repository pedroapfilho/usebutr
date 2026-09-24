/**
 * Shared by the client provider and the Server Component layout. It lives
 * outside the "use client" module because a Server Component importing from
 * one receives a client reference, not the string.
 */
const STORAGE_KEY_PREFIX = "butr-demo";

export { STORAGE_KEY_PREFIX };
