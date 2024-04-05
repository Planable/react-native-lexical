/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $findMatchingParent, mergeRegister } from '@lexical/utils';
import {
  $getRoot,
  $getSelection,
  $insertNodes,
  $isElementNode,
  $isRangeSelection,
  BLUR_COMMAND,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  COMMAND_PRIORITY_LOW,
  EditorState,
  ElementFormatType,
  FOCUS_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  LexicalEditor,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  TextFormatType,
  UNDO_COMMAND,
} from 'lexical';
import { $isLinkNode } from '@lexical/link';
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import { useCallback, useEffect, useState } from 'react';
import { getSelectedNode } from '../utils/getSelectedNode.ts';
import { linkBridge, registerWebMethod } from '@webview-bridge/web';
import { EditorBridge, OnChangePayload, WebBridge } from '../../../shared/types.ts';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';

export default function EditorBridgePlugin() {
  const [editor] = useLexicalComposerContext();
  const [bridgeReady, setBridgeReady] = useState(false);
  const [bridge] = useState(() =>
    linkBridge<EditorBridge>({
      throwOnError: true,
      onReady: () => {
        setBridgeReady(true);
      },
    }),
  );
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [elementFormat, setElementFormat] = useState<ElementFormatType>('left');

  useEffect(() => {
    if (bridge && bridgeReady) {
      (async function () {
        await bridge.setReady(true);
      })().catch();
    }
  }, [bridge, bridgeReady]);

  useEffect(() => {
    const webBridge: WebBridge = {
      undoCommand(): Promise<void> {
        editor.dispatchCommand(UNDO_COMMAND, undefined);
        return Promise.resolve();
      },
      redoCommand(): Promise<void> {
        editor.dispatchCommand(REDO_COMMAND, undefined);
        return Promise.resolve();
      },
      formatTextCommand(payload: TextFormatType): Promise<void> {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, payload);
        return Promise.resolve();
      },
      formatElementCommand(payload: ElementFormatType): Promise<void> {
        editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, payload);
        return Promise.resolve();
      },
      getEditorHtml(): Promise<string> {
        let html = '';
        try {
          editor.update(
            () => {
              html = $generateHtmlFromNodes(editor, null);
            },
            { discrete: true },
          );
        } catch (error) {
          console.error(error);
        }
        return Promise.resolve(html);
      },
      setEditorHtml(htmlString: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
          try {
            editor.update(
              () => {
                // In the browser you can use the native DOMParser API to parse the HTML string.
                const parser = new DOMParser();
                const dom = parser.parseFromString(htmlString, 'text/html');

                // Once you have the DOM instance it's easy to generate LexicalNodes.
                const nodes = $generateNodesFromDOM(editor, dom);

                // Select the root
                $getRoot().select();

                // Insert them at a selection.
                $insertNodes(nodes);
                resolve();
              },
              { discrete: true },
            );
          } catch (error) {
            reject(error);
          }
        });
      },
      getEditorJson(): Promise<string> {
        const editorState = editor.getEditorState();
        const jsonString = JSON.stringify(editorState);
        return Promise.resolve(jsonString);
      },
      setEditorJson(jsonString: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
          try {
            const editorState = editor.parseEditorState(jsonString);
            editor.setEditorState(editorState);
            resolve();
          } catch (error) {
            reject(error);
          }
        });
      },
    };
    registerWebMethod(webBridge);
  }, [editor]);

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      // Update text format
      setIsBold(selection.hasFormat('bold'));
      setIsItalic(selection.hasFormat('italic'));
      setIsUnderline(selection.hasFormat('underline'));
      setIsStrikethrough(selection.hasFormat('strikethrough'));

      const node = getSelectedNode(selection);
      const parent = node.getParent();

      let matchingParent;
      if ($isLinkNode(parent)) {
        // If node is a link, we need to fetch the parent paragraph node to set format
        matchingParent = $findMatchingParent(
          node,
          parentNode => $isElementNode(parentNode) && !parentNode.isInline(),
        );
      }

      // If matchingParent is a valid node, pass its format type
      setElementFormat(
        $isElementNode(matchingParent)
          ? matchingParent.getFormatType()
          : $isElementNode(node)
            ? node.getFormatType()
            : parent?.getFormatType() || 'left',
      );
    }
  }, []);

  const setFocus = useCallback(
    (focus: boolean) => {
      (async function () {
        await bridge.setFocus(focus);
      })().catch();
    },
    [bridge],
  );

  useEffect(() => {
    async function updateToolbarState(): Promise<void> {
      const newToolbarState = {
        canUndo,
        canRedo,
        isBold,
        isItalic,
        isUnderline,
        isStrikethrough,
        elementFormat,
      };
      await bridge.setToolbarState(newToolbarState);
    }

    updateToolbarState().catch();
  }, [canUndo, canRedo, isBold, isItalic, isUnderline, isStrikethrough, elementFormat, bridge]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateToolbar();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateToolbar();
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        payload => {
          setCanUndo(payload);
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        payload => {
          setCanRedo(payload);
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        BLUR_COMMAND,
        () => {
          setFocus(false);
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        FOCUS_COMMAND,
        () => {
          setFocus(true);
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
    );
  }, [editor, setFocus, updateToolbar]);

  function onChange(editorState: EditorState, _latestEditor: LexicalEditor, _tags: Set<string>) {
    if (bridge && bridgeReady) {
      console.log(`tags: ${JSON.stringify(_tags)}`);
      editorState.read(() => {
        const plainText: string | null = window.editorParams.enableOnChangePlugin?.includePlainText
          ? $getRoot().getTextContent()
          : null;
        const htmlText: string | null = window.editorParams.enableOnChangePlugin?.includeHtmlText
          ? $generateHtmlFromNodes(_latestEditor, null)
          : null;
        const jsonState: string | null = window.editorParams.enableOnChangePlugin?.includeJsonState
          ? JSON.stringify(editorState.toJSON())
          : null;

        const payload: OnChangePayload = {
          ...(plainText && { plainText }),
          ...(htmlText && { htmlText }),
          ...(jsonState && { jsonState }),
        };
        (async function () {
          await bridge.changeNotification(payload);
        })().catch();
      });
    }
  }

  return window.editorParams.enableOnChangePlugin && <OnChangePlugin onChange={onChange} />;
}
