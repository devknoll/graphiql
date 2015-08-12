/**
 *  Copyright (c) 2015, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

"use strict";

var _inherits = require("babel-runtime/helpers/inherits")["default"];

var _classCallCheck = require("babel-runtime/helpers/class-call-check")["default"];

var _interopRequireDefault = require("babel-runtime/helpers/interop-require-default")["default"];

exports.__esModule = true;

var _react = require('react');

/**
 * ExecuteButton
 *
 * What a nice round shiny button. Cmd/Ctrl-Enter is the shortcut.
 */

var _react2 = _interopRequireDefault(_react);

var ExecuteButton = (function (_React$Component) {
  _inherits(ExecuteButton, _React$Component);

  function ExecuteButton() {
    _classCallCheck(this, ExecuteButton);

    _React$Component.apply(this, arguments);
  }

  ExecuteButton.prototype.render = function render() {
    return _react2["default"].createElement(
      "button",
      {
        className: "execute-button",
        onClick: this.props.onClick,
        title: "Execute Query (Ctrl-Enter)" },
      _react2["default"].createElement(
        "svg",
        { width: "30", height: "30" },
        _react2["default"].createElement("path", { d: "M 10 8 L 22 14.5 L 10 21 z" })
      )
    );
  };

  ExecuteButton.prototype.componentDidMount = function componentDidMount() {
    var _this = this;

    this.keyHandler = function (event) {
      if ((event.metaKey || event.ctrlKey) && event.keyCode === 13) {
        event.preventDefault();
        if (_this.props.onClick) {
          _this.props.onClick();
        }
      }
    };
    document.addEventListener('keydown', this.keyHandler, true);
  };

  ExecuteButton.prototype.componentWillUnmount = function componentWillUnmount() {
    document.removeEventListener('keydown', this.keyHandler, true);
  };

  return ExecuteButton;
})(_react2["default"].Component);

exports.ExecuteButton = ExecuteButton;