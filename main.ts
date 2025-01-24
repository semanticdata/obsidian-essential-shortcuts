import {
	App,
	Editor,
	MarkdownView,
	Modal,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
} from "obsidian";

// Remember to rename these classes and interfaces!

interface EssentialShortcutsSettings {
	enableDuplicateLineDown: boolean;
	enableDuplicateLineUp: boolean;
	enableSelectLine: boolean;
	enableInsertCursorBelow: boolean;
	enableInsertCursorAbove: boolean;
}

const DEFAULT_SETTINGS: EssentialShortcutsSettings = {
	enableDuplicateLineDown: true,
	enableDuplicateLineUp: true,
	enableSelectLine: true,
	enableInsertCursorBelow: true,
	enableInsertCursorAbove: true,
};

export default class EssentialShortcuts extends Plugin {
	settings: EssentialShortcutsSettings;
	private selectLineCount: number = 0;
	private lastSelectedLine: number = -1;

	async onload() {
		await this.loadSettings();

		// Add command to duplicate line downward
		this.addCommand({
			id: "duplicate-line-down",
			name: "Duplicate line down",
			hotkeys: [{ modifiers: ["Alt", "Shift"], key: "ArrowDown" }],
			checkCallback: (checking: boolean) => {
				if (this.settings.enableDuplicateLineDown) {
					if (!checking) {
						const view =
							this.app.workspace.getActiveViewOfType(
								MarkdownView
							);
						if (view?.editor) {
							const editor = view.editor;
							const cursor = editor.getCursor();
							const line = editor.getLine(cursor.line);
							editor.replaceRange(
								"\n" + line,
								{ line: cursor.line, ch: line.length },
								{ line: cursor.line, ch: line.length }
							);
							editor.setCursor({
								line: cursor.line + 1,
								ch: cursor.ch,
							});
						}
					}
					return true;
				}
				return false;
			},
		});

		// Add command to duplicate line upward
		this.addCommand({
			id: "duplicate-line-up",
			name: "Duplicate line up",
			hotkeys: [{ modifiers: ["Alt", "Shift"], key: "ArrowUp" }],
			checkCallback: (checking: boolean) => {
				if (this.settings.enableDuplicateLineUp) {
					if (!checking) {
						const view =
							this.app.workspace.getActiveViewOfType(
								MarkdownView
							);
						if (view?.editor) {
							const editor = view.editor;
							const cursor = editor.getCursor();
							const line = editor.getLine(cursor.line);
							editor.replaceRange(
								line + "\n",
								{ line: cursor.line, ch: 0 },
								{ line: cursor.line, ch: 0 }
							);
							editor.setCursor({
								line: cursor.line,
								ch: cursor.ch,
							});
						}
					}
					return true;
				}
				return false;
			},
		});

		// Add command to select the current line and expand selection
		this.addCommand({
			id: "select-line",
			name: "Select Current Line",
			hotkeys: [{ modifiers: ["Ctrl"], key: "L" }],
			checkCallback: (checking: boolean) => {
				if (this.settings.enableSelectLine) {
					if (!checking) {
						const view =
							this.app.workspace.getActiveViewOfType(
								MarkdownView
							);
						if (view?.editor) {
							const editor = view.editor;
							const cursor = editor.getCursor();
							const currentLine = cursor.line;

							// Reset count if we're on a different line or no selection exists
							if (!editor.somethingSelected()) {
								this.selectLineCount = 0;
								this.lastSelectedLine = currentLine;
							}

							// If this is the first press, select the current line
							if (this.selectLineCount === 0) {
								editor.setSelection(
									{ line: this.lastSelectedLine, ch: 0 },
									{ line: this.lastSelectedLine + 1, ch: 0 }
								);
							} else {
								// Expand selection downwards by one more line
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
				return false;
			},
		});

		// Add command to insert a cursor below
		this.addCommand({
			id: "insert-cursor-below",
			name: "Insert Cursor Below",
			hotkeys: [{ modifiers: ["Ctrl", "Alt"], key: "ArrowDown" }],
			checkCallback: (checking: boolean) => {
				if (this.settings.enableInsertCursorBelow) {
					if (!checking) {
						const view =
							this.app.workspace.getActiveViewOfType(
								MarkdownView
							);
						if (view?.editor) {
							const editor = view.editor;
							const cursor = editor.getCursor();
							editor.setCursor({
								line: cursor.line + 1,
								ch: cursor.ch,
							});
						}
					}
					return true;
				}
				return false;
			},
		});

		// Add command to insert a cursor above
		this.addCommand({
			id: "insert-cursor-above",
			name: "Insert Cursor Above",
			hotkeys: [{ modifiers: ["Ctrl", "Alt"], key: "ArrowUp" }],
			checkCallback: (checking: boolean) => {
				if (this.settings.enableInsertCursorAbove) {
					if (!checking) {
						const view =
							this.app.workspace.getActiveViewOfType(
								MarkdownView
							);
						if (view?.editor) {
							const editor = view.editor;
							const cursor = editor.getCursor();
							editor.setCursor({
								line: cursor.line - 1,
								ch: cursor.ch,
							});
						}
					}
					return true;
				}
				return false;
			},
		});

		// Register an event to reset the line count when clicking elsewhere
		this.registerDomEvent(document, "mousedown", () => {
			this.selectLineCount = 0;
			this.lastSelectedLine = -1;
		});

		// Add the settings tab
		this.addSettingTab(new EssentialShortcutsSettingTab(this.app, this));
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
}

class EssentialShortcutsSettingTab extends PluginSettingTab {
	plugin: EssentialShortcuts;

	constructor(app: App, plugin: EssentialShortcuts) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		containerEl.createEl("h2", { text: "Essential Shortcuts Settings" });

		new Setting(containerEl)
			.setName("Duplicate Line Up")
			.setDesc(
				"Enable the command to duplicate the current line upward (Alt + Shift + Up)"
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.enableDuplicateLineUp)
					.onChange(async (value) => {
						this.plugin.settings.enableDuplicateLineUp = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Duplicate Line Down")
			.setDesc(
				"Enable the command to duplicate the current line downward (Alt + Shift + Down)"
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.enableDuplicateLineDown)
					.onChange(async (value) => {
						this.plugin.settings.enableDuplicateLineDown = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Select Line")
			.setDesc(
				"Enable the command to select the current line and expand selection (Ctrl + L)"
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.enableSelectLine)
					.onChange(async (value) => {
						this.plugin.settings.enableSelectLine = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Insert Cursor Above")
			.setDesc(
				"Enable the command to insert a cursor above (Ctrl + Alt + Up)"
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.enableInsertCursorAbove)
					.onChange(async (value) => {
						this.plugin.settings.enableInsertCursorAbove = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Insert Cursor Below")
			.setDesc(
				"Enable the command to insert a cursor below (Ctrl + Alt + Down)"
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.enableInsertCursorBelow)
					.onChange(async (value) => {
						this.plugin.settings.enableInsertCursorBelow = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
