/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

export var TEOF = "TEOF";
export var TOP = "TOP";
export var TNUMBER = "TNUMBER";
export var TSTRING = "TSTRING";
export var TPAREN = "TPAREN";
export var TBRACKET = "TBRACKET";
export var TCOMMA = "TCOMMA";
export var TNAME = "TNAME";
export var TSEMICOLON = "TSEMICOLON";

export function Token(type, value, index) {
    this.type = type;
    this.value = value;
    this.index = index;
}

Token.prototype.toString = function () {
    return this.type + ": " + this.value;
};
