import EssentialShortcuts from '../main';
import { getCommands } from '../src/commands';
import { CommandDefinition } from '../src/types';

// Mock the commands module
jest.mock('../src/commands');
const mockGetCommands = getCommands as jest.MockedFunction<typeof getCommands>;

describe('EssentialShortcuts Plugin', () => {
  let plugin: EssentialShortcuts;
  let mockCommands: CommandDefinition[];

  beforeEach(() => {
    // Create mock commands
    mockCommands = [
      {
        id: 'test-editor-command',
        name: 'Test Editor Command',
        editorCallback: jest.fn(),
        hotkeys: [{ modifiers: ['Ctrl'], key: 'T' }]
      },
      {
        id: 'test-handler-command',
        name: 'Test Handler Command',
        handler: jest.fn(() => true),
        hotkeys: [{ modifiers: ['Ctrl', 'Shift'], key: 'T' }]
      },
      {
        id: 'test-no-callback-command',
        name: 'Test No Callback Command',
        // No editorCallback or handler
      }
    ];

    mockGetCommands.mockReturnValue(mockCommands);

    // Create plugin instance
    plugin = new EssentialShortcuts({} as any, {} as any);
    plugin.addCommand = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('onload', () => {
    it('should call getCommands with plugin instance', async () => {
      await plugin.onload();

      expect(mockGetCommands).toHaveBeenCalledWith(plugin);
    });

    it('should add commands with editorCallback', async () => {
      await plugin.onload();

      expect(plugin.addCommand).toHaveBeenCalledWith({
        id: 'test-editor-command',
        name: 'Test Editor Command',
        hotkeys: [{ modifiers: ['Ctrl'], key: 'T' }],
        editorCallback: mockCommands[0].editorCallback
      });
    });

    it('should add commands with handler as checkCallback', async () => {
      await plugin.onload();

      expect(plugin.addCommand).toHaveBeenCalledWith({
        id: 'test-handler-command',
        name: 'Test Handler Command',
        hotkeys: [{ modifiers: ['Ctrl', 'Shift'], key: 'T' }],
        checkCallback: mockCommands[1].handler
      });
    });

    it('should not add commands without editorCallback or handler', async () => {
      await plugin.onload();

      // Should only be called twice (for the two valid commands)
      expect(plugin.addCommand).toHaveBeenCalledTimes(2);

      // Verify it wasn't called with the command that has no callback
      expect(plugin.addCommand).not.toHaveBeenCalledWith(
        expect.objectContaining({ id: 'test-no-callback-command' })
      );
    });

    it('should handle commands with both editorCallback and handler (prioritize editorCallback)', async () => {
      const commandWithBoth: CommandDefinition = {
        id: 'test-both-command',
        name: 'Test Both Command',
        editorCallback: jest.fn(),
        handler: jest.fn(() => true)
      };

      mockGetCommands.mockReturnValue([commandWithBoth]);

      await plugin.onload();

      expect(plugin.addCommand).toHaveBeenCalledWith({
        id: 'test-both-command',
        name: 'Test Both Command',
        hotkeys: undefined,
        editorCallback: commandWithBoth.editorCallback
      });
    });

    it('should handle empty commands array', async () => {
      mockGetCommands.mockReturnValue([]);

      await plugin.onload();

      expect(plugin.addCommand).not.toHaveBeenCalled();
    });

    it('should handle commands without hotkeys', async () => {
      const commandWithoutHotkeys: CommandDefinition = {
        id: 'test-no-hotkeys',
        name: 'Test No Hotkeys',
        handler: jest.fn(() => true)
      };

      mockGetCommands.mockReturnValue([commandWithoutHotkeys]);

      await plugin.onload();

      expect(plugin.addCommand).toHaveBeenCalledWith({
        id: 'test-no-hotkeys',
        name: 'Test No Hotkeys',
        hotkeys: undefined,
        checkCallback: commandWithoutHotkeys.handler
      });
    });
  });

  describe('Plugin Structure', () => {
    it('should be an instance of Plugin', () => {
      expect(plugin).toBeInstanceOf(EssentialShortcuts);
    });

    it('should have onload method', () => {
      expect(typeof plugin.onload).toBe('function');
    });
  });
});