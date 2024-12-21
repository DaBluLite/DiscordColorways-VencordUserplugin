/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { ColorwayObject } from "../../types";
import { getHSLIndex, HexToHSL } from "../Utils/Colors";

/**
 * Add a stylesheet with an ID
 * @param id The ID of the stylesheet
 * @param css The CSS of the stylesheet
 */
export function setStyle(id: string, css: string): void {
    if (!document.getElementById(id)) {
        document.head.append(Object.assign(document.createElement("style"), {
            id: id,
            textContent: css
        }));
    } else {
        document.getElementById(id).textContent = css;
    }
}

/**
 * Remove a specific style by ID
 * @param id The ID of the stylesheet
 * @description Returns true if style existed, false if not
 */
export function removeStyle(id: string): boolean {
    if (!document.getElementById(id)) {
        return false;
    } else {
        if (document.getElementById(id).tagName === "STYLE") {
            document.getElementById(id).remove();
            return true;
        } else {
            return false;
        }
    }
}

export function compileColorwayCSS(css: string, colors: ColorwayObject["colors"]): string {
    return css.replaceAll(/(colorway\((accent|primary|secondary|tertiary)(|-(h|s|l))\)|\{\{(accent|primary|secondary|tertiary)(|-(h|s|l))\}\})/g, (a, b, c, d, e, f, g, h) => h ? HexToHSL(colors[c])[getHSLIndex(h)] : (e ? HexToHSL(colors[c])[getHSLIndex(e)] : colors[c]));
}
