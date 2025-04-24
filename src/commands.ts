import { Editor, MarkdownView, Plugin } from "obsidian";
import { CommandDefinition } from "./types";

export function getCommands(plugin: Plugin): CommandDefinition[] {
    return [
        {
            id: "duplicate-line-down",
            name: "Duplicate line down",
            category: "Line Operations",
            hotkeys: [{ modifiers: ["Alt", "Shift"], key: "ArrowDown" }],
            handler: (checking: boolean) => handleDuplicateLineDown(plugin, checking),
        },
        {
            id: "duplicate-line-up",
            name: "Duplicate line up",
            category: "Line Operations",
            hotkeys: [{ modifiers: ["Alt", "Shift"], key: "ArrowUp" }],
            handler: (checking: boolean) => handleDuplicateLineUp(plugin, checking),
        },
        {
            id: "select-line",
            name: "Select Current Line",
            category: "Selection",
            hotkeys: [{ modifiers: ["Ctrl"], key: "L" }],
            handler: (checking: boolean) => handleSelectLine(plugin, checking),
        },
        {
            id: "insert-cursor-below",
            name: "Insert Cursor Below",
            category: "Cursor Operations",
            hotkeys: [{ modifiers: ["Ctrl", "Alt"], key: "ArrowDown" }],
            handler: (checking: boolean) => handleInsertCursorBelow(plugin, checking),
        },
        {
            id: "insert-cursor-above",
            name: "Insert Cursor Above",
            category: "Cursor Operations",
            hotkeys: [{ modifiers: ["Ctrl", "Alt"], key: "ArrowUp" }],
            handler: (checking: boolean) => handleInsertCursorAbove(plugin, checking),
        },
        {
            id: "insert-line-above",
            name: "Insert Line Above",
            category: "Line Operations",
            hotkeys: [{ modifiers: ["Ctrl", "Shift"], key: "Enter" }],
            handler: (checking: boolean) => handleInsertLineAbove(plugin, checking),
        },
        {
            id: "insert-line-below",
            name: "Insert Line Below",
            category: "Line Operations",
            hotkeys: [{ modifiers: ["Ctrl"], key: "Enter" }],
            handler: (checking: boolean) => handleInsertLineBelow(plugin, checking),
        },
        {
            id: "select-word-or-expand",
            name: "Select Current Word or Expand Selection",
            category: "Selection",
            hotkeys: [{ modifiers: ["Ctrl"], key: "D" }],
            handler: (checking: boolean) => handleSelectWordOrExpand(plugin, checking),
        },
        {
            id: "select-all-occurrences",
            name: "Select All Occurrences",
            category: "Selection",
            hotkeys: [{ modifiers: ["Ctrl", "Shift"], key: "L" }],
            handler: (checking: boolean) => handleSelectAllOccurrences(plugin, checking),
        },
        {
            id: "transform-to-uppercase",
            name: "Transform Selection to Uppercase",
            category: "Text Transformation",
            handler: (checking: boolean) => handleTextCommands(plugin, checking, "uppercase"),
        },
        {
            id: "transform-to-lowercase",
            name: "Transform Selection to Lowercase",
            category: "Text Transformation",
            handler: (checking: boolean) => handleTextCommands(plugin, checking, "lowercase"),
        },
        {
            id: "transform-to-titlecase",
            name: "Transform Selection to Title Case",
            category: "Text Transformation",
            handler: (checking: boolean) => handleTextCommands(plugin, checking, "titlecase"),
        },
        {
            id: "toggle-case",
            name: "Toggle Case of Selection",
            category: "Text Transformation",
            handler: (checking: boolean) => handleToggleCase(plugin, checking),
        },
        {
            id: "sort-selected-lines",
            name: "Sort Selected Lines Alphabetically",
            category: "Line Operations",
            editorCallback: (editor: Editor) => sortSelectedLines(editor, false),
            handler: () => true,
        },
        {
            id: "sort-selected-lines-reverse",
            name: "Sort Selected Lines in Reverse Alphabetical Order",
            category: "Line Operations",
            editorCallback: (editor: Editor) => sortSelectedLines(editor, true),
            handler: () => true,
        },
    ];
}

function getActiveEditor(plugin: Plugin) {
    const view = plugin.app.workspace.getActiveViewOfType(MarkdownView);
    return view?.editor;
}

