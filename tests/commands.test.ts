import { getCommands } from '../src/commands';
import { CommandDefinition } from '../src/types';

describe('Commands', () => {
  let mockPlugin: any;
  let mockEditor: any;
  let commands: CommandDefinition[];

  beforeEach(() => {
    mockEditor = {
      getCursor: jest.fn(() => ({ line: 0, ch: 0 })),
      setCursor: jest.fn(),
      getSelection: jest.fn(() => ''),
      setSelection: jest.fn(),
      setSelections: jest.fn(),
      listSelections: jest.fn(() => [{ anchor: { line: 0, ch: 0 }, head: { line: 0, ch: 0 } }]),
      replaceSelection: jest.fn(),
      replaceRange: jest.fn(),
      getLine: jest.fn(() => 'test line'),
      getValue: jest.fn(() => 'test content'),
      lineCount: jest.fn(() => 10),
      somethingSelected: jest.fn(() => false),
      scrollIntoView: jest.fn(),
      focus: jest.fn()
    };

    const mockMarkdownView = {
      editor: mockEditor
    };

    mockPlugin = {
      app: {
        workspace: {
          getActiveViewOfType: jest.fn(() => mockMarkdownView)
        }
      }
    };

    commands = getCommands(mockPlugin);
  });

  describe('getCommands', () => {
    it('should return an array of command definitions', () => {
      expect(Array.isArray(commands)).toBe(true);
      expect(commands.length).toBeGreaterThan(0);
    });

    it('should have all required properties for each command', () => {
      commands.forEach(cmd => {
        expect(cmd).toHaveProperty('id');
        expect(cmd).toHaveProperty('name');
        expect(typeof cmd.id).toBe('string');
        expect(typeof cmd.name).toBe('string');
      });
    });

    it('should include duplicate line down command', () => {
      const duplicateDownCmd = commands.find(cmd => cmd.id === 'duplicate-line-down');
      expect(duplicateDownCmd).toBeDefined();
      expect(duplicateDownCmd?.name).toBe('Duplicate line down');
      expect(duplicateDownCmd?.hotkeys).toEqual([{ modifiers: ['Alt', 'Shift'], key: 'ArrowDown' }]);
    });

    it('should include select line command', () => {
      const selectLineCmd = commands.find(cmd => cmd.id === 'select-line');
      expect(selectLineCmd).toBeDefined();
      expect(selectLineCmd?.name).toBe('Select Current Line');
      expect(selectLineCmd?.hotkeys).toEqual([{ modifiers: ['Ctrl'], key: 'L' }]);
    });
  });

  describe('Command Handlers', () => {
    describe('duplicate-line-down', () => {
      it('should return true when checking', () => {
        const cmd = commands.find(cmd => cmd.id === 'duplicate-line-down');
        expect(cmd?.handler?.(true)).toBe(true);
      });

      it('should duplicate line down when not checking', () => {
        mockEditor.getLine.mockReturnValue('test line');
        mockEditor.listSelections.mockReturnValue([
          { anchor: { line: 0, ch: 0 }, head: { line: 0, ch: 0 } }
        ]);

        const cmd = commands.find(cmd => cmd.id === 'duplicate-line-down');
        const result = cmd?.handler?.(false);

        expect(result).toBe(true);
        expect(mockEditor.replaceRange).toHaveBeenCalled();
        expect(mockEditor.setSelections).toHaveBeenCalled();
      });
    });

    describe('select-line', () => {
      it('should select current line when not checking', () => {
        mockEditor.getCursor.mockReturnValue({ line: 2, ch: 5 });
        mockEditor.somethingSelected.mockReturnValue(false);

        const cmd = commands.find(cmd => cmd.id === 'select-line');
        const result = cmd?.handler?.(false);

        expect(result).toBe(true);
        expect(mockEditor.setSelection).toHaveBeenCalledWith(
          { line: 2, ch: 0 },
          { line: 3, ch: 0 }
        );
      });
    });

    describe('transform-to-uppercase', () => {
      it('should transform selected text to uppercase', () => {
        mockEditor.getSelection.mockReturnValue('hello world');

        const cmd = commands.find(cmd => cmd.id === 'transform-to-uppercase');
        const result = cmd?.handler?.(false);

        expect(result).toBe(true);
        expect(mockEditor.replaceSelection).toHaveBeenCalledWith('HELLO WORLD');
      });
    });

    describe('transform-to-lowercase', () => {
      it('should transform selected text to lowercase', () => {
        mockEditor.getSelection.mockReturnValue('HELLO WORLD');

        const cmd = commands.find(cmd => cmd.id === 'transform-to-lowercase');
        const result = cmd?.handler?.(false);

        expect(result).toBe(true);
        expect(mockEditor.replaceSelection).toHaveBeenCalledWith('hello world');
      });
    });

    describe('transform-to-titlecase', () => {
      it('should transform selected text to title case', () => {
        mockEditor.getSelection.mockReturnValue('hello world test');

        const cmd = commands.find(cmd => cmd.id === 'transform-to-titlecase');
        const result = cmd?.handler?.(false);

        expect(result).toBe(true);
        expect(mockEditor.replaceSelection).toHaveBeenCalledWith('Hello World Test');
      });
    });

    describe('toggle-case', () => {
      it('should toggle case of selected text', () => {
        mockEditor.getSelection.mockReturnValue('HeLLo WoRLd');

        const cmd = commands.find(cmd => cmd.id === 'toggle-case');
        const result = cmd?.handler?.(false);

        expect(result).toBe(true);
        expect(mockEditor.replaceSelection).toHaveBeenCalledWith('hEllO wOrlD');
      });
    });

    describe('jump-to-next-heading', () => {
      it('should jump to next heading', () => {
        mockEditor.getCursor.mockReturnValue({ line: 1, ch: 0 });
        mockEditor.lineCount.mockReturnValue(5);
        mockEditor.getLine
          .mockReturnValueOnce('regular text')
          .mockReturnValueOnce('## Heading 2')
          .mockReturnValueOnce('more text');

        const cmd = commands.find(cmd => cmd.id === 'jump-to-next-heading');
        const result = cmd?.handler?.(false);

        expect(result).toBe(true);
        expect(mockEditor.setCursor).toHaveBeenCalledWith({ line: 3, ch: 12 });
        expect(mockEditor.scrollIntoView).toHaveBeenCalled();
      });
    });

    describe('jump-to-previous-heading', () => {
      it('should jump to previous heading', () => {
        mockEditor.getCursor.mockReturnValue({ line: 3, ch: 0 });
        mockEditor.getLine
          .mockReturnValueOnce('regular text')  // line 2
          .mockReturnValueOnce('# Heading 1')   // line 1
          .mockReturnValueOnce('regular text'); // line 0

        const cmd = commands.find(cmd => cmd.id === 'jump-to-previous-heading');
        const result = cmd?.handler?.(false);

        expect(result).toBe(true);
        expect(mockEditor.setCursor).toHaveBeenCalledWith({ line: 1, ch: 11 });
        expect(mockEditor.scrollIntoView).toHaveBeenCalled();
      });
    });
  });

  describe('Editor Callbacks', () => {
    describe('sort-selected-lines', () => {
      it('should sort selected lines alphabetically', () => {
        mockEditor.listSelections.mockReturnValue([
          { anchor: { line: 0, ch: 0 }, head: { line: 2, ch: 0 } }
        ]);
        mockEditor.getLine
          .mockReturnValueOnce('zebra')  // line 0
          .mockReturnValueOnce('apple')  // line 1
          .mockReturnValueOnce('banana') // line 2
          .mockReturnValueOnce('banana'); // called again for length

        const cmd = commands.find(cmd => cmd.id === 'sort-selected-lines');
        cmd?.editorCallback?.(mockEditor);

        expect(mockEditor.replaceRange).toHaveBeenCalledWith(
          'apple\nbanana\nzebra',
          { line: 0, ch: 0 },
          { line: 2, ch: 6 }
        );
      });
    });

    describe('sort-selected-lines-reverse', () => {
      it('should sort selected lines in reverse alphabetical order', () => {
        mockEditor.listSelections.mockReturnValue([
          { anchor: { line: 0, ch: 0 }, head: { line: 2, ch: 0 } }
        ]);
        mockEditor.getLine
          .mockReturnValueOnce('apple')  // line 0
          .mockReturnValueOnce('banana') // line 1
          .mockReturnValueOnce('zebra')  // line 2
          .mockReturnValueOnce('zebra'); // called again for length

        const cmd = commands.find(cmd => cmd.id === 'sort-selected-lines-reverse');
        cmd?.editorCallback?.(mockEditor);

        expect(mockEditor.replaceRange).toHaveBeenCalledWith(
          'zebra\nbanana\napple',
          { line: 0, ch: 0 },
          { line: 2, ch: 5 }
        );
      });
    });
  });
});