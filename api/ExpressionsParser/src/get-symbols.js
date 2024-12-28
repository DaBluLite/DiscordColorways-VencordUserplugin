/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import contains from "./contains";
import { IEXPR, IMEMBER, IVAR, IVARNAME } from "./instruction";

export default function getSymbols(tokens, symbols, options) {
    options = options || {};
    var withMembers = !!options.withMembers;
    var prevVar = null;

    for (var i = 0; i < tokens.length; i++) {
        var item = tokens[i];
        if (item.type === IVAR || item.type === IVARNAME) {
            if (!withMembers && !contains(symbols, item.value)) {
                symbols.push(item.value);
            } else if (prevVar !== null) {
                if (!contains(symbols, prevVar)) {
                    symbols.push(prevVar);
                }
                prevVar = item.value;
            } else {
                prevVar = item.value;
            }
        } else if (item.type === IMEMBER && withMembers && prevVar !== null) {
            prevVar += "." + item.value;
        } else if (item.type === IEXPR) {
            getSymbols(item.value, symbols, options);
        } else if (prevVar !== null) {
            if (!contains(symbols, prevVar)) {
                symbols.push(prevVar);
            }
            prevVar = null;
        }
    }

    if (prevVar !== null && !contains(symbols, prevVar)) {
        symbols.push(prevVar);
    }
}
