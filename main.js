const { Plugin, Notice } = require('obsidian');

function getBlockType(line) {
  const trimmed = line.trim();

  if (trimmed === '') return null;
  if (trimmed.startsWith('>')) return 'callout';
  if (/^[-*+]\s/.test(trimmed)) return 'list';
  if (/^\d+[.)]\s/.test(trimmed)) return 'list';

  return 'text';
}

function endsAParagraph(line) {
  const trimmed = line.trim();
  if (trimmed === '') return false;
  return /[.!?"'”’)\]]$/.test(trimmed);
}

function cleanText(text) {
  // Step 1: collapse multiple spaces into a single space on the same line
  let result = text.replace(/ {2,}/g, ' ');

  // Step 2: collapse 3 or more consecutive newlines down to 2 (which equals 1 blank line)
  // This turns 4+ newlines back into standard single-line paragraph spacing.
  result = result.replace(/\n{3,}/g, '\n\n');

  // Step 3: make sure paragraphs have a blank line between them,
  // but keep callouts, lists, and mid-sentence line-wraps glued together.
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

    if (currentType !== nextType) {
      // Switching block types gets a blank line
      rebuilt.push('');
    } else if (currentType === 'text') {
      // Plain text: split if line finished a paragraph
      if (endsAParagraph(currentLine)) {
        rebuilt.push('');
      }
    }
  }

  return rebuilt.join('\n');
}

module.exports = class ParagraphLinterPlugin extends Plugin {
  async onload() {
    const runCleanup = () => {
      // Step 1: Get the active Markdown view panel
      const activeView = this.app.workspace.getActiveViewOfType(require('obsidian').MarkdownView);

      if (!activeView) {
        new Notice('No active markdown note open.');
        return;
      }

      // Step 2: Grab the editor instance directly
      const editor = activeView.editor;
      const original = editor.getValue();
      const cleaned = cleanText(original);

      // Step 3: Replace text in the editor panel
      if (cleaned !== original) {
        editor.setValue(cleaned);
        new Notice('Paragraphs cleaned up.');
      } else {
        new Notice('Nothing to clean up!');
      }
    };

    // Trigger 1: Command Palette / Hotkey
    this.addCommand({
      id: 'clean-paragraphs',
      name: 'Clean up paragraphs (add spacing, remove extra spaces)',
      icon: 'pencil',
      // Using editorCallback ensures it only fires when an active editor is open
      editorCallback: (editor) => {
        const original = editor.getValue();
        const cleaned = cleanText(original);
        if (cleaned !== original) {
          editor.setValue(cleaned);
          new Notice('Paragraphs cleaned up.');
        } else {
          new Notice('Nothing to clean up!');
        }
      },
    });

    // Trigger 2: Ribbon Icon
    this.addRibbonIcon('wand', 'Clean up paragraphs', runCleanup);
  }

  onunload() {}
};
