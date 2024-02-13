import { StyleSheet, Text, View } from "react-native";
import WebView from "react-native-webview";
import htmlString from "./lexical-editor/dist/htmlString";

export default function App() {
  return (
    <View style={styles.container}>
      <View style={{ width: "100%", height: "80%" }}>
        <Text>Lexical Webview</Text>
        <WebView
          originWhitelist={["*"]}
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
