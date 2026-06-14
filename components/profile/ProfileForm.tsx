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
import { MODE_LABEL } from "@/lib/profile/access";
import { Button, Card, CardBody, Input, Select } from "@/components/ds";

/** The three child age bands (the parent/carer voice `standard` is set automatically). */
const CHILD_BANDS: ExplorerMode[] = ["little", "explorer", "explorer_plus"];

interface ProfileFormProps {
  /** Existing profile to edit; omit to create a new one. */
  profile?: ChildProfile;
  onDone: () => void;
  onCancel: () => void;
}

/**
 * Create / edit a profile. `type` chooses who the profile is (child vs
 * parent/carer); a child also picks an age band, while a parent/carer always uses the
 * `standard` (Grown Ups) voice. PINs are managed separately (SetPinDialog).
 */
export function ProfileForm({ profile, onDone, onCancel }: ProfileFormProps) {
  const editing = !!profile;
  const queryClient = useQueryClient();

  const [name, setName] = useState(profile?.name ?? "");
  const [age, setAge] = useState(profile?.age != null ? String(profile.age) : "");
  const [type, setType] = useState<ProfileType>(profile?.type ?? "child");
  const [band, setBand] = useState<ExplorerMode>(
    profile?.type === "child" && profile.mode ? profile.mode : "explorer",
  );

  // A parent/carer always uses the Grown Ups voice; a child uses the chosen band.
  const mode: ExplorerMode = type === "parent_carer" ? "standard" : band;

  const save = useMutation({
    mutationFn: () => {
      const input: ChildProfileInput = {
        name: name.trim(),
        age: age.trim() ? Number(age) : null,
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
    <Card data-testid="profile-form">
      <CardBody title={editing ? `Edit ${profile.name}` : "Add a profile"}>
        <form
          className="yc-stack"
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
          <Input
            label="Age"
            type="number"
            inputMode="numeric"
            min={0}
            max={120}
            value={age}
            onChange={(e) => setAge(e.target.value)}
          />
          <Select
            label="Who is this?"
            value={type}
            onChange={(e) => setType(e.target.value as ProfileType)}
            options={[
              { value: "child", label: "An explorer (child)" },
              { value: "parent_carer", label: "A grown-up" },
            ]}
          />
          {type === "child" ? (
            <Select
              label="Explorer band"
              value={band}
              onChange={(e) => setBand(e.target.value as ExplorerMode)}
              options={CHILD_BANDS.map((b) => ({ value: b, label: MODE_LABEL[b] }))}
            />
          ) : (
            <p style={{ margin: 0, color: "var(--text-muted)", fontWeight: 700 }}>
              Grown-ups use the {MODE_LABEL.standard} view, unlocked with a 4-digit PIN.
            </p>
          )}

          <div style={{ display: "flex", gap: "var(--space-3)" }}>
            <Button type="submit" variant="cta" disabled={!canSave} data-testid="profile-save">
              {save.isPending ? "Saving..." : editing ? "Save changes" : "Add profile"}
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
      </CardBody>
    </Card>
  );
}
