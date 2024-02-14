import { StyleSheet, Text, View } from "react-native";
import WebView, { WebViewMessageEvent } from "react-native-webview";
import htmlString from "./lexical-editor/dist/htmlString";

export default function App() {
  function onMessage(event: WebViewMessageEvent) {
    const message = JSON.parse(event.nativeEvent.data);
    console.log(JSON.stringify(message, null, 2));

    switch (message.type) {
      case "LEXICAL_EDITOR_STATE_CHANGE":
        // Do something with the editor state
        // like saving it to a database
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
          originWhitelist={["*"]}
          onMessage={onMessage}
          source={{ html: htmlString }}
          style={{ marginTop: 20 }}
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
