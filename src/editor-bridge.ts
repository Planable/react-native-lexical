import { bridge } from '@webview-bridge/react-native';
import { type EditorBridgeState, OnChangePayload, ToolbarState } from '../shared/types';

export const editorBridge = bridge<EditorBridgeState>(({ set }) => ({
  isReady: false,
  async setReady(b: boolean) {
    set({ isReady: b });
  },
  toolbarState: {
    canUndo: false,
    canRedo: false,
    isBold: false,
    isItalic: false,
    isUnderline: false,
    isStrikethrough: false,
    elementFormat: 'left',
  },
  async setToolbarState(s: ToolbarState) {
    set({ toolbarState: s });
  },
  hasFocus: false,
  async setFocus(focus: boolean): Promise<void> {
    set({ hasFocus: focus });
  },
  async changeNotification(payload: OnChangePayload): Promise<void> {
    console.log(`Editor changeNotification: ${JSON.stringify(payload, null, 2)}`);
  },
}));
