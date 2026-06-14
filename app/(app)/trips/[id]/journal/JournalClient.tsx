"use client";

import { useState, type ChangeEvent } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTripContent, listProfiles } from "@/lib/api/trips";
import { listJournal, addJournalEntry } from "@/lib/api/journal";
import { signUpload } from "@/lib/api/media";
import { averageStars } from "@/lib/journal";
import { buildKeepsakeHtml, MOODS, moodLabel } from "@/lib/journalExport";
import { formatHumanDate } from "@/lib/format";
import { ProfileSwitcher } from "@/components/profile/ProfileSwitcher";
import { useActiveProfile } from "@/components/profile/ActiveProfileProvider";
import { StarRating } from "@/components/journal/StarRating";
import { Button, Card, CardBody, Select, Badge } from "@/components/ds";

interface PendingPhoto {
  media_ref: string;
  /** Object URL for in-session preview (real display needs BE storage). */
  url: string;
}

export function JournalClient({ tripId }: { tripId: string }) {
  const queryClient = useQueryClient();

  const tripQuery = useQuery({ queryKey: ["trip", tripId], queryFn: ({ signal }) => getTripContent(tripId, signal) });
  const profilesQuery = useQuery({ queryKey: ["profiles"], queryFn: ({ signal }) => listProfiles(signal) });

  const profiles = profilesQuery.data ?? [];
  const trip = tripQuery.data;

  const { activeProfileId, setActiveProfileId } = useActiveProfile();
  const profileId = activeProfileId ?? profiles[0]?.id ?? null;

  const [dayId, setDayId] = useState<string>("");
  const [stars, setStars] = useState(0);
  const [note, setNote] = useState("");
  const [mood, setMood] = useState<string>("");
  const [photos, setPhotos] = useState<PendingPhoto[]>([]);

  const journalQuery = useQuery({
    queryKey: ["journal", tripId, profileId],
    queryFn: ({ signal }) => listJournal(tripId, profileId ?? undefined, signal),
    enabled: !!profileId,
  });

  const upload = useMutation({
    mutationFn: async (files: FileList) => {
      const out: PendingPhoto[] = [];
      for (const file of Array.from(files)) {
        const { media_ref } = await signUpload(tripId, file.type || "image/jpeg");
        // Real bytes would be PUT to the signed URL; for the mock we keep a
        // local object URL for preview only.
        out.push({ media_ref, url: URL.createObjectURL(file) });
      }
      return out;
    },
    onSuccess: (added) => setPhotos((p) => [...p, ...added]),
  });

  const mutation = useMutation({
    mutationFn: () =>
      addJournalEntry(tripId, {
        profile_id: profileId!,
        day_id: dayId || trip?.days[0]?.id || "",
        body: note,
        stars: stars || undefined,
        mood: mood || undefined,
        media_ref: photos.map((p) => p.media_ref),
      }),
    onSuccess: () => {
      setNote("");
      setStars(0);
      setMood("");
      setPhotos([]);
      queryClient.invalidateQueries({ queryKey: ["journal", tripId, profileId] });
    },
  });

  if (tripQuery.isLoading) return <p>Loading the journal...</p>;
  if (!trip) {
    return (
      <Card variant="soft">
        <CardBody>
          <p style={{ margin: 0, color: "var(--coral-500)", fontWeight: 700 }}>
            We couldn&apos;t open this journal. Give it another go?
          </p>
        </CardBody>
      </Card>
    );
  }

  const dayLabel = (id: string) => trip.days.find((d) => d.id === id)?.label ?? id;
  const entries = journalQuery.data ?? [];
  const avg = averageStars(entries.map((e) => e.stars));
  const canSave =
    !!profileId &&
    (note.trim().length > 0 || stars > 0 || !!mood || photos.length > 0) &&
    !mutation.isPending;

  const activeName = profiles.find((p) => p.id === profileId)?.name ?? "Explorer";

  const exportKeepsake = () => {
    const html = buildKeepsakeHtml({
      profileName: activeName,
      destination: trip.trip.destination,
      year: trip.trip.start_date.slice(0, 4),
      days: trip.days,
      entries,
    });
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeName.toLowerCase()}-${trip.trip.destination.toLowerCase()}-journal.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="yc-stack" data-testid="journal">
      <header className="yc-stack" style={{ gap: "var(--space-2)" }}>
        <h1 style={{ margin: 0 }}>Journal - {trip.trip.destination}</h1>
        <p style={{ margin: 0, color: "var(--text-muted)", fontWeight: 700 }}>
          Capture the yay. Notes and stars, day by day.
        </p>
      </header>

      {profiles.length > 0 ? (
        <ProfileSwitcher profiles={profiles} activeId={profileId} onSelect={setActiveProfileId} />
      ) : null}

      <Card>
        <CardBody title="Add a memory">
          <Select
            label="Which day?"
            value={dayId || trip.days[0]?.id || ""}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => setDayId(e.target.value)}
            options={trip.days.map((d) => ({ value: d.id, label: `${d.label} (${formatHumanDate(d.date)})` }))}
          />

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "var(--fs-sm)", color: "var(--royal-700)" }}>
              How was it?
            </span>
            <StarRating value={stars} onChange={setStars} label="Star rating" />
          </div>

          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "var(--fs-sm)", color: "var(--royal-700)" }}>
              A note
            </span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="What made today special?"
              style={{
                fontFamily: "var(--font-body)",
                fontWeight: 600,
                fontSize: "var(--fs-base)",
                color: "var(--ink)",
                background: "#fff",
                border: "2.5px solid var(--sand-300)",
                borderRadius: "var(--radius-md)",
                padding: "10px 16px",
                resize: "vertical",
                boxShadow: "inset 0 2px 4px rgba(7,61,114,.06)",
              }}
            />
          </label>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "var(--fs-sm)", color: "var(--royal-700)" }}>
              Mood
            </span>
            <div role="radiogroup" aria-label="Mood" style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
              {MOODS.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  role="radio"
                  aria-checked={mood === m.value}
                  onClick={() => setMood((cur) => (cur === m.value ? "" : m.value))}
                  className={mood === m.value ? "yc-btn yc-btn--cta yc-btn--sm" : "yc-btn yc-btn--secondary yc-btn--sm"}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "var(--fs-sm)", color: "var(--royal-700)" }}>
              Photos
            </span>
            <input
              type="file"
              accept="image/*"
              multiple
              aria-label="Add photos"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) upload.mutate(e.target.files);
                e.target.value = "";
              }}
            />
            {photos.length > 0 ? (
              <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
                {photos.map((p) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={p.media_ref}
                    src={p.url}
                    alt="memory"
                    style={{ width: 64, height: 64, objectFit: "cover", borderRadius: "var(--radius-md)", border: "2.5px solid var(--royal-500)" }}
                  />
                ))}
              </div>
            ) : null}
            {upload.isPending ? (
              <span style={{ color: "var(--text-muted)", fontWeight: 700 }}>Adding photos...</span>
            ) : null}
          </div>

          <Button variant="cta" onClick={() => mutation.mutate()} disabled={!canSave}>
            {mutation.isPending ? "Saving..." : "Save memory"}
          </Button>
          {mutation.isError ? (
            <p style={{ margin: 0, color: "var(--coral-500)", fontWeight: 700 }}>
              Hmm, that didn&apos;t save. Give it another go?
            </p>
          ) : null}
        </CardBody>
      </Card>

      <section className="yc-stack" data-testid="journal-entries">
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", flexWrap: "wrap" }}>
          <h2 style={{ margin: 0 }}>Memories</h2>
          {avg != null ? <Badge tone="sun">{avg} avg stars</Badge> : null}
          {entries.length > 0 ? (
            <Button variant="secondary" size="sm" onClick={exportKeepsake}>
              Export keepsake
            </Button>
          ) : null}
        </div>

        {entries.length === 0 ? (
          <Card variant="soft">
            <CardBody>
              <p style={{ margin: 0 }}>No memories yet - add the first one above.</p>
            </CardBody>
          </Card>
        ) : (
          entries.map((e) => (
            <Card key={e.id} variant="soft">
              <CardBody>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "var(--space-3)" }}>
                  <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center" }}>
                    <Badge tone="aqua">{e.day_id ? dayLabel(e.day_id) : "Trip"}</Badge>
                    {e.mood ? <Badge tone="soft">{moodLabel(e.mood) ?? e.mood}</Badge> : null}
                  </div>
                  {e.stars ? <StarRating value={e.stars} readOnly /> : null}
                </div>
                {e.body ? <p style={{ margin: "var(--space-2) 0 0" }}>{e.body}</p> : null}
                {e.media_ref && e.media_ref.length > 0 ? (
                  <p style={{ margin: "var(--space-2) 0 0", color: "var(--text-muted)", fontWeight: 700 }}>
                    {e.media_ref.length} photo(s)
                  </p>
                ) : null}
              </CardBody>
            </Card>
          ))
        )}
      </section>
    </div>
  );
}
