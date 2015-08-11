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
import 'codemirror/addon/hint/show-hint';
import '../hint/graphql-hint';
import { BlogSchema } from './blogSchema';

describe('graphql-hint', () => {
  // TODO
  it('attaches a GraphQL hint function with correct mode/hint options', () => {
    let editor = document.createElement('div');
    let editorInstance = CodeMirror(editor, {
      mode: 'graphql',
      hintOptions: {
        schema: BlogSchema,
        closeOnUnfocus: false,
        completeSingle: false
      }
    });

    expect(
      editorInstance.getHelpers(editorInstance.getCursor(), 'hint')
    ).to.not.have.lengthOf(0);
  });

  it('constructs correct completion suggestions when triggered', () => {
    let editor = document.createElement('div');
    let editorInstance = CodeMirror(editor, {
      mode: 'graphql',
      hintOptions: {
        schema: BlogSchema,
        closeOnUnfocus: false,
        completeSingle: false
      }
    });

    editorInstance.doc.setValue('{ ');
    editorInstance.doc.setCursor({
      line: 0,
      ch: 2
    });
    editorInstance.execCommand('autocomplete');

    let getSuggestions = () => {
      return editorInstance.state.completionActive.data.list;
    };

    expect(getSuggestions).to.not.throw(TypeError, /undefined/);
    let suggestions = getSuggestions();
    const fieldConfig = BlogSchema._schemaConfig.query._fields;
    const fieldNames = Object.keys(fieldConfig);
    for (let suggestion of suggestions) {
      if (suggestion.text === '__schema' || suggestion.text === '__type') {
        continue;
      }
      expect(fieldNames).to.contain(suggestion.text);
      expect(fieldConfig[suggestion.text]).to.not.equal(undefined);
      expect(fieldConfig[suggestion.text].description)
        .to.equal(suggestion.description);
    }
  });
});
