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
import 'codemirror/addon/lint/lint';
import '../lint/graphql-lint';
import { BlogSchema } from './blogSchema';
// import { readFileSync } from 'fs';

/* eslint-disable max-len */

function createEditorWithLint(lintConfig) {
  let editor = CodeMirror(document.createElement('div'), {
    mode: 'graphql',
    lint: lintConfig ? lintConfig : true
  });

  return editor;
}

function printLintErrors(queryString) {
  let editor = createEditorWithLint({
    schema: BlogSchema
  });

  return new Promise((resolve, reject) => {
    editor.state.lint.options.onUpdateLinting = (errors) => {
      if (errors && errors[0]) {
        if (!errors[0].message.match('Unexpected EOF')) {
          resolve(errors);
        }
      }
      reject();
    };
    editor.doc.setValue(queryString);
  }).then((errors) => {
    return errors[0].message;
  }).catch(() => {
    return null;
  });
}

describe('graphql-lint', () => {
  it('attaches a GraphQL lint function with correct mode/lint options', () => {
    let editor = createEditorWithLint();
    expect(
      editor.getHelpers(editor.getCursor(), 'lint')
    ).to.not.have.lengthOf(0);
  });

  it('catches syntax errors', async () => {
    expect(await printLintErrors(`qeury`)).to.contain(
`Unexpected Name "qeury"`
    );
  });

  it('catches field validation errors', async () => {
    expect(await printLintErrors(`query queryName { title }`)).to.contain(
`Cannot query field "title" on "Query".`
    );
  });
});
