/**
 *  Copyright (c) 2015, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

var _Reflect$apply = require('babel-runtime/core-js/reflect/apply')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

var _codemirror = require('codemirror');

var _codemirror2 = _interopRequireDefault(_codemirror);

var _graphqlLanguage = require('graphql/language');

var _graphqlValidation = require('graphql/validation');

_codemirror2['default'].registerHelper('lint', 'graphql', function (text, options, editor) {
  var schema = options.schema;
  try {
    var ast = _graphqlLanguage.parse(text);
  } catch (error) {
    var location = error.locations[0];
    var pos = _codemirror2['default'].Pos(location.line - 1, location.column);
    var token = editor.getTokenAt(pos);
    return [{
      message: error.message,
      severity: 'error',
      type: 'syntax',
      from: _codemirror2['default'].Pos(location.line - 1, token.start),
      to: _codemirror2['default'].Pos(location.line - 1, token.end)
    }];
  }
  var errors = schema ? _graphqlValidation.validate(schema, ast) : [];
  return flatMap(errors, function (error) {
    return errorAnnotations(editor, error);
  });
});

function errorAnnotations(editor, error) {
  return error.nodes.map(function (node) {
    var highlightNode = node.kind !== 'Variable' && node.name ? node.name : node.variable ? node.variable : node;
    return {
      message: error.message,
      severity: 'error',
      type: 'validation',
      from: editor.posFromIndex(highlightNode.loc.start),
      to: editor.posFromIndex(highlightNode.loc.end)
    };
  });
}

// General utility for flat-mapping.
function flatMap(array, mapper) {
  return _Reflect$apply(Array.prototype.concat, [], array.map(mapper));
}