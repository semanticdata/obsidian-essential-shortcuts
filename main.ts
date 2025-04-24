import { Plugin } from "obsidian";
import { getCommands } from "./src/commands";
import { CommandDefinition } from "./src/types";

export default class EssentialShortcuts extends Plugin {
	async onload() {
		const commands: CommandDefinition[] = getCommands(this);
		commands.forEach((cmd) => {
			if (cmd.editorCallback) {
				this.addCommand({
					id: cmd.id,
					name: cmd.name,
					hotkeys: cmd.hotkeys,
					editorCallback: cmd.editorCallback,
				});
			} else if (cmd.handler) {
				this.addCommand({
					id: cmd.id,
					name: cmd.name,
					hotkeys: cmd.hotkeys,
					checkCallback: cmd.handler,
				});
			}
		});

	}
}