function handleDuplicateLineDown(plugin: Plugin, checking: boolean) {
    if (!checking) {
        const editor = getActiveEditor(plugin);
        if (editor) {
            const selections = editor.listSelections();
            const newSelections: { anchor: { line: number; ch: number }; head: { line: number; ch: number } }[] = [];
            selections.forEach((selection) => {
                const startLine = Math.min(selection.anchor.line, selection.head.line);
                const endLine = Math.max(selection.anchor.line, selection.head.line);
                const linesToDuplicate: string[] = [];
                for (let i = startLine; i <= endLine; i++) {
                    linesToDuplicate.push(editor.getLine(i));
                }
                editor.replaceRange("\n" + linesToDuplicate.join("\n"), {
                    line: endLine,
                    ch: editor.getLine(endLine).length,
                });
                const linesCount = endLine - startLine + 1;
                newSelections.push({
                    anchor: {
                        line: endLine + 1,
                        ch: selection.anchor.line === startLine ? selection.anchor.ch : 0,
                    },
                    head: {
                        line: endLine + linesCount,
                        ch: selection.head.line === endLine ? selection.head.ch : editor.getLine(endLine).length,
                    },
                });
            });
            editor.setSelections(newSelections);
        }
    }
    return true;
}

function handleDuplicateLineUp(plugin: Plugin, checking: boolean) {
    if (!checking) {
        const editor = getActiveEditor(plugin);
        if (editor) {
            const selections = editor.listSelections();
            const newSelections: { anchor: { line: number; ch: number }; head: { line: number; ch: number } }[] = [];
            selections.forEach((selection) => {
                const startLine = Math.min(selection.anchor.line, selection.head.line);
                const endLine = Math.max(selection.anchor.line, selection.head.line);
                const linesToDuplicate: string[] = [];
                for (let i = startLine; i <= endLine; i++) {
                    linesToDuplicate.push(editor.getLine(i));
                }
                editor.replaceRange(linesToDuplicate.join("\n") + "\n", {
                    line: startLine,
                    ch: 0,
                });
                const linesCount = endLine - startLine + 1;
                newSelections.push({
                    anchor: {
                        line: startLine,
                        ch: selection.anchor.line === startLine ? selection.anchor.ch : 0,
                    },
                    head: {
                        line: startLine + linesCount - 1,
                        ch: selection.head.line === endLine ? selection.head.ch : editor.getLine(endLine).length,
                    },
                });
            });
            editor.setSelections(newSelections);
        }
    }
    return true;
}

function handleSelectLine(plugin: Plugin, checking: boolean) {
    if (!checking) {
        const editor = getActiveEditor(plugin);
        if (editor) {
            const cursor = editor.getCursor();
            const currentLine = cursor.line;
            if (!editor.somethingSelected()) {
                // Reset state if needed
            }
            editor.setSelection(
                { line: currentLine, ch: 0 },
                { line: currentLine + 1, ch: 0 }
            );
        }
    }
    return true;
}

function handleInsertCursorBelow(plugin: Plugin, checking: boolean) {
    if (!checking) {
        const editor = getActiveEditor(plugin);
        if (editor) {
            const newCursors = editor.listSelections().map((selection) => selection.anchor);
            for (const selection of editor.listSelections()) {
                const lineBelow = selection.anchor.line + 1;
                if (lineBelow < editor.lineCount()) {
                    const lineBelowLength = editor.getLine(lineBelow).length;
                    const newCh = Math.min(selection.anchor.ch, lineBelowLength);
                    newCursors.push({ line: lineBelow, ch: newCh });
                }
            }
            editor.setSelections(newCursors.map((pos) => ({ anchor: pos, head: pos })));
            editor.focus();
        }
    }
    return true;
}

function handleInsertCursorAbove(plugin: Plugin, checking: boolean) {
    if (!checking) {
        const editor = getActiveEditor(plugin);
        if (editor) {
            const newCursors = editor.listSelections().map((selection) => selection.anchor);
            for (const selection of editor.listSelections()) {
                const lineAbove = selection.anchor.line - 1;
                if (lineAbove >= 0) {
                    const lineAboveLength = editor.getLine(lineAbove).length;
                    const newCh = Math.min(selection.anchor.ch, lineAboveLength);
                    newCursors.push({ line: lineAbove, ch: newCh });
                }
            }
            editor.setSelections(newCursors.map((pos) => ({ anchor: pos, head: pos })));
            editor.focus();
        }
    }
    return true;
}

function handleInsertLineAbove(plugin: Plugin, checking: boolean) {
    if (!checking) {
        const editor = getActiveEditor(plugin);
        if (editor) {
            const cursor = editor.getCursor();
            editor.replaceRange("\n", { line: cursor.line, ch: 0 });
            editor.setCursor({ line: cursor.line, ch: 0 });
        }
    }
    return true;
}

