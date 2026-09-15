# PlanMark · Engineering Site Plans for Codex

English | [简体中文](README.md)

Turn a satellite photo, map screenshot, or site plan into a light-colored base map, then place circular equipment icons and parameter labels in a local browser editor. Save an editable JSON project and export a PNG.

**AI redraws the base map. You choose equipment, locations, and parameters. The editor provides local rule checks, not AI review or automatic changes.** The current editor interface and device names are in Simplified Chinese; documentation and prompts are bilingual.

## AI requirements

The complete workflow requires the current Codex session to have:

1. Image understanding to inspect the original image and the supplied style reference.
2. An image-editing tool that accepts the original as structure reference A and a selected style image as reference B. Text-only generation or image recognition alone is insufficient.
3. Actual image output that can be saved and inspected. The project preparation script accepts a confirmed PNG base map.
4. Local file and command access to save files, run Python, and open a local browser page.

Installing this skill does not provide an image model, tool access, API key, credits, or account permissions. Codex must check the tools available in the current session; image-input support alone does not imply image-generation support. Generation may require network access and credits from the selected provider. The editor itself needs no model or API key.

If reference-based generation is unavailable or fails, report the limitation without claiming that a redraw was completed or retrying indefinitely. Use the included prompt and reference image in an external image tool, then bring back and confirm the resulting PNG. A confirmed base map or saved JSON can skip generation entirely.

## Install in Codex

### Ask Codex to install

Download and extract this [repository](https://github.com/qinzeiwang/planmark), or clone it. Give Codex the local folder:

> Install PlanMark from this folder as a personal skill. Check for an existing installation first, keep all references and runtime files, and verify that the skill is available.

The folder must directly contain `SKILL.md`. Copy the entire folder, not only that file. Start a new session after installation; restart Codex if the skill does not appear.

### Install manually

Copy the folder as `planmark` into one of these locations:

| Scope | Location |
| --- | --- |
| Personal | `~/.agents/skills/planmark/` |
| Project | `<project>/.agents/skills/planmark/` |
| Windows personal | `%USERPROFILE%\.agents\skills\planmark\` |

The result must be `planmark/SKILL.md`, not `planmark/planmark/SKILL.md`. If your existing installer uses another recognized skill location, keep its result; avoid duplicate installations. See the [official Codex skill documentation](https://learn.chatgpt.com/docs/build-skills).

This workflow targets local Codex use. CLI and IDE sessions also need the capabilities above. A cloud session alone cannot be assumed to control your local browser or native save dialog.

## Local requirements

- Python 3.9+ available as `python`; native Save As fallback requires `tkinter` and a desktop session.
- A browser that can open local pages. PNG export uses a browser file picker where supported, otherwise the local server opens a native dialog.
- No npm or Node.js is needed for normal editing. Development tests use Node.js and Playwright.
- The server listens only on `127.0.0.1`. Use that exact hostname; `localhost` is rejected by Host validation.
- Tested on Windows with Python 3.12 and Chromium. Other platforms and real native save-dialog interactions are not fully verified.

## Use

### 1. Attach your original image

Select PlanMark in the skill picker or invoke it explicitly:

> $planmark Start with this satellite image. Check that reference-based image generation is available. Show me the redrawn base map for confirmation before opening the annotation editor.

Codex CLI and IDE support `$` skill mentions; other interfaces may use a skill selector. See the [official invocation guide](https://learn.chatgpt.com/docs/build-skills).

The skill uses the [bilingual prompt](base-map/prompts/redraw.md) and the [default light reference](base-map/references/default.png). Choose the [hand-drawn reference](base-map/references/hand-drawn.png) only for a stronger illustrated look. Use one style reference per generation; its building layout must never replace the user's original layout.

### 2. Confirm the base map

Check building count, road alignment, proportions, and crop. Fix structural errors before continuing. Generated images do not establish survey-grade accuracy.

> The base map is confirmed. Open the annotation editor.

### 3. Place annotations

Codex prepares a new standalone project, starts its local server, and opens `editor/start.html`.

- Select an icon, click the map, and enter parameters such as `10kW` or `100kWh`.
- Drag the icon and attached label together. Choose one of four label sides; avoid hiding parameter labels.
- The fixed, vertically centered legend lists equipment categories, not parameter values.
- Use the map-fade slider to reduce the visual prominence of the base image; the default is 0%.
- Local checks report overlaps, out-of-bounds items, hidden labels, and color issues without changing the scene or validating engineering locations.

### 4. Save and resume

- **JSON:** embeds the base map, positions, parameters, and fade level. Choose a location where the browser supports a file picker; otherwise enter a filename and use the browser's download location.
- **PNG:** exports a 3840-pixel long edge without editor controls. Uses browser Save As or the local native dialog; cancellation does not trigger a download.
- **Resume:** use the editor's Open JSON button, or attach the file to Codex: `$planmark Restore this JSON directly into the editor.`
- **Restart:** tell Codex the standalone project folder so it can run `scripts/local-server.py` and reopen `editor/start.html`. Reload your saved JSON; the initial HTML does not automatically contain later edits.
- **Upgrade:** existing projects are independent copies. Save JSON and restore it into a new project using the updated skill. Existing projects using older directory names can still run with their original files.

See [save and export details](export/guide.md).

## Troubleshooting

| Issue | Action |
| --- | --- |
| Skill is missing | Check folder nesting and duplicate installations; start a new session or restart |
| Can inspect images but cannot generate | Check for a reference-capable editing tool, or supply a confirmed PNG |
| Generation fails or runs out of credits | Report failure; retry when available or use an externally generated PNG |
| Page does not open | Check Python and the local server; choose a free port |
| PNG Save As fails | Open through the local server and check tkinter; an error does not mean the file was saved |
| Old project did not update | Save JSON and restore into a new project |

## Repository layout

```text
SKILL.md                 Bilingual agent workflow
README.md                Simplified Chinese usage guide
README.en.md             English usage guide
base-map/                Acceptance criteria, bilingual prompt, style images
editor/                  Browser editor and embedded SVG icons
export/                  Save behavior and scene schema
scripts/                 Project preparation, local server, export test
tests/                   Automated checks
```

## Tests

```sh
node --test tests/scene.test.cjs
node scripts/test-export.cjs
python -m unittest discover -s tests -p test_local_server.py
node tests/browser.test.cjs
```

Browser tests require Playwright and Chromium. `PLANMARK_PLAYWRIGHT` can point to an existing package. Tests use synthetic scenes and mocked file handles/dialog processes; they do not prove real desktop Save As, overwrite confirmation, or actual image-generation quality.

## License

Code, documentation, 55 icons, and both style references are provided under the [MIT License](LICENSE). Use, modification, redistribution, and commercial use are permitted. Copies or substantial portions must retain `Copyright (c) 2026 qinzeiwang` and the full license text. Provided as is, without warranty.
