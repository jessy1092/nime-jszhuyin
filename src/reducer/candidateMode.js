'use strict';

let debug    = require('debug')('nime:zhuyin:composition');
let KEYCODE  = require('nime/lib/keyCodes');
let request  = require('sync-request');

function requestMatch(pattern) {
  console.log(pattern);

  let res = request(
    'GET', encodeURI(`http://140.109.16.144/正規化翻譯?查詢語句=${pattern}&查詢腔口=閩南語`), {
      'headers': {
        'Content-Type': 'application/json'
      }
  });

  console.log(res);
  let result = res.getBody().toString();

  console.log(JSON.parse(result));

  return JSON.parse(res.getBody().toString());
}

function candidateMode(request, preState) {

  let {keyCode} = request;

  let {
    candidateCursor,
    candidateList
  } = preState;

  // Close candidate
  if (keyCode === KEYCODE.VK_ESCAPE) {
    return Object.assign({}, preState, {
      action: 'SHOW_CANDIDATES',
      showCandidates: false,
      candidateList: [],
      candidateCursor: 0
    });
  }

  if (keyCode === KEYCODE.VK_DOWN) {
    candidateCursor = (candidateCursor + 3) % candidateList.length;
    return Object.assign({}, preState, {
      action: 'UPDATE_CANDIDATE',
      candidateCursor
    });
  }

  if (keyCode === KEYCODE.VK_UP) {
    if (candidateCursor === 0) {

      candidateList = candidateList.map(pattern => requestMatch(pattern)['綜合標音'][0]['漢字']);

      // let res = requestMatch(candidateList[0]);

      console.log(candidateList);
      return Object.assign({}, preState, {
        action: 'UPDATE_CANDIDATE',
        candidateList,
        candidateCursor
      });
    } else {
      candidateCursor = candidateCursor < 3 ? 0 : candidateCursor - 3;
      return Object.assign({}, preState, {
        action: 'UPDATE_CANDIDATE',
        candidateCursor
      });
    }
  }

  if (keyCode === KEYCODE.VK_RIGHT) {
    candidateCursor = (candidateCursor + 1) % candidateList.length;
    return Object.assign({}, preState, {
      action: 'UPDATE_CANDIDATE',
      candidateCursor
    });
  }

  if (keyCode === KEYCODE.VK_LEFT) {
    candidateCursor = candidateCursor == 0 ? 0 : candidateCursor - 1;
    return Object.assign({}, preState, {
      action: 'UPDATE_CANDIDATE',
      candidateCursor
    });
  }

  if (keyCode >= '1'.charCodeAt(0) && keyCode <= candidateList.length.toString().charCodeAt(0)) {

    let selectCandidate = candidateList[keyCode - '1'.charCodeAt(0)];

    return Object.assign({}, preState, {
      action: 'COMMIT_STRING',
      showCandidates: false,
      compositionString: '',
      commitString: selectCandidate.split(' ')[0]
    });
  }

  if (keyCode === KEYCODE.VK_RETURN) {

    let selectCandidate = candidateList[candidateCursor];

    return Object.assign({}, preState, {
      action: 'COMMIT_STRING',
      showCandidates: false,
      compositionString: '',
      commitString: selectCandidate.split(' ')[0]
    });
  }

  return Object.assign({}, preState, {action: ''});
}

module.exports = candidateMode;
