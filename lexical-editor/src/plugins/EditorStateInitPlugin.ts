import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

export const EditorStateInitPlugin = () => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    const message = {
      type: "LEXICAL_EDITOR_READY",
    };

    window.ReactNativeWebView?.postMessage(JSON.stringify(message));
  }, []);

  useEffect(() => {
    const listener = (e: MessageEvent<string>) => {
      const message = JSON.parse(e.data);

      if (message.command === "INIT_SERIALIZED_EDITOR_STATE") {
        editor.setEditorState(editor.parseEditorState(message.payload), {
          tag: "FromReactNativeToLexical",
        });
      }
    };
    window.addEventListener("message", listener);

    return () => {
      window.removeEventListener("message", listener);
    };
  }, [editor]);

  return null;
};
