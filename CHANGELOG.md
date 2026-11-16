# Changelog

## 0.2.2 (beta)

- Separate existing-note opening from new-note creation into clearly labeled cards.
- Collapse new-note controls by default and explain they never modify selected notes.
- Require explicit existing-note selection; no implicit open action.
- Preserve cancellation, export selection, and native Zotero note editing.
- 33 automated tests pass; native Zotero UI and IME behavior remain unverified.

## 0.2.1 (beta)

- Prepare English README, standalone changelog, release checklist, and privacy-safe packaging for public distribution.
- Add an offline update-manifest generator. Configure the swsquaredstudio/zotero-paper-learning feed and preserve the existing plugin ID. MIT licensing is approved; native Zotero validation remains pending; the experimental update feed and beta release were published.

- Include MIT license in source and installable XPI.
- Correct exported generator version to match 0.2.1.

## 0.2.0

- Create and reopen native Zotero learning notes without overwriting existing notes.
- Select notes for export, preview export details, remember the last output directory, and offer to open it.
- Keep note editing separate from export cancellation.
- 27 mocked/unit tests pass; native Zotero end-to-end verification remains outstanding.

## 0.1.4

- Copy the original local PDF and package it with notes and annotations in one ZIP.
- Check required ZIP entries and CRC; handle missing files and export failures.

## 0.1.3

- Register chrome resources and use a XUL-window-based dialog.
- Use an English input UI while retaining Korean input.

## 0.1.2

- Add the required update URL using a reserved HTTPS `.invalid` address.

## 0.1.1

- Internal candidate only: a data-URL update approach was not distributed because of security-check concerns.

## 0.1.0

- Initial implementation. Installation failed because required manifest metadata was missing.
