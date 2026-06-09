"use client";

import { useQuery } from "@tanstack/react-query";
import { listProfiles } from "@/lib/api/trips";
import { ProfileSwitcher } from "@/components/profile/ProfileSwitcher";
import { useActiveProfile } from "@/components/profile/ActiveProfileProvider";
import { Card, CardBody } from "@/components/ds";

export function ProfilesClient() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["profiles"],
    queryFn: ({ signal }) => listProfiles(signal),
  });
  const { activeProfileId, setActiveProfileId } = useActiveProfile();

  return (
    <div className="yc-stack">
      <header>
        <h1>Explorers</h1>
        <p style={{ color: "var(--text-muted)", fontWeight: 700 }}>
          Pick who is exploring. Their adventures change to suit them.
        </p>
      </header>

      {isLoading ? <p>Loading explorers...</p> : null}
      {isError ? (
        <Card variant="soft">
          <CardBody>
            <p style={{ margin: 0, color: "var(--coral-500)", fontWeight: 700 }}>
              We couldn&apos;t load your explorers. Give it another go?
            </p>
          </CardBody>
        </Card>
      ) : null}

      {data ? (
        <ProfileSwitcher
          profiles={data}
          activeId={activeProfileId ?? data[0]?.id ?? null}
          onSelect={setActiveProfileId}
        />
      ) : null}

      <Card variant="soft">
        <CardBody>
          <p style={{ margin: 0, color: "var(--text-muted)", fontWeight: 700 }}>
            Adding, editing and avatars for explorers arrive next.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
