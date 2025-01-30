import { MarkdownView, Plugin } from "obsidian";

interface EssentialShortcutsSettings {
	enableDuplicateLineDown: boolean;
	enableDuplicateLineUp: boolean;
	enableSelectLine: boolean;
	enableInsertCursorBelow: boolean;
	enableInsertCursorAbove: boolean;
	enableInsertLineAbove: boolean;
	enableSelectWordOrExpand: boolean;
}

const DEFAULT_SETTINGS: EssentialShortcutsSettings = {
	enableDuplicateLineDown: true,
	enableDuplicateLineUp: true,
	enableSelectLine: true,
	enableInsertCursorBelow: true,
	enableInsertCursorAbove: true,
	enableInsertLineAbove: true,
	enableSelectWordOrExpand: true,
};

export default class EssentialShortcuts extends Plugin {
	settings: EssentialShortcutsSettings;
	private selectLineCount = 0;
	private lastSelectedLine = -1;
	private lastSelectedWord: string | null = null;

	async onload() {
		await this.loadSettings();

		// Add command to duplicate line downward
		this.addCommand({
			id: "duplicate-line-down",
			name: "Duplicate line down",
			hotkeys: [{ modifiers: ["Alt", "Shift"], key: "ArrowDown" }],
			checkCallback: (checking: boolean) =>
				this.handleDuplicateLineDown(checking),
		});

		// Add command to duplicate line upward
		this.addCommand({
			id: "duplicate-line-up",
			name: "Duplicate line up",
			hotkeys: [{ modifiers: ["Alt", "Shift"], key: "ArrowUp" }],
			checkCallback: (checking: boolean) =>
				this.handleDuplicateLineUp(checking),
		});

		// Add command to select the current line and expand selection
		this.addCommand({
			id: "select-line",
			name: "Select Current Line",
			hotkeys: [{ modifiers: ["Ctrl"], key: "L" }],
			checkCallback: (checking: boolean) =>
				this.handleSelectLine(checking),
		});

		// Add command to insert a cursor below
		this.addCommand({
			id: "insert-cursor-below",
			name: "Insert Cursor Below",
			hotkeys: [{ modifiers: ["Ctrl", "Alt"], key: "ArrowDown" }],
			checkCallback: (checking: boolean) =>
				this.handleInsertCursorBelow(checking),
		});

		// Add command to insert a cursor above
		this.addCommand({
			id: "insert-cursor-above",
			name: "Insert Cursor Above",
			hotkeys: [{ modifiers: ["Ctrl", "Alt"], key: "ArrowUp" }],
			checkCallback: (checking: boolean) =>
				this.handleInsertCursorAbove(checking),
		});

		// Add command to insert a line above
		this.addCommand({
			id: "insert-line-above",
			name: "Insert Line Above",
			hotkeys: [{ modifiers: ["Ctrl", "Shift"], key: "Enter" }],
			checkCallback: (checking: boolean) =>
				this.handleInsertLineAbove(checking),
		});

		// Add command to select the current word or expand selection
		this.addCommand({
			id: "select-word-or-expand",
			name: "Select Current Word or Expand Selection",
			hotkeys: [{ modifiers: ["Ctrl"], key: "D" }],
			checkCallback: (checking: boolean) =>
				this.handleSelectWordOrExpand(checking),
		});

		// Add command to select all occurrences of the current selection or word
		this.addCommand({
			id: "select-all-occurrences",
			name: "Select All Occurrences",
			hotkeys: [{ modifiers: ["Ctrl", "Shift"], key: "L" }],
			checkCallback: (checking: boolean) =>
				this.handleSelectAllOccurrences(checking),
		});

		// Add command to transform selection to uppercase
		this.addCommand({
			id: "transform-to-uppercase",
			name: "Transform Selection to Uppercase",
			checkCallback: (checking: boolean) =>
				this.handleTextCommands(checking, "uppercase"),
		});

		// Add command to transform selection to lowercase
		this.addCommand({
			id: "transform-to-lowercase",
			name: "Transform Selection to Lowercase",
			checkCallback: (checking: boolean) =>
				this.handleTextCommands(checking, "lowercase"),
		});

		// Add command to transform selection to title case
		this.addCommand({
			id: "transform-to-titlecase",
			name: "Transform Selection to Title Case",
			checkCallback: (checking: boolean) =>
				this.handleTextCommands(checking, "titlecase"),
		});

		// Add command to toggle case of the selection
		this.addCommand({
			id: "toggle-case",
			name: "Toggle Case of Selection",
			checkCallback: (checking: boolean) =>
				this.handleToggleCase(checking),
		});

		// Register an event to reset the line count when clicking elsewhere
		this.registerDomEvent(document, "mousedown", () => {
			this.selectLineCount = 0;
			this.lastSelectedLine = -1;
		});
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	// Helper function to get the active editor
	private getActiveEditor() {
		const view = this.app.workspace.getActiveViewOfType(MarkdownView);
		return view?.editor;
	}

	/**
	 * Handles the command to duplicate the current line downwards.
	 * @param checking - Indicates if the command is being checked or executed.
	 * @returns true if the command can be executed.
	 */
	private handleDuplicateLineDown(checking: boolean) {
		if (!checking) {
			try {
				const editor = this.getActiveEditor();
				if (editor) {
					const cursor = editor.getCursor();
					const line = editor.getLine(cursor.line);
					editor.replaceRange("\n" + line, {
						line: cursor.line,
						ch: line.length,
					});
					editor.setCursor({ line: cursor.line + 1, ch: cursor.ch });
				}
			} catch (error) {
				console.error("Error duplicating line down:", error);
			}
		}
		return true;
	}

	private handleDuplicateLineUp(checking: boolean) {
		if (!checking) {
			const view = this.app.workspace.getActiveViewOfType(MarkdownView);
			if (view?.editor) {
				const editor = view.editor;
				const cursor = editor.getCursor();
				const line = editor.getLine(cursor.line);
				editor.replaceRange(line + "\n", { line: cursor.line, ch: 0 });
				editor.setCursor({ line: cursor.line, ch: cursor.ch });
			}
		}
		return true;
	}

	private handleSelectLine(checking: boolean) {
		if (!checking) {
			const editor = this.getActiveEditor();
			if (editor) {
				const cursor = editor.getCursor();
				const currentLine = cursor.line;

				if (!editor.somethingSelected()) {
					this.selectLineCount = 0;
					this.lastSelectedLine = currentLine;
				}

				if (this.selectLineCount === 0) {
					editor.setSelection(
						{ line: this.lastSelectedLine, ch: 0 },
						{ line: this.lastSelectedLine + 1, ch: 0 }
					);
				} else {
					editor.setSelection(
						{ line: this.lastSelectedLine, ch: 0 },
						{
							line:
								this.lastSelectedLine +
								this.selectLineCount +
								1,
							ch: 0,
						}
					);
				}

				this.selectLineCount++;
			}
		}
		return true;
	}

	private handleInsertCursorBelow(checking: boolean) {
		if (!checking) {
			const editor = this.getActiveEditor();
			if (editor) {
				const cursor = editor.getCursor();
				const newCursors = editor
					.listSelections()
					.map((selection) => selection.anchor);

				// Iterate through existing selections to add a cursor below each
				for (const selection of editor.listSelections()) {
					const lineBelow = selection.anchor.line + 1;
					// Check if the line below exists
					if (lineBelow < editor.lineCount()) {
						const lineBelowLength =
							editor.getLine(lineBelow).length;
						// Adjust column position if the line below is shorter
						const newCh = Math.min(
							selection.anchor.ch,
							lineBelowLength
						);
						newCursors.push({ line: lineBelow, ch: newCh });
					}
				}

				editor.setSelections(
					newCursors.map((pos) => ({ anchor: pos, head: pos }))
				);
				editor.focus();
			}
		}
		return true;
	}

	private handleInsertCursorAbove(checking: boolean) {
		if (!checking) {
			const editor = this.getActiveEditor();
			if (editor) {
				const cursor = editor.getCursor();
				const newCursors = editor
					.listSelections()
					.map((selection) => selection.anchor);

				// Iterate through existing selections to add a cursor above each
				for (const selection of editor.listSelections()) {
					const lineAbove = selection.anchor.line - 1;
					// Check if the line above exists
					if (lineAbove >= 0) {
						const lineAboveLength =
							editor.getLine(lineAbove).length;
						// Adjust column position if the line above is shorter
						const newCh = Math.min(
							selection.anchor.ch,
							lineAboveLength
						);
						newCursors.push({ line: lineAbove, ch: newCh });
					}
				}

				editor.setSelections(
					newCursors.map((pos) => ({ anchor: pos, head: pos }))
				);
				editor.focus();
			}
		}
		return true;
	}

	private handleInsertLineAbove(checking: boolean) {
		if (!checking) {
			const view = this.app.workspace.getActiveViewOfType(MarkdownView);
			if (view?.editor) {
				const editor = view.editor;
				const cursor = editor.getCursor();
				editor.replaceRange("\n", { line: cursor.line, ch: 0 });
				editor.setCursor({ line: cursor.line, ch: 0 });
			}
		}
		return true;
	}

	private handleSelectWordOrExpand(checking: boolean) {
		if (!checking) {
			const view = this.app.workspace.getActiveViewOfType(MarkdownView);
			if (view?.editor) {
				const editor = view.editor;
				const cursor = editor.getCursor();
				const line = editor.getLine(cursor.line);
				const selectedText = editor.getSelection();

				if (selectedText) {
					this.lastSelectedWord = selectedText;
				} else if (this.lastSelectedWord) {
					const nextIndex = line.indexOf(
						this.lastSelectedWord,
						cursor.ch
					);
					if (nextIndex !== -1) {
						editor.setSelection(
							{ line: cursor.line, ch: nextIndex },
							{
								line: cursor.line,
								ch: nextIndex + this.lastSelectedWord.length,
							}
						);
						editor.setCursor({
							line: cursor.line,
							ch: nextIndex + this.lastSelectedWord.length,
						});
					}
				} else {
					const wordStart = line.lastIndexOf(" ", cursor.ch - 1) + 1;
					const wordEnd = line.indexOf(" ", cursor.ch);
					const word = line.slice(
						wordStart,
						wordEnd === -1 ? line.length : wordEnd
					);
					editor.setSelection(
						{ line: cursor.line, ch: wordStart },
						{ line: cursor.line, ch: wordStart + word.length }
					);
					this.lastSelectedWord = word;
				}
			}
		}
		return true;
	}

	// Command Handler for selecting all occurrences
	private handleSelectAllOccurrences(checking: boolean) {
		if (!checking) {
			const view = this.app.workspace.getActiveViewOfType(MarkdownView);
			if (view?.editor) {
				const editor = view.editor;
				const cursor = editor.getCursor();
				const line = editor.getLine(cursor.line);
				const selectedText = editor.getSelection();

				let textToSelect;

				if (selectedText) {
					textToSelect = selectedText;
				} else {
					const wordStart = line.lastIndexOf(" ", cursor.ch - 1) + 1;
					const wordEnd = line.indexOf(" ", cursor.ch);
					textToSelect = line.slice(
						wordStart,
						wordEnd === -1 ? line.length : wordEnd
					);
				}

				const allText = editor.getValue();
				const regex = new RegExp(textToSelect, "g");
				let match;
				const selections = [];

				while ((match = regex.exec(allText)) !== null) {
					selections.push({
						start: {
							line:
								allText.slice(0, match.index).split("\n")
									.length - 1,
							ch:
								match.index -
								allText
									.slice(0, match.index)
									.lastIndexOf("\n") -
								1,
						},
						end: {
							line:
								allText.slice(0, match.index).split("\n")
									.length - 1,
							ch:
								match.index +
								textToSelect.length -
								allText
									.slice(0, match.index)
									.lastIndexOf("\n") -
								1,
						},
					});
				}

				if (selections.length > 0) {
					editor.setSelections(
						selections.map((sel) => {
							return { anchor: sel.start, head: sel.end };
						})
					);
				}
			}
		}
		return true;
	}

	// Command Handler for transforming selection to uppercase
	private handleTextCommands(checking: boolean, command: string) {
		if (!checking) {
			const view = this.app.workspace.getActiveViewOfType(MarkdownView);
			if (view?.editor) {
				const editor = view.editor;
				const selectedText = editor.getSelection();
				let transformedText;

				switch (command) {
					case "uppercase":
						transformedText = selectedText.toUpperCase();
						break;
					case "lowercase":
						transformedText = selectedText.toLowerCase();
						break;
					case "titlecase":
						transformedText = selectedText
							.split(" ")
							.map(
								(word) =>
									word.charAt(0).toUpperCase() +
									word.slice(1).toLowerCase()
							)
							.join(" ");
						break;
					default:
						return true; // No action taken
				}

				editor.replaceSelection(transformedText);
			}
		}
		return true;
	}

	// Command Handler for toggling case of the selection
	private handleToggleCase(checking: boolean) {
		if (!checking) {
			const view = this.app.workspace.getActiveViewOfType(MarkdownView);
			if (view?.editor) {
				const editor = view.editor;
				const selectedText = editor.getSelection();
				const toggled = selectedText
					.split("")
					.map((char) => {
						return char === char.toUpperCase()
							? char.toLowerCase()
							: char.toUpperCase();
					})
					.join("");
				editor.replaceSelection(toggled);
			}
		}
		return true;
	}
}
