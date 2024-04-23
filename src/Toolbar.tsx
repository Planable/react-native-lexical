import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { createWebView, useBridge } from '@webview-bridge/react-native';
import {
  faAlignCenter,
  faAlignJustify,
  faAlignLeft,
  faAlignRight,
  faBold,
  faItalic,
  faRotateLeft,
  faRotateRight,
  faStrikethrough,
  faUnderline,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { ElementFormatType, TextFormatType } from 'lexical';
import { WebBridge } from '../shared/types';
import { editorBridge } from './editor-bridge';

export const { WebView, linkWebMethod } = createWebView({
  bridge: editorBridge,
  debug: true, // Enable console.log visibility in the native WebView
});

export const WebBridgeMethods = linkWebMethod<WebBridge>();

export const Toolbar = () => {
  const { toolbarState } = useBridge(editorBridge);

  const formatElement = async (fmt: ElementFormatType) => {
    try {
      if (WebBridgeMethods.current.isReady) {
        await WebBridgeMethods.current.formatElementCommand(fmt);
      }
    } catch (e) {
      console.error('Toolbar#formatElement', e);
    }
  };

  const formatText = async (fmt: TextFormatType) => {
    try {
      if (WebBridgeMethods.current.isReady) {
        await WebBridgeMethods.current.formatTextCommand(fmt);
      }
    } catch (e) {
      console.error('Toolbar#formatText', e);
    }
  };

  const undo = async () => {
    try {
      if (WebBridgeMethods.current.isReady) {
        await WebBridgeMethods.current.undoCommand();
      }
    } catch (e) {
      console.error('Toolbar#undo', e);
    }
  };

  const redo = async () => {
    try {
      if (WebBridgeMethods.current.isReady) {
        await WebBridgeMethods.current.redoCommand();
      }
    } catch (e) {
      console.error('Toolbar#redo', e);
    }
  };

  return (
    <View style={styles.flexRow}>
      <TouchableOpacity {...(toolbarState.canUndo ? { onPress: undo } : { disabled: true })}>
        <View style={styles.touchableBg}>
          <FontAwesomeIcon
            icon={faRotateLeft}
            style={toolbarState.canUndo ? styles.btnEnabled : styles.btnDisabled}
            size={16}
          />
        </View>
      </TouchableOpacity>
      <TouchableOpacity {...(toolbarState.canRedo && { onPress: redo })}>
        <View style={styles.touchableBg}>
          <FontAwesomeIcon
            icon={faRotateRight}
            style={toolbarState.canRedo ? styles.btnEnabled : styles.btnDisabled}
            size={16}
          />
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => formatText('bold')}>
        <View style={toolbarState.isBold ? styles.touchableBgActive : styles.touchableBg}>
          <FontAwesomeIcon
            icon={faBold}
            style={toolbarState.isBold ? styles.btnActive : {}}
            size={16}
          />
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => formatText('italic')}>
        <View style={toolbarState.isItalic ? styles.touchableBgActive : styles.touchableBg}>
          <FontAwesomeIcon
            icon={faItalic}
            style={toolbarState.isItalic ? styles.btnActive : {}}
            size={16}
          />
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => formatText('underline')}>
        <View style={toolbarState.isUnderline ? styles.touchableBgActive : styles.touchableBg}>
          <FontAwesomeIcon
            icon={faUnderline}
            style={toolbarState.isUnderline ? styles.btnActive : {}}
            size={16}
          />
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => formatText('strikethrough')}>
        <View style={toolbarState.isStrikethrough ? styles.touchableBgActive : styles.touchableBg}>
          <FontAwesomeIcon
            icon={faStrikethrough}
            style={toolbarState.isStrikethrough ? styles.btnActive : {}}
            size={16}
          />
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => formatElement('left')}>
        <View
          style={
            toolbarState.elementFormat === 'left' ? styles.touchableBgActive : styles.touchableBg
          }>
          <FontAwesomeIcon
            icon={faAlignLeft}
            style={toolbarState.elementFormat === 'left' ? styles.btnActive : {}}
            size={16}
          />
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => formatElement('center')}>
        <View
          style={
            toolbarState.elementFormat === 'center' ? styles.touchableBgActive : styles.touchableBg
          }>
          <FontAwesomeIcon
            icon={faAlignCenter}
            style={toolbarState.elementFormat === 'center' ? styles.btnActive : {}}
            size={16}
          />
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => formatElement('right')}>
        <View
          style={
            toolbarState.elementFormat === 'right' ? styles.touchableBgActive : styles.touchableBg
          }>
          <FontAwesomeIcon
            icon={faAlignRight}
            style={toolbarState.elementFormat === 'right' ? styles.btnActive : {}}
            size={16}
          />
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => formatElement('justify')}>
        <View
          style={
            toolbarState.elementFormat === 'justify' ? styles.touchableBgActive : styles.touchableBg
          }>
          <FontAwesomeIcon
            icon={faAlignJustify}
            style={toolbarState.elementFormat === 'justify' ? styles.btnActive : {}}
            size={16}
          />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  flexRow: {
    flexDirection: 'row',
  },
  touchableBg: {
    padding: 4,
  },
  touchableBgActive: {
    padding: 4,
    backgroundColor: '#bbb',
    borderRadius: 8,
  },
  btnEnabled: {
    color: '#000',
  },
  btnDisabled: {
    color: '#aaa',
  },
  btnActive: {
    backgroundColor: '#999',
  },
});
