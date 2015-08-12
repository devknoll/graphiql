/**
 *  Copyright (c) 2015, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

exports.__esModule = true;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _codemirror = require('codemirror');

var _codemirror2 = _interopRequireDefault(_codemirror);

require('codemirror/addon/fold/foldgutter');

require('codemirror/addon/fold/brace-fold');

require('codemirror/keymap/sublime');

require('codemirror/mode/javascript/javascript');

/**
 * ResultViewer
 *
 * Maintains an instance of CodeMirror for viewing a GraphQL response.
 *
 * Props:
 *
 *   - value: The text of the editor.
 *
 */

var ResultViewer = (function (_React$Component) {
  _inherits(ResultViewer, _React$Component);

  function ResultViewer() {
    _classCallCheck(this, ResultViewer);

    _React$Component.apply(this, arguments);
  }

  ResultViewer.prototype.componentDidMount = function componentDidMount() {
    this.viewer = _codemirror2['default'](_react2['default'].findDOMNode(this), {
      value: this.props.value || '',
      readOnly: true,
      theme: 'graphiql',
      mode: {
        name: 'javascript',
        json: true
      },
      keyMap: 'sublime',
      foldGutter: {
        minFoldSize: 4
      },
      gutters: ['CodeMirror-foldgutter'],
      extraKeys: {
        // Editor improvements
        'Ctrl-Left': 'goSubwordLeft',
        'Ctrl-Right': 'goSubwordRight',
        'Alt-Left': 'goGroupLeft',
        'Alt-Right': 'goGroupRight'
      }
    });
  };

  ResultViewer.prototype.componentWillUnmount = function componentWillUnmount() {
    this.viewer = null;
  };

  ResultViewer.prototype.shouldComponentUpdate = function shouldComponentUpdate(nextProps) {
    return this.props.value !== nextProps.value;
  };

  ResultViewer.prototype.componentDidUpdate = function componentDidUpdate() {
    this.viewer.setValue(this.props.value || '');
  };

  ResultViewer.prototype.render = function render() {
    return _react2['default'].createElement('div', { className: 'result-window' });
  };

  return ResultViewer;
})(_react2['default'].Component);

exports.ResultViewer = ResultViewer;