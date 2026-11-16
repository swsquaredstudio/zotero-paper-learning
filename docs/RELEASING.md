# Release checklist

No repository, release, or update feed is published by these scripts.

1. The confirmed target is `swsquaredstudio/zotero-paper-learning`. The owner approved MIT; LICENSE is included in source and XPI.
2. Inspect all allowlisted files for private data and verify third-party code provenance. Do not include real PDFs or exports. Check Git history too if importing an existing repository.
3. Keep plugin ID `paper-learning-export@ivar.local` stable to update the existing installation. The preparation version is 0.2.1.
4. The configured `applications.zotero.update_url` is `https://raw.githubusercontent.com/swsquaredstudio/zotero-paper-learning/main/updates.json`. Do not advertise an uncreated endpoint as working.
5. The manifest test and both READMEs reflect the configured endpoint. Zotero update checks will contact GitHub; document that distinction from paper uploads.
6. Run `node --test tests/*.cjs`, build with `python3 build.py`, and inspect the XPI/source archive.
7. In a test Zotero profile: install, create/edit/reopen notes, restart, export immediately after the last edit, cancel/retry, select multiple notes, exercise missing PDF/read-only library errors, and inspect ZIP contents. Do not use real private papers as public fixtures.
8. Publish the versioned XPI in a versioned GitHub release first. Preserve the matching source tag and write release notes; label unverified builds as prereleases rather than stable.
9. Generate the update feed with `python3 scripts/make_update.py --repo swsquaredstudio/zotero-paper-learning`. It validates the local XPI and writes `dist/updates.json`; it does not upload anything.
10. Publish the feed at the exact manifest URL only after verifying the XPI URL is downloadable. The initial feed is explicitly experimental; do not describe this beta feed as stable. Use a separate feed if a stable channel is introduced.
11. Verify the actual upgrade from an installed older version. The shipped 0.2.0 points at `.invalid`, so users must manually install the first public-feed-enabled version once.

Do not change existing note tags or plugin identity merely to rename the public project. Compatibility is declared only for Zotero 10.0.x; do not claim other versions without testing.
