# Ivar Paper Learning Export

A Zotero 10.0.x plugin for keeping paper-learning notes in Zotero and exporting a local package containing the source PDF, selected notes, and annotations.

**Status:** beta / experimental. The 0.2.2 preparation source passes 33 mocked/unit tests. Native Zotero installation, note persistence, editor flushing, and ZIP creation still need end-to-end validation. Use the [0.2.2 beta release](https://github.com/swsquaredstudio/zotero-paper-learning/releases/tag/v0.2.2); it is not a stable release.

[한국어 사용 안내](README.ko.md) · [Changelog](CHANGELOG.md) · [Release checklist](docs/RELEASING.md)

## Workflow

1. Install the versioned `.xpi` using Zotero **Tools → Plugins → Install Add-on From File**.
2. Select a paper, attached PDF, or child note and use **Tools → Open Learning Note…**.
3. Select a note in the first card to open it, or expand the second card to create a separate whole-paper/section learning note. Creation options never change existing notes. Write in Zotero's native editor. Notes remain ordinary Zotero notes if this plugin is removed.
4. Use **Tools → Export Paper Learning Package…** and choose which notes to include. Only notes tagged `ivar-learning` are selected by default.
5. Choose an output directory. Share the resulting `paper-learning.zip` only after reviewing its contents and your permission to share the paper.

The ZIP contains:

- `paper.pdf`: an unchanged copy of the local source PDF;
- `learning.md`: selected notes, annotations, and review guidance;
- `annotations.json`: annotation metadata and the selected notes' original HTML.

Each export is a snapshot. Edits made later require a new export. The staging files are also retained alongside the ZIP. Canceling export does not delete Zotero notes.

## Annotation colors

| Color | Meaning |
|---|---|
| Red | Unfamiliar words or phrases |
| Yellow | Sentences that are difficult to interpret |
| Blue | Conceptual questions |
| Green | Main claims and evidence |

Other colors are retained. The UI supports entering Korean; generated review guidance currently includes Korean text. There is no automatic translation, AI request, or Anki integration.

## Privacy and limitations

- The plugin exports to a directory you select; it does not upload your PDF or notes.
- Zotero notes follow Zotero's existing sync settings. An output directory inside another sync service follows that service's settings.
- Exported files are unencrypted. They contain paper metadata, annotation text/comments, selected note HTML, item keys, library identifiers, and local Zotero links. Full local PDF paths are not exported.
- Missing local PDFs stop export; the plugin does not download them automatically.
- Zotero annotations are not newly embedded in the copied PDF. They are stored separately in Markdown/JSON.
- Note images and separate image/ink annotation assets are not included. Tables and math may lose visual formatting in Markdown; original note HTML is retained in JSON.
- Section labels do not automatically filter annotations by section. Existing `learning.md` interpretations are not imported into new Zotero notes.
- The update feed is configured as `https://raw.githubusercontent.com/swsquaredstudio/zotero-paper-learning/main/updates.json`. This experimental feed points to the beta release. Feed availability and package integrity are verified separately from an actual Zotero upgrade, which remains unverified. Zotero update checks contact GitHub; paper content is not uploaded. Users of 0.2.0 must manually install the first feed-enabled version once.

## Development

Requires Node.js 18+ and Python 3; no third-party build dependencies.

```sh
node --test tests/*.cjs
python3 build.py
```

Build outputs appear in `dist/`. The source archive uses an explicit allowlist, not the entire working directory. Do not add real papers, user exports, credentials, or local Zotero data to the repository.

## License

[MIT](LICENSE). Copyright (c) 2026 swsquaredstudio.
