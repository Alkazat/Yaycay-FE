import { BrandLoading } from "@/components/shell/BrandLoading";

/** Route-level loading for the signed-in app (trips, profiles, account). */
export default function Loading() {
  return <BrandLoading label="Loading…" />;
}
