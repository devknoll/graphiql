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

var _marked = require('marked');

var _marked2 = _interopRequireDefault(_marked);

var _codemirror = require('codemirror');

var _codemirror2 = _interopRequireDefault(_codemirror);

require('codemirror/addon/hint/show-hint');

require('codemirror/addon/comment/comment');

require('codemirror/addon/edit/matchbrackets');

require('codemirror/addon/edit/closebrackets');

require('codemirror/addon/fold/foldgutter');

require('codemirror/addon/fold/brace-fold');

require('codemirror/addon/lint/lint');

require('codemirror/keymap/sublime');

require('../codemirror/hint/graphql-hint');

require('../codemirror/lint/graphql-lint');

require('../codemirror/mode/graphql-mode');

/**
 * QueryEditor
 *
 * Maintains an instance of CodeMirror responsible for editing a GraphQL query.
 *
 * Props:
 *
 *   - schema: A GraphQLSchema instance enabling editor linting and hinting.
 *   - value: The text of the editor.
 *   - onEdit: A function called when the editor changes, given the edited text.
 *
 *   - flex: TODO, move out of this component.
 *
 */

var QueryEditor = (function (_React$Component) {
  _inherits(QueryEditor, _React$Component);

  function QueryEditor(props) {
    _classCallCheck(this, QueryEditor);

    _React$Component.call(this);

    // Keep a cached version of the value, this cache will be updated when the
    // editor is updated, which can later be used to protect the editor from
    // unnecessary updates during the update lifecycle.
    this.cachedValue = props.value || '';
  }

  QueryEditor.prototype.componentDidMount = function componentDidMount() {
    var _this = this;

    this.editor = _codemirror2['default'](_react2['default'].findDOMNode(this), {
      value: this.props.value || '',
      lineNumbers: true,
      tabSize: 2,
      mode: 'graphql',
      theme: 'graphiql',
      keyMap: 'sublime',
      autoCloseBrackets: true,
      matchBrackets: true,
      showCursorWhenSelecting: true,
      foldGutter: {
        minFoldSize: 4
      },
      lint: {
        schema: this.props.schema
      },
      hintOptions: {
        schema: this.props.schema,
        closeOnUnfocus: false,
        completeSingle: false,
        displayInfo: true,
        renderInfo: function renderInfo(elem, ctx) {
          var description = _marked2['default'](ctx.description || 'Self descriptive.', { smartypants: true });
          var type = ctx.type ? '<span class="infoType">' + String(ctx.type) + '</span>' : '';
          elem.innerHTML = '<div class="content">' + (description.slice(0, 3) === '<p>' ? '<p>' + type + description.slice(3) : type + description) + '</div>';
        }
      },
      gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
      extraKeys: {
        'Cmd-Space': function CmdSpace() {
          return _this.editor.showHint({ completeSingle: true });
        },
        'Ctrl-Space': function CtrlSpace() {
          return _this.editor.showHint({ completeSingle: true });
        },

        // Editor improvements
        'Ctrl-Left': 'goSubwordLeft',
        'Ctrl-Right': 'goSubwordRight',
        'Alt-Left': 'goGroupLeft',
        'Alt-Right': 'goGroupRight'
      }
    });

    this.editor.on('change', this._onEdit.bind(this));
    this.editor.on('keyup', this._onKeyUp.bind(this));
  };

  QueryEditor.prototype.componentWillUnmount = function componentWillUnmount() {
    this.editor = null;
  };

  QueryEditor.prototype.componentDidUpdate = function componentDidUpdate(prevProps) {
    // Ensure the changes caused by this update are not interpretted as
    // user-input changes which could otherwise result in an infinite
    // event loop.
    this.ignoreChangeEvent = true;
    if (this.props.schema !== prevProps.schema) {
      this.editor.options.lint.schema = this.props.schema;
      this.editor.options.hintOptions.schema = this.props.schema;
      _codemirror2['default'].signal(this.editor, 'change', this.editor);
    }
    if (this.props.value !== prevProps.value && this.props.value !== this.cachedValue) {
      this.cachedValue = this.props.value;
      this.editor.setValue(this.props.value);
    }
    this.ignoreChangeEvent = false;
  };

  QueryEditor.prototype._onKeyUp = function _onKeyUp(cm, event) {
    var code = event.keyCode;
    if (code >= 65 && code <= 90 || // letters
    !event.shiftKey && code >= 48 && code <= 57 || // numbers
    event.shiftKey && code === 189 || // underscore
    event.shiftKey && code === 50 || // @
    event.shiftKey && code === 57 // (
    ) {
        this.editor.execCommand('autocomplete');
      }
  };

  QueryEditor.prototype._onEdit = function _onEdit() {
    if (!this.ignoreChangeEvent) {
      this.cachedValue = this.editor.getValue();
      if (this.props.onEdit) {
        this.props.onEdit(this.cachedValue);
      }
    }
  };

  QueryEditor.prototype.render = function render() {
    return _react2['default'].createElement('div', { className: 'query-editor', style: { flex: this.props.flex } });
  };

  return QueryEditor;
})(_react2['default'].Component);

exports.QueryEditor = QueryEditor;