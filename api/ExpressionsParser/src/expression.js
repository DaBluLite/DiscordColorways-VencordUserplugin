/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import evaluate from "./evaluate";
import expressionToString from "./expression-to-string";
import getSymbols from "./get-symbols";
import simplify from "./simplify";
import substitute from "./substitute";

export function Expression(tokens, parser) {
    this.tokens = tokens;
    this.parser = parser;
    this.unaryOps = parser.unaryOps;
    this.binaryOps = parser.binaryOps;
    this.ternaryOps = parser.ternaryOps;
    this.functions = parser.functions;
}

Expression.prototype.simplify = function (values) {
    values = values || {};
    return new Expression(simplify(this.tokens, this.unaryOps, this.binaryOps, this.ternaryOps, values), this.parser);
};

Expression.prototype.substitute = function (variable, expr) {
    if (!(expr instanceof Expression)) {
        expr = this.parser.parse(String(expr));
    }

    return new Expression(substitute(this.tokens, variable, expr), this.parser);
};

Expression.prototype.evaluate = function (values) {
    values = values || {};
    return evaluate(this.tokens, this, values);
};

Expression.prototype.toString = function () {
    return expressionToString(this.tokens, false);
};

Expression.prototype.symbols = function (options) {
    options = options || {};
    var vars = [];
    getSymbols(this.tokens, vars, options);
    return vars;
};

Expression.prototype.variables = function (options) {
    options = options || {};
    var vars = [];
    getSymbols(this.tokens, vars, options);
    var { functions } = this;
    return vars.filter(function (name) {
        return !(name in functions);
    });
};

Expression.prototype.toJSFunction = function (param, variables) {
    var expr = this;
    var f = new Function(param, "with(this.functions) with (this.ternaryOps) with (this.binaryOps) with (this.unaryOps) { return " + expressionToString(this.simplify(variables).tokens, true) + "; }");
    return function () {
        return f.apply(expr, arguments);
    };
};
