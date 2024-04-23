import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, SafeAreaView, StyleSheet, Text, TextInput } from 'react-native';
import {
  KeyboardAwareScrollView,
  KeyboardProvider,
  KeyboardToolbar,
} from 'react-native-keyboard-controller';
import { WebViewMessageEvent } from 'react-native-webview';
import { Toolbar, WebView } from './src/Toolbar';
import htmlString from './lexical-editor/dist/htmlString';
import { useBridge } from '@webview-bridge/react-native';
import { editorBridge } from './src/editor-bridge';
import { EditorBridgeState, EditorParams } from './shared/types';

export default function App() {
  const webviewRef = useRef<any>(null);
  const [webViewHeight, setWebViewHeight] = useState(1); // Height 0 causes the app to crash on Android
  const { hasFocus } = useBridge(editorBridge);

  useEffect(() => {
    editorBridge.subscribe((newState: EditorBridgeState, prevState: EditorBridgeState) => {
      if (newState.isReady && !prevState.isReady) {
        console.log('EditorBridge is ready ... do something if you like ...');
      }
    });
  }, []);

  function onMessage(event: WebViewMessageEvent) {
    const message = JSON.parse(event.nativeEvent.data);

    switch (message.type) {
      case 'BODY_HEIGHT_CHANGE':
        setWebViewHeight(message.payload);
        break;
      default:
        break;
    }
  }

  // load from database/backend
  // (you should escape single quotes, otherwise setting the javascript variable will fail)
  const editorParams: EditorParams = {
    namespace: 'MyLexicalEditor',
    initialEditorState:
      '{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Just!!! ","type":"text","version":1},{"detail":0,"format":1,"mode":"normal","style":"","text":"some","type":"text","version":1},{"detail":0,"format":0,"mode":"normal","style":"","text":" ","type":"text","version":1},{"detail":0,"format":10,"mode":"normal","style":"","text":"initial","type":"text","version":1},{"detail":0,"format":0,"mode":"normal","style":"","text":" text","type":"text","version":1}],"direction":"ltr","format":"center","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}',
    enableOnChangePlugin: {
      includePlainText: true,
      includeHtmlText: true,
      includeJsonState: true,
    },
  };

  const injectedJavaScriptBeforeContentLoaded = `(function() {
      window.editorParams = ${JSON.stringify(editorParams)};
    })();`;

  return (
    <KeyboardProvider>
      <SafeAreaView style={styles.container}>
        <KeyboardAwareScrollView bottomOffset={62} contentContainerStyle={styles.containerCCKASV}>
          <Text style={styles.text}>
            Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor
            invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et
            accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata
            sanctus est Lorem ipsum dolor sit amet.
          </Text>
          <Text style={styles.text}>
            Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor
            invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et
            accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata
            sanctus est Lorem ipsum dolor sit amet.
          </Text>
          <TextInput placeholder={'Just a dummy single line field'} style={styles.textInput} />
          <Text>Lexical Webview</Text>
          <WebView
            ref={webviewRef}
            hideKeyboardAccessoryView={true}
            originWhitelist={['*']}
            injectedJavaScript={`
                  const observer = new ResizeObserver(entries => {
                    const height = entries[0].target.clientHeight + 24;
                    const message = {
                      type: 'BODY_HEIGHT_CHANGE',
                      payload: height
                    };
                    window.ReactNativeWebView?.postMessage(JSON.stringify(message));
                  });
                  observer.observe(document.body);
                  true;
              `}
            injectedJavaScriptBeforeContentLoaded={injectedJavaScriptBeforeContentLoaded}
            onMessage={onMessage}
            source={{ html: htmlString }}
            style={{
              width: Dimensions.get('window').width - 15,
              height: webViewHeight === 1 ? 40 : webViewHeight,
              maxHeight: webViewHeight,
            }}
          />
        </KeyboardAwareScrollView>
      </SafeAreaView>
      <KeyboardToolbar showArrows={false} {...(hasFocus && { content: <Toolbar /> })} />
    </KeyboardProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerCCKASV: {
    alignItems: 'flex-start',
    margin: 16,
  },
  textInput: {
    marginTop: 16,
    marginBottom: 16,
    fontSize: 16,
  },
  text: {
    fontSize: 24,
  },
});
