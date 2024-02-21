import { StyleSheet, Text, View } from "react-native";
import WebView, { WebViewMessageEvent } from "react-native-webview";
import htmlString from "./lexical-editor/dist/htmlString";
import { useRef, useState } from "react";

export default function App() {
  const webviewRef = useRef<WebView>(null);

  const [webViewHeight, setWebViewHeight] = useState(1); // Height 0 causes the app to crash on Android

  function onMessage(event: WebViewMessageEvent) {
    const message = JSON.parse(event.nativeEvent.data);
    console.log(JSON.stringify(message, null, 2));

    switch (message.type) {
      case "BODY_HEIGHT_CHANGE":
        setWebViewHeight(message.payload);
        break;
      case "LEXICAL_EDITOR_STATE_CHANGE":
        // Do something with the editor state
        // like saving it to a database
        break;
      case "LEXICAL_EDITOR_READY":
        const commandMessage = {
          command: "INIT_SERIALIZED_EDITOR_STATE",
          payload: {
            root: {
              children: [
                {
                  children: [
                    {
                      detail: 0,
                      format: 0,
                      mode: "normal",
                      style: "",
                      text: "Initial text",
                      type: "text",
                      version: 1,
                    },
                  ],
                  direction: "ltr",
                  format: "",
                  indent: 0,
                  type: "paragraph",
                  version: 1,
                },
              ],
              direction: "ltr",
              format: "",
              indent: 0,
              type: "root",
              version: 1,
            },
          },
        };

        webviewRef.current?.postMessage(JSON.stringify(commandMessage));
        break;
      default:
        console.error("Unknown message type", message);
    }
  }

  return (
    <View style={styles.container}>
      <View style={{ width: "100%", height: "80%" }}>
        <Text>Lexical Webview</Text>
        <WebView
          ref={webviewRef}
          originWhitelist={["*"]}
          injectedJavaScript={`
              const observer = new ResizeObserver(entries => {
                const height = entries[0].target.clientHeight;
                const message = {
                  type: 'BODY_HEIGHT_CHANGE',
                  payload: height
                };
                window.ReactNativeWebView?.postMessage(JSON.stringify(message));
              });
              observer.observe(document.body);
        `}
          onMessage={onMessage}
          source={{ html: htmlString }}
          style={{
            marginTop: 20,
            maxHeight: webViewHeight,
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e0e0e0",
    alignItems: "center",
    justifyContent: "center",
  },
});
