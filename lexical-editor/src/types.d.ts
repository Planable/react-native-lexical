import { EditorParams } from '../../shared/types.ts';

export declare global {
  interface Window {
    editorParams: EditorParams;
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
  }
}
