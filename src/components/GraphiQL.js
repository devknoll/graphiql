/**
 *  Copyright (c) 2015, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

import React from 'react';
import { ExecuteButton } from './ExecuteButton';
import { QueryEditor } from './QueryEditor';
import { ResultViewer } from './ResultViewer';
import { introspectionQuery, buildClientSchema } from 'graphql/utilities';


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
export class GraphiQL extends React.Component {
  constructor(props) {
    super();

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

  _fetchQuery(query, cb) {
    this.props.fetcher({ query }).then(cb).catch(error => {
      this.setState({ response: JSON.stringify(error, null, 2) });
    });
  }

  _runEditorQuery() {
    this.editorQueryID++;
    var queryID = this.editorQueryID;
    this._fetchQuery(this.queryString, result => {
      if (queryID === this.editorQueryID) {
        this.setState({ response: JSON.stringify(result, null, 2) });
      }
    });
  }

  componentDidMount() {
    if (!this.state.schema) {
      this._fetchQuery(introspectionQuery, result => {
        if (!result.data) {
          this.setState({ response: JSON.stringify(result, null, 2) });
        } else {
          this.setState({ schema: buildClientSchema(result.data) });
        }
      });
    }
  }

  _onUpdate() {
    this.forceUpdate();
  }

  _onEdit(value) {
    this.queryString = value;
    window.localStorage.setItem('query', value);
  }

  render() {
    return (
      <div id="graphiql-container">
        <div className="topBar">
          <div className="title">Graph<em>i</em>QL</div>
          <ExecuteButton onClick={this._runEditorQuery.bind(this)} />
        </div>
        <div className="editorBar" onMouseDown={this.onResizeStart.bind(this)}>
          <QueryEditor
            flex={this.state.editorFlex}
            schema={this.state.schema}
            value={this.queryString}
            onEdit={this._onEdit.bind(this)}
          />
          <ResultViewer
            ref="result"
            value={this.state.response}
          />
        </div>
      </div>
    );
  }

  onResizeStart(downEvent) {
    if (this.mouseMoveListener || !this.didClickDragBar(downEvent)) {
      return;
    }
    this.mouseOffset = downEvent.pageX - getLeft(downEvent.target);
    downEvent.preventDefault();
    this.mouseMoveListener = moveEvent => {
      if (moveEvent.buttons === 0) {
        this.onResizeEnd();
      } else {
        this.onResize(moveEvent);
      }
    };
    this.mouseUpListener = () => {
      this.onResizeEnd();
    };
    document.addEventListener('mousemove', this.mouseMoveListener);
    document.addEventListener('mouseup', this.mouseUpListener);
  }

  onResizeEnd() {
    window.localStorage.setItem('editorFlex', this.state.editorFlex);
    document.removeEventListener('mousemove', this.mouseMoveListener);
    document.removeEventListener('mouseup', this.mouseUpListener);
    this.mouseMoveListener = null;
    this.mouseUpListener = null;
  }

  onResize(event) {
    var leftSize = event.screenX - this.mouseOffset;
    var rightSize = window.innerWidth - leftSize;
    this.setState({ editorFlex: leftSize / rightSize });
  }

  didClickDragBar(event) {
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
    var resultWindow = React.findDOMNode(this.refs.result);
    while (target) {
      if (target === resultWindow) {
        return true;
      }
      target = target.parentNode;
    }
    return false;
  }
}

const defaultQuery =
`# Welcome to GraphiQL
#
# GraphiQL is an in-browser IDE for writing, validating, and
# testing GraphQL queries.
#
# Type queries into this side of the screen, and you will
# see intelligent typeaheads aware of the current GraphQL type schema and
# live syntax and validation errors highlighted within the text.
#
# To bring up the auto-complete at any point, just press Ctrl-Space.
#
# Press the run button above, or Cmd-Enter to execute the query, and the result
# will appear in the pane to the right.

`;

function getLeft(initialElem) {
  var pt = 0;
  var elem = initialElem;
  while (elem.offsetParent) {
    pt += elem.offsetLeft;
    elem = elem.offsetParent;
  }
  return pt;
}
