/**
 * Cross-thread seams that aren't locked yet.
 *
 * The Website thread hands users to /auth or /demo with the email prefilled.
 * The exact query-param name is still to be agreed with that thread (FE handoff,
 * "Handshake with other threads"). Keep it as this single constant so settling
 * on the real name is a one-line change.
 */
export const PREFILL_EMAIL_PARAM = "email";
