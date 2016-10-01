'use strict';

let debug = require('debug')('nime:jszhuyin:reducer');
let {JSZhuyin} = require('jszhuyin');
let KEYCODE  = require('nime/lib/keyCodes');

let compositionMode = require('./compositionMode');
let candidateMode   = require('./candidateMode');

const zhuyinKeymap = require('../zhuyinKeymap');

function reduceOnKeyDown(request, preState) {

  let {keyCode, charCode} = request;
  let key = String.fromCharCode(charCode).toLowerCase();
  let {
    compositionString,
    showCandidates
  } = preState;

  if (key in zhuyinKeymap) {
    let jszhuyin = new JSZhuyin();
    let newCompositionString = preState['compositionString'] + zhuyinKeymap[key];
    let candidates = [];
    jszhuyin.load();
    jszhuyin.oncandidateschange = c => {
      candidates = c.map(mapping => mapping[0]);
    };
    jszhuyin.handleKey(newCompositionString);
    debug(candidates);
    jszhuyin.unloadSync();

    return Object.assign({}, preState, {
      action: 'UPDATE_STRING',
      compositionString: newCompositionString,
      compositionCursor: preState['compositionCursor'] + 1,
      candidateList: candidates.slice(0, 9),
      showCandidates: true
    });
  }

  // Start input
  // if (compositionString === '' && charCode === ':'.charCodeAt(0)) {
  //   return Object.assign({}, preState, {
  //     action: 'UPDATE_STRING',
  //     compositionString: ':',
  //     compositionCursor: 1
  //   });
  // }

  if (compositionString !== '') {

    if(showCandidates) {
      return candidateMode(request, preState);
    }

    if (!showCandidates) {
      return compositionMode(request, preState);
    }
  }

  return preState;
}

function reduceOnCompositionTerminated(request, preState) {
  return Object.assign({}, preState, {
    commitString: '',
    compositionString: '',
    compositionCursor: 0,
    candidateList: [],
    candidateCursor: 0
  });
}

module.exports = {
  reduceOnKeyDown,
  reduceOnCompositionTerminated
};
