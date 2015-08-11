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
import { TestSchema } from './testSchema';
import { graphql } from 'graphql';
import { introspectionQuery, buildClientSchema } from 'graphql/utilities';

/* eslint-disable max-len */

async function createEditorWithHint() {
  return CodeMirror(document.createElement('div'), {
    mode: 'graphql',
    hintOptions: {
      schema: await getClientSchema(),
      closeOnUnfocus: false,
      completeSingle: false
    }
  });
}

async function getHintSuggestions(queryString, cursor) {
  let editor = await createEditorWithHint();
  return new Promise(resolve => {
    let graphqlHint = CodeMirror.hint.graphql;
    CodeMirror.hint.graphql = (cm, options) => {
      let result = graphqlHint(cm, options);
      if (result) {
        resolve(result);
      }

      return result;
    };

    editor.doc.setValue(queryString);
    editor.doc.setCursor(cursor);
    editor.execCommand('autocomplete');
  });
}

async function getClientSchema() {
  return await graphql(TestSchema, introspectionQuery)
    .then((response) => {
      return buildClientSchema(response.data);
    });
}

function checkSuggestions(source, suggestions) {
  for (let suggestion of suggestions) {
    if (suggestion.text === '__schema' || suggestion.text === '__type') {
      continue;
    }
    expect(source).to.contain(suggestion.text);
  }
}

describe('graphql-hint', () => {
  it('attaches a GraphQL hint function with correct mode/hint options', async () => {
    let editor = await createEditorWithHint();
    expect(
      editor.getHelpers(editor.getCursor(), 'hint')
    ).to.not.have.lengthOf(0);
  });

  it('provides correct field name suggestions', async () => {
    let suggestions = await getHintSuggestions('{ ', { line: 0, ch: 2 });

    const fieldConfig = TestSchema._schemaConfig.query._fields;
    const fieldNames = Object.keys(fieldConfig);
    checkSuggestions(fieldNames, suggestions.list);
  });

  it('provides correct argument suggestions', async () => {
    let suggestions = await getHintSuggestions(
      '{ hasArgs ( ', { line: 0, ch: 12 });
    const argumentNames =
      TestSchema._schemaConfig.query._fields.hasArgs.args.map(arg => {
        return arg.name;
      });
    checkSuggestions(argumentNames, suggestions.list);
  });

  it('provides correct directive suggestions', async () => {
    let suggestions = await getHintSuggestions(
      '{ test (@', { line: 0, ch: 9 });
    const directiveNames = [ 'include', 'skip' ];
    checkSuggestions(directiveNames, suggestions.list);
  });

  it('provides correct typeCondition suggestions', async () => {
    let suggestions = await getHintSuggestions(
      '{ union { ... on ', { line: 0, ch: 17 });
    const typeConditionNames =
      TestSchema._schemaConfig.query._fields.union.type._types.map(type => {
        return type.name;
      });
    checkSuggestions(typeConditionNames, suggestions.list);
  });

  // TODO: Enums
});
