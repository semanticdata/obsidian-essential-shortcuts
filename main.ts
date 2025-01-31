import { MarkdownView, Plugin } from "obsidian";

export default class EssentialShortcuts extends Plugin {
	private selectLineCount = 0;
	private lastSelectedLine = -1;
	private lastSelectedWord: string | null = null;

	async onload() {
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

		// Add command to insert a line below
		this.addCommand({
			id: "insert-line-below",
			name: "Insert Line Below",
			hotkeys: [{ modifiers: ["Ctrl"], key: "Enter" }],
			checkCallback: (checking: boolean) =>
				this.handleInsertLineBelow(checking),
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

		// Add command to sort selected lines alphabetically
		this.addCommand({
			id: "sort-selected-lines",
			name: "Sort Selected Lines Alphabetically",
			editorCallback: (editor) => {
				const selections = editor.listSelections();

				selections.forEach((selection) => {
					// Get the start and end positions of the selection
					const startLine = selection.anchor.line;
					const endLine = selection.head.line;

					// Ensure we have the correct range
					const actualStartLine = Math.min(startLine, endLine);
					const actualEndLine = Math.max(startLine, endLine);

					// Extract the lines within the selection
					const lines = [];
					for (let i = actualStartLine; i <= actualEndLine; i++) {
						lines.push(editor.getLine(i));
					}

					// Sort the lines alphabetically
					const sortedLines = lines.sort((a, b) =>
						a.localeCompare(b)
					);

					// Replace the selected text with the sorted lines
					editor.replaceRange(
						sortedLines.join("\n"),
						{ line: actualStartLine, ch: 0 },
						{
							line: actualEndLine,
							ch: editor.getLine(actualEndLine).length,
						}
					);
				});
			},
		});

		// Add command to sort selected lines in reverse alphabetical order
		this.addCommand({
			id: "sort-selected-lines-reverse",
			name: "Sort Selected Lines in Reverse Alphabetical Order",
			editorCallback: (editor) => {
				const selections = editor.listSelections();

				selections.forEach((selection) => {
					// Get the start and end positions of the selection
					const startLine = selection.anchor.line;
					const endLine = selection.head.line;

					// Ensure we have the correct range
					const actualStartLine = Math.min(startLine, endLine);
					const actualEndLine = Math.max(startLine, endLine);

					// Extract the lines within the selection
					const lines = [];
					for (let i = actualStartLine; i <= actualEndLine; i++) {
						lines.push(editor.getLine(i));
					}

					// Sort the lines in reverse alphabetical order
					const sortedLines = lines.sort((a, b) =>
						b.localeCompare(a)
					);

					// Replace the selected text with the sorted lines
					editor.replaceRange(
						sortedLines.join("\n"),
						{ line: actualStartLine, ch: 0 },
						{
							line: actualEndLine,
							ch: editor.getLine(actualEndLine).length,
						}
					);
				});
			},
		});

		// Register an event to reset the line count when clicking elsewhere
		this.registerDomEvent(document, "mousedown", () => {
			this.selectLineCount = 0;
			this.lastSelectedLine = -1;
		});
	}

	// Helper function to get the active editor
	private getActiveEditor() {
		const view = this.app.workspace.getActiveViewOfType(MarkdownView);
		return view?.editor;
	}

	private handleDuplicateLineDown(checking: boolean) {
		if (!checking) {
			const editor = this.getActiveEditor();
			if (editor) {
				const selections = editor.listSelections();
				const newSelections: {
					anchor: { line: number; ch: number };
					head: { line: number; ch: number };
				}[] = [];

				selections.forEach((selection) => {
					// Get start and end lines of selection
					const startLine = Math.min(
						selection.anchor.line,
						selection.head.line
					);
					const endLine = Math.max(
						selection.anchor.line,
						selection.head.line
					);

					// Get the content to duplicate
					const linesToDuplicate: string[] = [];
					for (let i = startLine; i <= endLine; i++) {
						linesToDuplicate.push(editor.getLine(i));
					}

					// Insert duplicated content below the selection
					editor.replaceRange("\n" + linesToDuplicate.join("\n"), {
						line: endLine,
						ch: editor.getLine(endLine).length,
					});

					// Calculate new selection position
					const linesCount = endLine - startLine + 1;
					newSelections.push({
						anchor: {
							line: endLine + 1,
							ch:
								selection.anchor.line === startLine
									? selection.anchor.ch
									: 0,
						},
						head: {
							line: endLine + linesCount,
							ch:
								selection.head.line === endLine
									? selection.head.ch
									: editor.getLine(endLine).length,
						},
					});
				});

				editor.setSelections(newSelections);
			}
		}
		return true;
	}

	private handleDuplicateLineUp(checking: boolean) {
		if (!checking) {
			const editor = this.getActiveEditor();
			if (editor) {
				const selections = editor.listSelections();
				const newSelections: {
					anchor: { line: number; ch: number };
					head: { line: number; ch: number };
				}[] = [];

				selections.forEach((selection) => {
					// Get start and end lines of selection
					const startLine = Math.min(
						selection.anchor.line,
						selection.head.line
					);
					const endLine = Math.max(
						selection.anchor.line,
						selection.head.line
					);

					// Get the content to duplicate
					const linesToDuplicate: string[] = [];
					for (let i = startLine; i <= endLine; i++) {
						linesToDuplicate.push(editor.getLine(i));
					}

					// Insert duplicated content above the selection
					editor.replaceRange(linesToDuplicate.join("\n") + "\n", {
						line: startLine,
						ch: 0,
					});

					// Calculate new selection position
					const linesCount = endLine - startLine + 1;
					newSelections.push({
						anchor: {
							line: startLine,
							ch:
								selection.anchor.line === startLine
									? selection.anchor.ch
									: 0,
						},
						head: {
							line: startLine + linesCount - 1,
							ch:
								selection.head.line === endLine
									? selection.head.ch
									: editor.getLine(endLine).length,
						},
					});
				});

				editor.setSelections(newSelections);
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
					// Get the current selections
					const newSelections = editor.listSelections();
					// Find the last added selection
					const lastSelection =
						newSelections[newSelections.length - 1];
					const lastEndIndex = lastSelection.head.ch;

					// Find the next occurrence of the selected text after the last added selection
					const nextIndex = line.indexOf(selectedText, lastEndIndex);
					if (nextIndex !== -1) {
						// Add the next occurrence to the selection
						newSelections.push({
							anchor: { line: cursor.line, ch: nextIndex },
							head: {
								line: cursor.line,
								ch: nextIndex + selectedText.length,
							},
						});
						editor.setSelections(newSelections);
					}
				} else {
					// Select the current word
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

	private handleInsertLineBelow(checking: boolean) {
		if (!checking) {
			const view = this.app.workspace.getActiveViewOfType(MarkdownView);
			if (view?.editor) {
				const editor = view.editor;
				const cursor = editor.getCursor();
				editor.replaceRange("\n", { line: cursor.line + 1, ch: 0 });
				editor.setCursor({ line: cursor.line + 1, ch: 0 });
			}
		}
		return true;
	}
}
