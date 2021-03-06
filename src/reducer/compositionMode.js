'use strict';

let debug    = require('debug')('nime:zhuyin:composition');
let KEYCODE  = require('nime/lib/keyCodes');

function compositionMode(request, preState) {

  let {keyCode, charCode} = request;

  let {
    compositionString,
    compositionCursor,
    showCandidates
  } = preState;

  // Move cursor left
  if (keyCode === KEYCODE.VK_LEFT) {
    if (compositionCursor > 0) {
      return Object.assign({}, preState, {
        action: 'UPDATE_STRING',
        compositionCursor: compositionCursor - 1
      });
    }
    return Object.assign({}, preState, {action: ''});
  }

  // Move cursor right
  if (keyCode === KEYCODE.VK_RIGHT) {
    if (compositionCursor < compositionString.length) {
      return Object.assign({}, preState, {
        action: 'UPDATE_STRING',
        compositionCursor: compositionCursor + 1
      });
    }
    return Object.assign({}, preState, {action: ''});
  }

  // Exist composition mode
  if (keyCode === KEYCODE.VK_ESCAPE) {
    return Object.assign({}, preState, {
      action: 'UPDATE_STRING',
      compositionString: '',
      compositionCursor: 0
    });
  }

  // Delete compositionString.
  if (keyCode === KEYCODE.VK_BACK) {
    if (compositionString === '') {
      return Object.assign({}, preState, {action: ''});
    }
    let cursor = compositionCursor;
    compositionCursor -= 1;
    compositionString = compositionString.slice(0, compositionCursor) + compositionString.slice(cursor);

    return Object.assign({}, preState, {
      action: 'UPDATE_STRING',
      compositionString,
      compositionCursor
    });
  }

  if (
    (charCode >= 'a'.charCodeAt(0) && charCode <= 'z'.charCodeAt(0)) ||
    (charCode >= 'A'.charCodeAt(0) && charCode <= 'Z'.charCodeAt(0)) ||
    (charCode == '_'.charCodeAt(0))) {

    return Object.assign({}, preState, {
      action: 'UPDATE_STRING',
      compositionString: compositionString + String.fromCharCode(charCode),
      compositionCursor: compositionCursor + 1
    });
  }

  return preState;
}

module.exports = compositionMode;
