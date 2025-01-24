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
}

const DEFAULT_SETTINGS: EssentialShortcutsSettings = {
	enableDuplicateLineDown: true,
	enableDuplicateLineUp: true,
};

export default class EssentialShortcuts extends Plugin {
	settings: EssentialShortcutsSettings;

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
			.setName("Enable Duplicate Line Down")
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
			.setName("Enable Duplicate Line Up")
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
	}
}
