// Jest setup file

// Mock Obsidian API
const mockEditor = {
  getCursor: jest.fn(),
  setCursor: jest.fn(),
  getSelection: jest.fn(),
  setSelection: jest.fn(),
  setSelections: jest.fn(),
  listSelections: jest.fn(),
  replaceSelection: jest.fn(),
  replaceRange: jest.fn(),
  getLine: jest.fn(),
  getValue: jest.fn(),
  lineCount: jest.fn(),
  somethingSelected: jest.fn(),
  scrollIntoView: jest.fn(),
  focus: jest.fn()
};

const mockMarkdownView = {
  editor: mockEditor
};

const mockWorkspace = {
  getActiveViewOfType: jest.fn(() => mockMarkdownView)
};

const mockApp = {
  workspace: mockWorkspace
};

const mockPlugin = {
  app: mockApp,
  addCommand: jest.fn()
};

// Global mocks
(global as any).mockEditor = mockEditor;
(global as any).mockPlugin = mockPlugin;
(global as any).mockMarkdownView = mockMarkdownView;

// Obsidian module is mocked via manual mock file

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});