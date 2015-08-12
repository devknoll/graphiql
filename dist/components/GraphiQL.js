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

var _ExecuteButton = require('./ExecuteButton');

var _QueryEditor = require('./QueryEditor');

var _ResultViewer = require('./ResultViewer');

var _graphqlUtilities = require('graphql/utilities');

/**
 * GraphiQL
 *
 * This React component is responsible for rendering the GraphiQL editor.
 *
 * Props:
 *
 *   - fetcher: a function which accepts GraphQL-HTTP parameters and returns
 *     a Promise which resolves to the GraphQL parsed JSON response.
 *
 *   - schema: an optional GraphQLSchema instance. If one is not provided,
 *     GraphiQL will fetch one using introspection.
 *
 */

var GraphiQL = (function (_React$Component) {
  _inherits(GraphiQL, _React$Component);

  function GraphiQL(props) {
    _classCallCheck(this, GraphiQL);

    _React$Component.call(this);

    // Ensure props are correct
    if (typeof props.fetcher !== 'function') {
      throw new TypeError('GraphiQL requires a fetcher function.');
    }

    // Initialize state
    this.state = {
      schema: props.schema,
      response: null,
      editorFlex: window.localStorage.getItem('editorFlex') || 1
    };

    // This is kept outside of state because it is just a cached value.
    this.queryString = window.localStorage.getItem('query') || defaultQuery;

    // Ensure only the last executed editor query is rendered.
    this.editorQueryID = 0;
  }

  GraphiQL.prototype._fetchQuery = function _fetchQuery(query, cb) {
    var _this = this;

    this.props.fetcher({ query: query }).then(cb)['catch'](function (error) {
      _this.setState({ response: JSON.stringify(error, null, 2) });
    });
  };

  GraphiQL.prototype._runEditorQuery = function _runEditorQuery() {
    var _this2 = this;

    this.editorQueryID++;
    var queryID = this.editorQueryID;
    this._fetchQuery(this.queryString, function (result) {
      if (queryID === _this2.editorQueryID) {
        _this2.setState({ response: JSON.stringify(result, null, 2) });
      }
    });
  };

  GraphiQL.prototype.componentDidMount = function componentDidMount() {
    var _this3 = this;

    if (!this.state.schema) {
      this._fetchQuery(_graphqlUtilities.introspectionQuery, function (result) {
        if (!result.data) {
          _this3.setState({ response: JSON.stringify(result, null, 2) });
        } else {
          _this3.setState({ schema: _graphqlUtilities.buildClientSchema(result.data) });
        }
      });
    }
  };

  GraphiQL.prototype._onUpdate = function _onUpdate() {
    this.forceUpdate();
  };

  GraphiQL.prototype._onEdit = function _onEdit(value) {
    this.queryString = value;
    window.localStorage.setItem('query', value);
  };

  GraphiQL.prototype.render = function render() {
    return _react2['default'].createElement(
      'div',
      { id: 'graphiql-container' },
      _react2['default'].createElement(
        'div',
        { className: 'topBar' },
        _react2['default'].createElement(
          'div',
          { className: 'title' },
          'Graph',
          _react2['default'].createElement(
            'em',
            null,
            'i'
          ),
          'QL'
        ),
        _react2['default'].createElement(_ExecuteButton.ExecuteButton, { onClick: this._runEditorQuery.bind(this) })
      ),
      _react2['default'].createElement(
        'div',
        { className: 'editorBar', onMouseDown: this.onResizeStart.bind(this) },
        _react2['default'].createElement(_QueryEditor.QueryEditor, {
          flex: this.state.editorFlex,
          schema: this.state.schema,
          value: this.queryString,
          onEdit: this._onEdit.bind(this)
        }),
        _react2['default'].createElement(_ResultViewer.ResultViewer, {
          ref: 'result',
          value: this.state.response
        })
      )
    );
  };

  GraphiQL.prototype.onResizeStart = function onResizeStart(downEvent) {
    var _this4 = this;

    if (this.mouseMoveListener || !this.didClickDragBar(downEvent)) {
      return;
    }
    this.mouseOffset = downEvent.pageX - getLeft(downEvent.target);
    downEvent.preventDefault();
    this.mouseMoveListener = function (moveEvent) {
      if (moveEvent.buttons === 0) {
        _this4.onResizeEnd();
      } else {
        _this4.onResize(moveEvent);
      }
    };
    this.mouseUpListener = function () {
      _this4.onResizeEnd();
    };
    document.addEventListener('mousemove', this.mouseMoveListener);
    document.addEventListener('mouseup', this.mouseUpListener);
  };

  GraphiQL.prototype.onResizeEnd = function onResizeEnd() {
    window.localStorage.setItem('editorFlex', this.state.editorFlex);
    document.removeEventListener('mousemove', this.mouseMoveListener);
    document.removeEventListener('mouseup', this.mouseUpListener);
    this.mouseMoveListener = null;
    this.mouseUpListener = null;
  };

  GraphiQL.prototype.onResize = function onResize(event) {
    var leftSize = event.screenX - this.mouseOffset;
    var rightSize = window.innerWidth - leftSize;
    this.setState({ editorFlex: leftSize / rightSize });
  };

  GraphiQL.prototype.didClickDragBar = function didClickDragBar(event) {
    // Only for primary unmodified clicks
    if (event.button !== 0 || event.ctrlKey) {
      return false;
    }
    var target = event.target;
    // We use codemirror's gutter as the drag bar.
    if (target.className.indexOf('CodeMirror-gutter') !== 0) {
      return false;
    }
    // Specifically the result window's drag bar.
    var resultWindow = _react2['default'].findDOMNode(this.refs.result);
    while (target) {
      if (target === resultWindow) {
        return true;
      }
      target = target.parentNode;
    }
    return false;
  };

  return GraphiQL;
})(_react2['default'].Component);

exports.GraphiQL = GraphiQL;

var defaultQuery = '# Welcome to GraphiQL\n#\n# GraphiQL is an in-browser IDE for writing, validating, and\n# testing GraphQL queries.\n#\n# Type queries into this side of the screen, and you will\n# see intelligent typeaheads aware of the current GraphQL type schema and\n# live syntax and validation errors highlighted within the text.\n#\n# To bring up the auto-complete at any point, just press Ctrl-Space.\n#\n# Press the run button above, or Cmd-Enter to execute the query, and the result\n# will appear in the pane to the right.\n\n';

function getLeft(initialElem) {
  var pt = 0;
  var elem = initialElem;
  while (elem.offsetParent) {
    pt += elem.offsetLeft;
    elem = elem.offsetParent;
  }
  return pt;
}