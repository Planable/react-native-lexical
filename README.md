# react-native-lexical

This playground project uses Lexical editor in React Native through react-native-webview.

<image src="demo.gif" height="640" />

## Development

```bash
npm i
npm run ios
```

If you want to change anything in the webview part, you need to regenerate the distribution code:

```bash
cd lexical-editor
npm run dev
```

## Contribution

This approach is pretty experimental and still raw so any contributions (bug fixes, keyboard toolbar, plugins, commands) are welcome.

Also if you have any ideas, questions, or problems, you can open an issue in this repo and we can discuss it.

## Changelog

- 1.1.0 (current version)
  - Added native toolbar (above keyboard)
  - Added a couple of helper libraries (e.g. webview-bridge, react-native-keyboard-controller) to ease development and make the showcase a bit more realistic
- [1.0.0](https://github.com/Planable/react-native-lexical/tree/912158dc092040af3ca7935ab2d555cac5ff1f6a)
  - Initial version which corresponds to what was explained in the [blog post](https://strdr4605.com/how-to-set-up-lexical-editor-in-react-native)
