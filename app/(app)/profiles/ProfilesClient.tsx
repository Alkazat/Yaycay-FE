"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listProfiles } from "@/lib/api/trips";
import { deleteProfile } from "@/lib/api/profiles";
import { ProfileSwitcher } from "@/components/profile/ProfileSwitcher";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { SetPinDialog } from "@/components/profile/SetPinDialog";
import { useActiveProfile } from "@/components/profile/ActiveProfileProvider";
import { MODE_LABEL, MODE_EMOJI, modeForProfile, isParentCarer } from "@/lib/profile/access";
import type { ChildProfile } from "@/lib/contract-mock/types";
import { Avatar, Badge, Button, Card, CardBody } from "@/components/ds";

export function ProfilesClient() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["profiles"],
    queryFn: ({ signal }) => listProfiles(signal),
  });
  const { activeProfileId, setActiveProfileId } = useActiveProfile();

  // `null` = the create form is open; a profile = its edit form; undefined = closed.
  const [formFor, setFormFor] = useState<ChildProfile | null | undefined>(undefined);
  const [pinFor, setPinFor] = useState<ChildProfile | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const remove = useMutation({
    mutationFn: (id: string) => deleteProfile(id),
    onSuccess: () => {
      setConfirmDelete(null);
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
    },
  });

  const profiles = data ?? [];

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

      {/* Management: edit who's in the family, their bands, and parent/carer PINs. */}
      <section className="yc-stack" data-testid="manage-profiles">
        <div
          style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", flexWrap: "wrap" }}
        >
          <h2 style={{ margin: 0 }}>Manage</h2>
          {formFor === undefined ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setFormFor(null)}
              data-testid="add-profile"
            >
              Add a profile
            </Button>
          ) : null}
        </div>

        {formFor !== undefined ? (
          <ProfileForm
            profile={formFor ?? undefined}
            onDone={() => setFormFor(undefined)}
            onCancel={() => setFormFor(undefined)}
          />
        ) : null}

        {profiles.map((p) => (
          <Card key={p.id} variant="soft" data-testid="profile-card">
            <CardBody>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-3)",
                  flexWrap: "wrap",
                }}
              >
                <Avatar name={p.name} size={40} tone="aqua" />
                <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 120 }}>
                  <strong style={{ fontFamily: "var(--font-display)", color: "var(--royal-800)" }}>
                    {p.name}
                  </strong>
                  <span
                    style={{
                      display: "flex",
                      gap: "var(--space-2)",
                      flexWrap: "wrap",
                      alignItems: "center",
                    }}
                  >
                    <Badge tone={isParentCarer(p) ? "ink" : "sun"}>
                      {MODE_EMOJI[modeForProfile(p)]} {MODE_LABEL[modeForProfile(p)]}
                    </Badge>
                    {isParentCarer(p) ? (
                      <Badge tone={p.pin_set ? "meadow" : "soft"}>
                        {p.pin_set ? "PIN set" : "No PIN"}
                      </Badge>
                    ) : null}
                  </span>
                </div>
                <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
                  <Button variant="secondary" size="sm" onClick={() => setFormFor(p)}>
                    Edit
                  </Button>
                  {isParentCarer(p) ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setPinFor(p)}
                      data-testid="set-pin-open"
                    >
                      {p.pin_set ? "Change PIN" : "Set PIN"}
                    </Button>
                  ) : null}
                  {confirmDelete === p.id ? (
                    <>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => remove.mutate(p.id)}
                        disabled={remove.isPending}
                      >
                        {remove.isPending ? "Removing..." : "Confirm"}
                      </Button>
                      <button
                        type="button"
                        className="yc-btn yc-btn--secondary yc-btn--sm"
                        onClick={() => setConfirmDelete(null)}
                      >
                        Keep
                      </button>
                    </>
                  ) : (
                    <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(p.id)}>
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </section>

      {pinFor ? (
        <SetPinDialog
          profileId={pinFor.id}
          profileName={pinFor.name}
          hasPin={!!pinFor.pin_set}
          onDone={() => setPinFor(null)}
          onCancel={() => setPinFor(null)}
        />
      ) : null}
    </div>
  );
}