function handleInsertLineBelow(plugin: Plugin, checking: boolean) {
    if (!checking) {
        const editor = getActiveEditor(plugin);
        if (editor) {
            const cursor = editor.getCursor();
            editor.replaceRange("\n", { line: cursor.line + 1, ch: 0 });
            editor.setCursor({ line: cursor.line + 1, ch: 0 });
        }
    }
    return true;
}

function handleSelectWordOrExpand(plugin: Plugin, checking: boolean) {
    if (!checking) {
        const editor = getActiveEditor(plugin);
        if (editor) {
            const cursor = editor.getCursor();
            const line = editor.getLine(cursor.line);
            const selectedText = editor.getSelection();
            if (selectedText) {
                const newSelections = editor.listSelections();
                const lastSelection = newSelections[newSelections.length - 1];
                const lastEndIndex = lastSelection.head.ch;
                const nextIndex = line.indexOf(selectedText, lastEndIndex);
                if (nextIndex !== -1) {
                    newSelections.push({
                        anchor: { line: cursor.line, ch: nextIndex },
                        head: { line: cursor.line, ch: nextIndex + selectedText.length },
                    });
                    editor.setSelections(newSelections);
                }
            } else {
                const wordStart = line.lastIndexOf(" ", cursor.ch - 1) + 1;
                const wordEnd = line.indexOf(" ", cursor.ch);
                const word = line.slice(wordStart, wordEnd === -1 ? line.length : wordEnd);
                editor.setSelection(
                    { line: cursor.line, ch: wordStart },
                    { line: cursor.line, ch: wordStart + word.length }
                );
            }
        }
    }
    return true;
}

function handleSelectAllOccurrences(plugin: Plugin, checking: boolean) {
    if (!checking) {
        const editor = getActiveEditor(plugin);
        if (editor) {
            const cursor = editor.getCursor();
            const line = editor.getLine(cursor.line);
            const selectedText = editor.getSelection();
            let textToSelect;
            if (selectedText) {
                textToSelect = selectedText;
            } else {
                const wordStart = line.lastIndexOf(" ", cursor.ch - 1) + 1;
                const wordEnd = line.indexOf(" ", cursor.ch);
                textToSelect = line.slice(wordStart, wordEnd === -1 ? line.length : wordEnd);
            }
            const allText = editor.getValue();
            const regex = new RegExp(textToSelect, "g");
            let match;
            const selections = [];
            while ((match = regex.exec(allText)) !== null) {
                selections.push({
                    start: {
                        line: allText.slice(0, match.index).split("\n").length - 1,
                        ch: match.index - allText.slice(0, match.index).lastIndexOf("\n") - 1,
                    },
                    end: {
                        line: allText.slice(0, match.index).split("\n").length - 1,
                        ch: match.index + textToSelect.length - allText.slice(0, match.index).lastIndexOf("\n") - 1,
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

function handleTextCommands(plugin: Plugin, checking: boolean, command: string) {
    if (!checking) {
        const editor = getActiveEditor(plugin);
        if (editor) {
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
                        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                        .join(" ");
                    break;
                default:
                    return true;
            }
            editor.replaceSelection(transformedText);
        }
    }
    return true;
}

function handleToggleCase(plugin: Plugin, checking: boolean) {
    if (!checking) {
        const editor = getActiveEditor(plugin);
        if (editor) {
            const selectedText = editor.getSelection();
            const toggled = selectedText
                .split("")
                .map((char) => (char === char.toUpperCase() ? char.toLowerCase() : char.toUpperCase()))
                .join("");
            editor.replaceSelection(toggled);
        }
    }
    return true;
}

function sortSelectedLines(editor: Editor, reverse: boolean) {
    const selections = editor.listSelections();
    selections.forEach((selection) => {
        const startLine = selection.anchor.line;
        const endLine = selection.head.line;
        const actualStartLine = Math.min(startLine, endLine);
        const actualEndLine = Math.max(startLine, endLine);
        const lines = [];
        for (let i = actualStartLine; i <= actualEndLine; i++) {
            lines.push(editor.getLine(i));
        }
        const sortedLines = lines.sort((a, b) => reverse ? b.localeCompare(a) : a.localeCompare(b));
        editor.replaceRange(
            sortedLines.join("\n"),
            { line: actualStartLine, ch: 0 },
            {
                line: actualEndLine,
                ch: editor.getLine(actualEndLine).length,
            }
        );
    });
}
