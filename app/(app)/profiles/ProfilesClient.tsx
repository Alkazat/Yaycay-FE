"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listProfiles } from "@/lib/api/trips";
import { deleteProfile } from "@/lib/api/profiles";
import { ProfileSwitcher } from "@/components/profile/ProfileSwitcher";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { SetPinDialog } from "@/components/profile/SetPinDialog";
import { ExplorerLoginDialog } from "@/components/profile/ExplorerLoginDialog";
import { Modal } from "@/components/ui/Modal";
import { useActiveProfile } from "@/components/profile/ActiveProfileProvider";
import { MODE_LABEL, MODE_AGES, MODE_EMOJI, modeForProfile, isParentCarer, isChild } from "@/lib/profile/access";
import type { ChildProfile, ProfileType } from "@/lib/contract-mock/types";
import { Avatar, Badge, Button, Card, CardBody } from "@/components/ds";

export function ProfilesClient() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["profiles"],
    queryFn: ({ signal }) => listProfiles(signal),
  });
  const { activeProfileId, setActiveProfileId } = useActiveProfile();

  const [createType, setCreateType] = useState<ProfileType | null>(null);
  const [editProfile, setEditProfile] = useState<ChildProfile | null>(null);
  const [pinFor, setPinFor] = useState<ChildProfile | null>(null);
  const [loginFor, setLoginFor] = useState<ChildProfile | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const remove = useMutation({
    mutationFn: (id: string) => deleteProfile(id),
    onSuccess: () => {
      setConfirmDelete(null);
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
    },
  });

  const profiles = data ?? [];
  const explorers = profiles.filter(isChild);
  const grownups = profiles.filter(isParentCarer);

  function UserCard({ p }: { p: ChildProfile }) {
    const mode = modeForProfile(p);
    return (
      <Card variant="soft" data-testid="profile-card">
        <CardBody>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", flexWrap: "wrap" }}>
            {p.avatar ? (
              <span
                aria-hidden
                style={{
                  fontSize: 24,
                  width: 40,
                  height: 40,
                  display: "grid",
                  placeItems: "center",
                  borderRadius: "50%",
                  background: "var(--sky-50)",
                }}
              >
                {p.avatar}
              </span>
            ) : (
              <Avatar name={p.name} size={40} tone="aqua" />
            )}
            <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 110 }}>
              <strong style={{ fontFamily: "var(--font-display)", color: "var(--royal-800)" }}>{p.name}</strong>
              <span style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap", alignItems: "center" }}>
                <Badge tone={isParentCarer(p) ? "ink" : "sun"}>
                  {MODE_EMOJI[mode]} {MODE_LABEL[mode]}
                </Badge>
                <span style={{ color: "var(--text-muted)", fontWeight: 700, fontSize: "var(--fs-sm)" }}>
                  {p.age != null ? `Age ${p.age}` : MODE_AGES[mode]}
                </span>
                {isParentCarer(p) ? (
                  <Badge tone={p.pin_set ? "meadow" : "soft"}>{p.pin_set ? "PIN set" : "No PIN"}</Badge>
                ) : null}
              </span>
            </div>
          </div>
          <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap", marginTop: "var(--space-3)" }}>
            <Button variant="secondary" size="sm" onClick={() => setEditProfile(p)}>
              Edit
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setLoginFor(p)} data-testid="explorer-login-open">
              Login
            </Button>
            {isParentCarer(p) ? (
              <Button variant="secondary" size="sm" onClick={() => setPinFor(p)} data-testid="set-pin-open">
                {p.pin_set ? "Change PIN" : "Set PIN"}
              </Button>
            ) : null}
            {confirmDelete === p.id ? (
              <>
                <Button variant="danger" size="sm" onClick={() => remove.mutate(p.id)} disabled={remove.isPending}>
                  {remove.isPending ? "Removing..." : "Confirm"}
                </Button>
                <button type="button" className="yc-btn yc-btn--secondary yc-btn--sm" onClick={() => setConfirmDelete(null)}>
                  Keep
                </button>
              </>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(p.id)}>
                Delete
              </Button>
            )}
          </div>
        </CardBody>
      </Card>
    );
  }

  function Column({ title, type, list, addLabel }: { title: string; type: ProfileType; list: ChildProfile[]; addLabel: string }) {
    // Subtle, distinct tint per column: explorers warm (sun), grown-ups cool (sky).
    const child = type === "child";
    return (
      <section
        className="yc-stack"
        data-testid={`column-${type}`}
        style={{
          gap: "var(--space-3)",
          padding: "var(--space-4)",
          borderRadius: "var(--radius-lg, 16px)",
          background: child ? "var(--sun-50, #fff7e6)" : "var(--sky-50, #f0f7ff)",
          borderTop: `4px solid ${child ? "var(--sun-400, #f5b73d)" : "var(--sky-500, #2f86d8)"}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--space-3)" }}>
          <h2 style={{ margin: 0, color: child ? "var(--sun-700, #9a6a00)" : "var(--royal-700)" }}>
            {child ? "🧭 " : "🛡️ "}
            {title}
          </h2>
          <Button variant="secondary" size="sm" onClick={() => setCreateType(type)} data-testid={`add-${type}`}>
            {addLabel}
          </Button>
        </div>
        {list.length === 0 ? (
          <p style={{ margin: 0, color: "var(--text-muted)", fontWeight: 700 }}>None yet.</p>
        ) : (
          list.map((p) => <UserCard key={p.id} p={p} />)
        )}
      </section>
    );
  }

  return (
    <div className="yc-stack" data-testid="profiles">
      <header>
        <h1 style={{ margin: 0 }}>Your family</h1>
        <p style={{ margin: 0, color: "var(--text-muted)", fontWeight: 700 }}>
          Explorers get their own adventures; grown-ups get the PIN-gated command centre.
        </p>
      </header>

      {isLoading ? <p>Loading your family...</p> : null}
      {isError ? (
        <Card variant="soft">
          <CardBody>
            <p style={{ margin: 0, color: "var(--coral-500)", fontWeight: 700 }}>
              We couldn&apos;t load your family. Give it another go?
            </p>
          </CardBody>
        </Card>
      ) : null}

      {data ? (
        <ProfileSwitcher profiles={data} activeId={activeProfileId ?? data[0]?.id ?? null} onSelect={setActiveProfileId} />
      ) : null}

      {data ? (
        <div className="yc-grid-5050" data-testid="users-library">
          <Column title="Explorers" type="child" list={explorers} addLabel="Add explorer" />
          <Column title="Grown-ups" type="parent_carer" list={grownups} addLabel="Add grown-up" />
        </div>
      ) : null}

      {createType ? (
        <Modal title={createType === "child" ? "Add explorer" : "Add grown-up"} onClose={() => setCreateType(null)}>
          <ProfileForm lockedType={createType} onDone={() => setCreateType(null)} onCancel={() => setCreateType(null)} />
        </Modal>
      ) : null}

      {editProfile ? (
        <Modal title={`Edit ${editProfile.name}`} onClose={() => setEditProfile(null)}>
          <ProfileForm profile={editProfile} onDone={() => setEditProfile(null)} onCancel={() => setEditProfile(null)} />
        </Modal>
      ) : null}

      {pinFor ? (
        <SetPinDialog
          profileId={pinFor.id}
          profileName={pinFor.name}
          hasPin={!!pinFor.pin_set}
          onDone={() => setPinFor(null)}
          onCancel={() => setPinFor(null)}
        />
      ) : null}

      {loginFor ? (
        <ExplorerLoginDialog
          profileId={loginFor.id}
          profileName={loginFor.name}
          onClose={() => setLoginFor(null)}
        />
      ) : null}
    </div>
  );
}
