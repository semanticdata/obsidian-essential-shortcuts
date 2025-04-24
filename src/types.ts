import { Hotkey, Editor } from "obsidian";

export interface CommandDefinition {
    id: string;
    name: string;
    hotkeys?: Hotkey[];
    category?: string;
    handler?: (checking: boolean) => boolean;
    editorCallback?: (editor: Editor) => void;
}
