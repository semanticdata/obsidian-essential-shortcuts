import { CommandDefinition } from '../src/types';
import { Hotkey, Editor } from 'obsidian';

describe('Types', () => {
  describe('CommandDefinition', () => {
    it('should allow valid command definition with handler', () => {
      const command: CommandDefinition = {
        id: 'test-command',
        name: 'Test Command',
        handler: (checking: boolean) => true
      };

      expect(command.id).toBe('test-command');
      expect(command.name).toBe('Test Command');
      expect(typeof command.handler).toBe('function');
      expect(command.handler?.(true)).toBe(true);
    });

    it('should allow valid command definition with editorCallback', () => {
      const mockEditor = {} as Editor;
      const editorCallback = jest.fn();

      const command: CommandDefinition = {
        id: 'test-editor-command',
        name: 'Test Editor Command',
        editorCallback: editorCallback
      };

      expect(command.id).toBe('test-editor-command');
      expect(command.name).toBe('Test Editor Command');
      expect(typeof command.editorCallback).toBe('function');

      command.editorCallback?.(mockEditor);
      expect(editorCallback).toHaveBeenCalledWith(mockEditor);
    });

    it('should allow command definition with hotkeys', () => {
      const hotkeys: Hotkey[] = [
        { modifiers: ['Ctrl'], key: 'D' },
        { modifiers: ['Ctrl', 'Shift'], key: 'D' }
      ];

      const command: CommandDefinition = {
        id: 'test-hotkeys',
        name: 'Test Hotkeys',
        hotkeys: hotkeys,
        handler: () => true
      };

      expect(command.hotkeys).toEqual(hotkeys);
      expect(command.hotkeys?.length).toBe(2);
      expect(command.hotkeys?.[0].modifiers).toEqual(['Ctrl']);
      expect(command.hotkeys?.[0].key).toBe('D');
    });

    it('should allow command definition with category', () => {
      const command: CommandDefinition = {
        id: 'test-category',
        name: 'Test Category',
        category: 'Text Operations',
        handler: () => true
      };

      expect(command.category).toBe('Text Operations');
    });

    it('should allow command definition with all optional properties', () => {
      const command: CommandDefinition = {
        id: 'test-full',
        name: 'Test Full Command',
        hotkeys: [{ modifiers: ['Alt'], key: 'F' }],
        category: 'Full Category',
        handler: (checking: boolean) => !checking,
        editorCallback: (editor: Editor) => { }
      };

      expect(command.id).toBe('test-full');
      expect(command.name).toBe('Test Full Command');
      expect(command.hotkeys).toBeDefined();
      expect(command.category).toBe('Full Category');
      expect(command.handler).toBeDefined();
      expect(command.editorCallback).toBeDefined();
    });

    it('should allow minimal command definition', () => {
      const command: CommandDefinition = {
        id: 'minimal',
        name: 'Minimal Command'
      };

      expect(command.id).toBe('minimal');
      expect(command.name).toBe('Minimal Command');
      expect(command.hotkeys).toBeUndefined();
      expect(command.category).toBeUndefined();
      expect(command.handler).toBeUndefined();
      expect(command.editorCallback).toBeUndefined();
    });

    it('should handle handler function with boolean parameter and return', () => {
      const handler = jest.fn((checking: boolean) => {
        if (checking) {
          return true; // Command is available
        }
        // Execute command logic
        return true;
      });

      const command: CommandDefinition = {
        id: 'test-handler-logic',
        name: 'Test Handler Logic',
        handler: handler
      };

      // Test checking mode
      expect(command.handler?.(true)).toBe(true);
      expect(handler).toHaveBeenCalledWith(true);

      // Test execution mode
      expect(command.handler?.(false)).toBe(true);
      expect(handler).toHaveBeenCalledWith(false);

      expect(handler).toHaveBeenCalledTimes(2);
    });

    it('should handle editorCallback with Editor parameter', () => {
      const editorCallback = jest.fn((editor: Editor) => {
        // Mock some editor operations
        editor.getCursor?.();
        editor.getSelection?.();
      });

      const mockEditor = {
        getCursor: jest.fn(() => ({ line: 0, ch: 0 })),
        getSelection: jest.fn(() => 'selected text')
      } as unknown as Editor;

      const command: CommandDefinition = {
        id: 'test-editor-callback',
        name: 'Test Editor Callback',
        editorCallback: editorCallback
      };

      command.editorCallback?.(mockEditor);

      expect(editorCallback).toHaveBeenCalledWith(mockEditor);
      expect(mockEditor.getCursor).toHaveBeenCalled();
      expect(mockEditor.getSelection).toHaveBeenCalled();
    });
  });
});