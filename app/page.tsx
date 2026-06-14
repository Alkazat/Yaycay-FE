import { redirect } from "next/navigation";

/**
 * Root entry. The root domain is the app: signed-in visitors land on their trips
 * home; signed-out visitors are bounced to /auth by the middleware before this
 * runs. (The marketing funnel lives in the Website thread; the public free demo
 * stays at /demo.)
 */
export default function HomePage() {
  redirect("/trips");
}
