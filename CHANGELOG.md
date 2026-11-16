# Changelog

## 0.2.1 (beta)

- Prepare English README, standalone changelog, release checklist, and privacy-safe packaging for public distribution.
- Add an offline update-manifest generator. Configure the swsquaredstudio/zotero-paper-learning feed and preserve the existing plugin ID. MIT licensing is approved; native Zotero validation remains pending; the experimental feed targets the beta release; actual Zotero upgrades remain unverified.

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
