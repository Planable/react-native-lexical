import { $getRoot, EditorState, LexicalEditor } from "lexical";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { PlainTextPlugin } from "@lexical/react/LexicalPlainTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { EditorStateInitPlugin } from "./plugins/EditorStateInitPlugin";
import "./Editor.css";

function onError(error: unknown) {
  console.error(error);
}

export function Editor() {
  const initialConfig = {
    namespace: "MyEditor",
    onError,
  };

  function onChange(
    editorState: EditorState,
    _latestEditor: LexicalEditor,
    tags: Set<string>,
  ) {
    if (tags.has("FromReactNativeToLexical")) {
      return;
    }
    editorState.read(() => {
      const plainText = $getRoot().getTextContent();

      const message = {
        type: "LEXICAL_EDITOR_STATE_CHANGE",
        payload: {
          plainText,
          serializedEditorState: editorState.toJSON(),
        },
      };

      window.ReactNativeWebView?.postMessage(JSON.stringify(message));
    });
  }

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="editor-container">
        <PlainTextPlugin
          contentEditable={<ContentEditable className="editor-input" />}
          placeholder={
            <div className="editor-placeholder">Enter some text...</div>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        <EditorStateInitPlugin />
        <OnChangePlugin onChange={onChange} />
      </div>
    </LexicalComposer>
  );
}
