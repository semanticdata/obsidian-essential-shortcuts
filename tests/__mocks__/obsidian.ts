// Manual mock for Obsidian API

export class Plugin {
  app: any;
  addCommand = jest.fn();

  constructor(app: any, manifest: any) {
    this.app = app;
  }

  async onload() { }
  onunload() { }
}

export class MarkdownView {
  editor: any;
}

export class Editor {
  getCursor = jest.fn();
  setCursor = jest.fn();
  getSelection = jest.fn();
  setSelection = jest.fn();
  setSelections = jest.fn();
  listSelections = jest.fn();
  replaceSelection = jest.fn();
  replaceRange = jest.fn();
  getLine = jest.fn();
  getValue = jest.fn();
  lineCount = jest.fn();
  somethingSelected = jest.fn();
  scrollIntoView = jest.fn();
  focus = jest.fn();
}

export interface Hotkey {
  modifiers: string[];
  key: string;
}