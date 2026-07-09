const { Plugin, Notice } = require('obsidian');

// This function does the actual cleanup work.
// It takes the raw text of your note and returns the cleaned-up version.
// Returns a "block type" label for a line, or null if it's plain text.
// Lines with the same block type stay glued together (no blank line inserted
// between them). This covers Obsidian callouts (>...) and list items.
function getBlockType(line) {
  const trimmed = line.trim();

  if (trimmed === '') return null;

  // Callout / blockquote lines start with ">"
  if (trimmed.startsWith('>')) return 'callout';

  // Bullet list items: -, *, or +
  if (/^[-*+]\s/.test(trimmed)) return 'list';

  // Numbered list items: "1.", "2)", etc.
  if (/^\d+[.)]\s/.test(trimmed)) return 'list';

  return 'text';
}

function cleanText(text) {
  // Step 1: collapse multiple spaces into a single space.
  let result = text.replace(/ {2,}/g, ' ');

  // Step 2: make sure paragraphs have a blank line between them,
  // but keep callouts and list items glued together as one block.
  const lines = result.split('\n');
  const rebuilt = [];

  for (let i = 0; i < lines.length; i++) {
    const currentLine = lines[i];
    const nextLine = lines[i + 1];

    rebuilt.push(currentLine);

    const currentIsEmpty = currentLine.trim() === '';
    const nextIsEmpty = nextLine === undefined || nextLine.trim() === '';

    if (currentIsEmpty || nextIsEmpty) continue;

    const currentType = getBlockType(currentLine);
    const nextType = getBlockType(nextLine);

    // Only insert a blank line when moving from one block type to a
    // different one (e.g. text -> callout, list -> text). Lines that
    // share the same block type (callout->callout, list->list) stay together.
    if (currentType !== nextType) {
      rebuilt.push('');
    }
  }

  return rebuilt.join('\n');
}

module.exports = class ParagraphLinterPlugin extends Plugin {
  async onload() {
    // This runs the cleanup and writes it back into the currently open note.
    const runCleanup = async () => {
      const file = this.app.workspace.getActiveFile();
      if (!file) {
        new Notice('No note is open.');
        return;
      }

      const original = await this.app.vault.read(file);
      const cleaned = cleanText(original);

      if (cleaned !== original) {
        await this.app.vault.modify(file, cleaned);
        new Notice('Paragraphs cleaned up.');
      }
    };

    // Trigger 1: manual command, shows up in the Command Palette
    // and can be bound to a hotkey (Ctrl/Cmd+S) on desktop.
    this.addCommand({
      id: 'clean-paragraphs',
      name: 'Clean up paragraphs (add spacing, remove extra spaces)',
      icon: 'pencil',
      callback: runCleanup,
    });

    // Trigger 2: mobile-friendly toolbar/ribbon button (works on iOS).
    this.addRibbonIcon('wand', 'Clean up paragraphs', runCleanup);

    // Trigger 3: automatically run whenever Obsidian saves the file.
    // This fires on both desktop (Ctrl/Cmd+S) and mobile (auto-save, swipe away, etc.)
    this.registerEvent(
      this.app.vault.on('modify', () => {
        // Intentionally left as a hook point; see note in chat about
        // why auto-run-on-every-edit is NOT enabled by default.
      })
    );
  }

  onunload() {
    // Nothing to clean up.
  }
};
