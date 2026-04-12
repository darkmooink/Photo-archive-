# Photo-archive-

Archive and preserve scanned and photographed print photos by restoring the image and capturing as much reliable metadata as possible while knowledge is still available.

## Why this project matters

Memories disappear faster than physical photos. The core goal is to:

1. Digitally correct and crop each image to a usable archival quality.
2. Capture the story, people, places, and dates from living memory.
3. Store files and metadata in a structure that is easy to search, back up, and hand over.

## Project outcomes

Success means:

1. Every photo has an archival master file and a usable access copy.
2. Every photo has a unique ID and status.
3. Every photo has metadata, even if some fields are "unknown".
4. Source notes and evidence are linked to photo records.
5. The archive is backed up in at least 2 separate locations.

## Scope

In scope:

1. Prints scanned or photographed with a phone/camera.
2. Rotation, perspective correction, tonal correction, and cropping.
3. Metadata capture from relatives and written notes.
4. File naming, folder structure, and backup strategy.

Out of scope for now:

1. Deep retouching that changes historical truth.
2. AI colorization or heavy enhancement without explicit labeling.
3. Public publishing workflows.

## Suggested repository structure

Use this as a target structure:

```text
Photo-archive-/
	README.md
	data/
		incoming/            # raw scans/photos, untouched
		masters/             # corrected, highest-quality archival files
		access/              # compressed copies for browsing/sharing
		derivatives/         # optional: thumbnails, contact sheets
	metadata/
		photo_catalog.csv    # one row per photo ID
		sources/             # notes, inscriptions, and provenance evidence
		vocab/               # controlled lists (locations, surnames, events)
	docs/
		workflow.md
		metadata_schema.md
		quality_control.md
```

## Workflow plan

### Phase 1: Setup (1-2 sessions)

1. Agree naming convention and folder structure.
2. Create metadata schema and controlled vocab lists.
3. Define what "done" means for each photo status.
4. Set up backup locations before bulk work starts.

### Phase 2: Intake and triage (ongoing)

1. Assign each photo a unique ID on first contact.
2. Store original files in `data/incoming/` unchanged.
3. Log source type (scanner, phone, contributor, date).
4. Prioritize photos with high historical value or fragile provenance.

### Phase 3: Image correction and cropping (ongoing)

For each photo ID:

1. Rotate and deskew.
2. Correct perspective (if camera photo of print).
3. Crop to print edge (retain small border only if meaningful).
4. Correct exposure/contrast/white balance conservatively.
5. Export archival master and access copy.
6. Mark image processing status in catalog.

### Phase 4: Metadata capture (highest priority)

1. Capture minimally required fields from written/recorded sources.
2. Record confidence for uncertain details (high/medium/low).
3. Attach source evidence (inscription, caption, album context, document).
4. Update records immediately after each research pass.

### Phase 5: QA and backup (weekly)

1. Spot-check image quality and crop consistency.
2. Validate metadata completeness and spelling consistency.
3. Run duplicate and missing-ID checks.
4. Verify backup restores from at least one backup copy.

## Metadata standard (minimum viable schema)

Use one row per photo in `metadata/photo_catalog.csv`.

Required columns:

1. `photo_id` (stable unique ID, never reused)
2. `title` (short human-readable label)
3. `people` (semicolon-separated)
4. `location`
5. `date_exact` (YYYY-MM-DD if known)
6. `date_approx` (free text: "late 1950s")
7. `event`
8. `description`
9. `source_reference` (where details came from)
10. `source_date` (when source details were recorded or transcribed)
11. `confidence` (high|medium|low)
12. `rights_owner`
13. `scan_or_capture_method`
14. `master_file`
15. `access_file`
16. `status` (intake|processed|metadata_partial|metadata_complete|qa_done)
17. `notes`

## File naming convention

Recommended pattern:

```text
PA-YYYY-NNNN_master.tif
PA-YYYY-NNNN_access.jpg
```

Where:

1. `PA` is project prefix.
2. `YYYY` is intake year.
3. `NNNN` is zero-padded sequence number.

Example:

```text
PA-2026-0042_master.tif
PA-2026-0042_access.jpg
```

## Prioritized todo list

### Immediate (do this week)

- [ ] Create folder structure under `data/`, `metadata/`, and `docs/`.
- [ ] Create `metadata/photo_catalog.csv` with schema above.
- [ ] Decide and document final ID + filename format.
- [ ] Define status definitions and done criteria.
- [ ] List top metadata sources (albums, captions, inscriptions, records).
- [ ] Gather source material for first 20 photos.
- [ ] Process first 20 photos end-to-end as a pilot batch.
- [ ] Review pilot for bottlenecks and adjust workflow.

### Near-term (next 2-6 weeks)

- [ ] Build controlled vocab lists for places, surnames, and events.
- [ ] Add simple QA checklist in `docs/quality_control.md`.
- [ ] Create a routine for weekly backup verification.
- [ ] Add duplicate detection step (same print scanned twice).
- [ ] Capture inscriptions on photo backs as linked notes/images.
- [ ] Define rules for unknown vs estimated dates.
- [ ] Mark low-confidence records for follow-up source review.

### Ongoing

- [ ] Process images in small, consistent batches.
- [ ] Capture metadata as soon as possible after each source review pass.
- [ ] Keep an audit trail of who changed metadata and why.
- [ ] Revisit incomplete records every month.
- [ ] Review and test restore from backups regularly.

## Operating principles

1. Preserve authenticity over perfect aesthetics.
2. Keep originals untouched.
3. Prefer "captured with uncertainty" over "left blank".
4. Record sources for every non-obvious claim.
5. Prioritize urgency of memory capture over polishing old scans.

## Definition of done (per photo)

A photo is done when:

1. Incoming original is preserved.
2. Master + access derivatives exist and are named correctly.
3. Metadata required fields are completed or explicitly marked unknown.
4. Source/confidence are recorded.
5. Record passes QA and is included in backup.

## Suggested next file additions

The README can remain the "control tower". As the project grows, split detail into:

1. `docs/workflow.md` for processing steps with examples.
2. `docs/metadata_schema.md` for field definitions and rules.
3. `docs/quality_control.md` for QA checklist and acceptance criteria.
