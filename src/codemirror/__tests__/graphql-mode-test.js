/**
 *  Copyright (c) 2015, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */
import { expect } from 'chai';
import { describe, it } from 'mocha';
import CodeMirror from 'codemirror';
import 'codemirror/addon/runmode/runmode';
import '../mode/graphql-mode';

describe('graphql-mode', () => {
  it('provides correct tokens and styles after parsing', () => {
    let queryStr = 'query name { }';
    let tokenMap = [ 'query', 'name', '{', '}' ];
    let styleMap = [ 'keyword', 'def', 'punctuation', 'punctuation' ];
    let error;
    try {
      CodeMirror.runMode(queryStr, 'graphql', (token, style) => {
        if (token && tokenMap[0] === token) {
          tokenMap.shift();
        }
        if (style && styleMap[0] === style) {
          styleMap.shift();
        }
      });
    } catch(e) {
      error = e;
    }

    expect(tokenMap).to.have.lengthOf(0);
    expect(styleMap).to.have.lengthOf(0);
    expect(error).to.equal(undefined);
  });

  it('returns "invalidchar" message when there is no matching token', () => {
    CodeMirror.runMode('qauery name', 'graphql', (token, style) => {
      if (token.trim()) {
        expect(style).to.equal('invalidchar');
      }
    });

    CodeMirror.runMode('query @include', 'graphql', (token, style) => {
      if (token === '@' || token === 'include') {
        expect(style).to.equal('invalidchar');
      }
    });
  });
});
