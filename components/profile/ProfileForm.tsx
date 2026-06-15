"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createProfile, updateProfile } from "@/lib/api/profiles";
import type {
  ChildProfile,
  ChildProfileInput,
  ExplorerMode,
  ProfileType,
} from "@/lib/contract-mock/types";
import { MODE_LABEL, MODE_AGES, MODE_EMOJI, AVATAR_EMOJIS } from "@/lib/profile/access";
import { Button, Input } from "@/components/ds";

/** The three child age bands (the parent/carer voice `standard` is set automatically). */
const CHILD_BANDS: ExplorerMode[] = ["little", "explorer", "explorer_plus"];

interface ProfileFormProps {
  /** Existing profile to edit; omit to create a new one. */
  profile?: ChildProfile;
  /** When set, the type is fixed (the column it was opened from) and not shown. */
  lockedType?: ProfileType;
  onDone: () => void;
  onCancel: () => void;
}

/**
 * Create / edit a profile, rendered inside a modal. A child picks an avatar emoji
 * and an age band; a parent/carer uses the Grown Ups voice (PIN managed separately).
 */
export function ProfileForm({ profile, lockedType, onDone, onCancel }: ProfileFormProps) {
  const editing = !!profile;
  const queryClient = useQueryClient();

  const [name, setName] = useState(profile?.name ?? "");
  const [age, setAge] = useState(profile?.age != null ? String(profile.age) : "");
  const [avatar, setAvatar] = useState(profile?.avatar ?? "");
  const [type] = useState<ProfileType>(lockedType ?? profile?.type ?? "child");
  const [band, setBand] = useState<ExplorerMode>(
    profile?.type === "child" && profile.mode ? profile.mode : "explorer",
  );

  const isChild = type === "child";
  const mode: ExplorerMode = isChild ? band : "standard";

  const save = useMutation({
    mutationFn: () => {
      const input: ChildProfileInput = {
        name: name.trim(),
        age: age.trim() ? Number(age) : null,
        avatar: avatar || null,
        type,
        mode,
      };
      return editing ? updateProfile(profile.id, input) : createProfile(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      onDone();
    },
  });

  const canSave = name.trim().length > 0 && !save.isPending;

  return (
    <form
      className="yc-stack"
      style={{ gap: "var(--space-3)" }}
      data-testid="profile-form"
      onSubmit={(e) => {
        e.preventDefault();
        if (canSave) save.mutate();
      }}
    >
      <Input
        label="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        data-testid="profile-name"
        autoFocus
      />

      {/* Emoji avatar picker. */}
      <div>
        <span style={{ fontWeight: 800, display: "block", marginBottom: 6 }}>Pick an avatar</span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {AVATAR_EMOJIS.map((e) => (
            <button
              key={e}
              type="button"
              aria-label={`Avatar ${e}`}
              aria-pressed={avatar === e}
              onClick={() => setAvatar(avatar === e ? "" : e)}
              style={{
                fontSize: 22,
                lineHeight: 1,
                width: 40,
                height: 40,
                borderRadius: "var(--radius-md, 10px)",
                cursor: "pointer",
                border:
                  avatar === e ? "2.5px solid var(--sky-500)" : "2px solid var(--sand-200, #e7e2d8)",
                background: avatar === e ? "var(--sky-50)" : "var(--surface, #fff)",
              }}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      <Input
        label="Age"
        type="number"
        inputMode="numeric"
        min={0}
        max={120}
        value={age}
        onChange={(e) => setAge(e.target.value)}
      />

      {isChild ? (
        <div>
          <span style={{ fontWeight: 800, display: "block", marginBottom: 6 }}>Explorer band</span>
          <div className="yc-stack" style={{ gap: 6 }}>
            {CHILD_BANDS.map((b) => (
              <button
                key={b}
                type="button"
                aria-pressed={band === b}
                onClick={() => setBand(b)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-2)",
                  textAlign: "left",
                  padding: "var(--space-2) var(--space-3)",
                  borderRadius: "var(--radius-md, 10px)",
                  cursor: "pointer",
                  border:
                    band === b ? "2.5px solid var(--sky-500)" : "2px solid var(--sand-200, #e7e2d8)",
                  background: band === b ? "var(--sky-50)" : "var(--surface, #fff)",
                }}
              >
                <span style={{ fontSize: 20 }}>{MODE_EMOJI[b]}</span>
                <span style={{ fontWeight: 800 }}>{MODE_LABEL[b]}</span>
                <span style={{ color: "var(--text-muted)", fontWeight: 700, fontSize: "var(--fs-sm)" }}>
                  {MODE_AGES[b]}
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <p style={{ margin: 0, color: "var(--text-muted)", fontWeight: 700 }}>
          Grown-ups use the {MODE_LABEL.standard} view, unlocked with a 4-digit PIN.
        </p>
      )}

      <div style={{ display: "flex", gap: "var(--space-3)" }}>
        <Button type="submit" variant="cta" disabled={!canSave} data-testid="profile-save">
          {save.isPending ? "Saving..." : editing ? "Save changes" : "Add"}
        </Button>
        <button type="button" className="yc-btn yc-btn--secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
      {save.isError ? (
        <p style={{ margin: 0, color: "var(--coral-500)", fontWeight: 700 }}>
          That didn&apos;t save. Give it another go?
        </p>
      ) : null}
    </form>
  );
}
