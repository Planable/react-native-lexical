import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import './Editor.css';
import EditorBridgePlugin from './plugins/EditorBridgePlugin.tsx';
import EditorTheme from './EditorTheme';

function onError(error: unknown) {
  console.error(error);
}

export function Editor() {
  const initialConfig = {
    namespace: window.editorParams.namespace ?? 'MyEditor',
    theme: EditorTheme,
    onError,
    ...(window.editorParams.initialEditorState && {
      editorState: window.editorParams.initialEditorState,
    }),
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="editor-container">
        <EditorBridgePlugin />
        <div className="editor-inner">
          <RichTextPlugin
            contentEditable={<ContentEditable className="editor-input" />}
            placeholder={<div className="editor-placeholder">Enter some text...</div>}
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
        </div>
      </div>
    </LexicalComposer>
  );
}
