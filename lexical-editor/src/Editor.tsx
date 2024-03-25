import { $getRoot, EditorState, LexicalEditor } from "lexical";
import { $generateHtmlFromNodes } from '@lexical/html';
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { EditorStateInitPlugin } from "./plugins/EditorStateInitPlugin";
import "./Editor.css";
import ToolbarPlugin from "./plugins/ToolbarPlugin";
import EditorTheme from './EditorTheme';

function onError(error: unknown) {
  console.error(error);
}

type EditorProps = {
  name?: string
}

export function Editor({name}: EditorProps) {
  const initialConfig = {
    namespace: name ?? "MyEditor",
    theme: EditorTheme,
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
      const htmlString = $generateHtmlFromNodes(_latestEditor, null);

      const message = {
        type: "LEXICAL_EDITOR_STATE_CHANGE",
        payload: {
          plainText,
          htmlString,
          serializedEditorState: editorState.toJSON(),
        },
      };

      window.ReactNativeWebView?.postMessage(JSON.stringify(message));
    });
  }

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="editor-container">
        <ToolbarPlugin/>
        <div className="editor-inner">
          <RichTextPlugin
            contentEditable={<ContentEditable className="editor-input"/>}
            placeholder={
              <div className="editor-placeholder">Enter some text...</div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin/>
          <EditorStateInitPlugin/>
          <OnChangePlugin onChange={onChange}/>
        </div>
      </div>
    </LexicalComposer>
  );
}
