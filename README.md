# Paragraph Linter

A small Obsidian plugin that cleans up paragraph spacing in your notes:

- Adds a blank line between paragraphs that don't already have one
- Collapses extra spaces down to a single space

Built for a simple, focused editing habit — no auto-run-on-every-keystroke, just a clean pass whenever you want it.

## Why

Obsidian's Linter plugin does a lot of things. This plugin does one thing, on purpose, so it's predictable and safe to run on drafts (fan fiction, scenarios, whatever you're writing).

## Installation

1. Download `manifest.json` and `main.js` from this repo
2. In your vault, go to `.obsidian/plugins/`
3. Create a new folder called `paragraph-linter`
4. Place both files inside that folder
5. In Obsidian: **Settings → Community plugins** → turn off Restricted mode if needed
6. Find **Paragraph Linter** in your installed plugins list and enable it

## How to use it

There are two ways to run the cleanup:

**Command Palette / Hotkey (desktop, Chromebook)**
- Open the Command Palette (`Ctrl/Cmd + P`)
- Search for "Clean up paragraphs"
- Optionally bind it to a hotkey like `Ctrl/Cmd + S` in **Settings → Hotkeys**

**Ribbon button (iOS / mobile-friendly)**
- Look for the wand icon in the left ribbon
- Tap it once to clean up the currently open note

## What it does NOT do

- It does not run automatically while you type — only when you trigger it manually
- It does not touch indentation or code blocks' internal spacing logic beyond collapsing repeated spaces
- It is not a full replacement for the Linter plugin — just a narrow, single-purpose tool

## Testing

Recommended: try this in a sandbox vault first before using it on your main writing vault, especially if you're not sure how it'll behave on your specific note structure.

## License

MIT — see LICENSE file.
