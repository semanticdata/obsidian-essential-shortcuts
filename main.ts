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

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon(
			"dice",
			"Sample Plugin",
			(evt: MouseEvent) => {
				// Called when the user clicks the icon.
				new Notice("This is a notice!");
			}
		);
		// Perform additional things with the ribbon
		ribbonIconEl.addClass("my-plugin-ribbon-class");

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText("Status Bar Text");

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: "open-sample-modal-simple",
			name: "Open sample modal (simple)",
			callback: () => {
				new SampleModal(this.app).open();
			},
		});
		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: "sample-editor-command",
			name: "Sample editor command",
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log(editor.getSelection());
				editor.replaceSelection("Sample Editor Command");
			},
		});
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: "open-sample-modal-complex",
			name: "Open sample modal (complex)",
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView =
					this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new SampleModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			},
		});

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

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, "click", (evt: MouseEvent) => {
			console.log("click", evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(
			window.setInterval(() => console.log("setInterval"), 5 * 60 * 1000)
		);
	}

	onunload() {}

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

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.setText("Woah!");
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
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
