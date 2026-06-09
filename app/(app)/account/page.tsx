import type { Metadata } from "next";
import { AccountClient } from "./AccountClient";

export const metadata: Metadata = {
  title: "Account - Yaycay",
};

/** /account - plan, data-keep, settings. */
export default function AccountPage() {
  return <AccountClient />;
}
