/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { colorwayDefaultRegex, colorwayVarRegex } from "../../constants";
import { ColorwayObject } from "../../types";
import { Logger } from "..";
import { Parser } from "../ExpressionsParser";
import { getAllRegexMatches } from "../Utils";
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
        (document.getElementById(id) as HTMLStyleElement).textContent = css;
    }
}

/**
 * Remove a specific style by ID
 * @param id The ID of the stylesheet
 * @description Returns true if style existed, false if not
 */
export function removeStyle(id: string): boolean {
    if (document.getElementById(id)) {
        (document.getElementById(id) as HTMLStyleElement).remove();
        return true;
    } else {
        return false;
    }
}

export function compileColorwayCSS(css: string, colors: ColorwayObject["colors"]): string {
    const fallbackColors = {
        primary: "#313338",
        secondary: "#2b2d31",
        tertiary: "#1e1f22",
        accent: "#5865f2"
    };
    return sanitisePreset(css)
        .replaceAll(/(?:colorway\()(accent|primary|secondary|tertiary)(?:|-(h|s|l))(?:|,\s(.*?))(?:\))/g, (_, color: "accent" | "primary" | "secondary" | "tertiary", index: "h" | "s" | "l" | undefined, fallback: string) => {
            fallback ??= fallbackColors[color];
            if (!colors[color]) return fallback;
            if (index) return String(HexToHSL(colors[color])[getHSLIndex(index)]);
            return colors[color];
        });
}

export function sanitisePreset(css: string) {
    return css.replaceAll("{{", "colorway(").replaceAll("}}", ")");
}

export function compileColorwayTheme(css: string, colorway: ColorwayObject): string {
    const { colors } = colorway;
    colors.primary ??= "#313338";
    colors.secondary ??= "#2b2d31";
    colors.tertiary ??= "#1e1f22";
    colors.accent ??= "#5865f2";
    const logger = new Logger("ColorwayThemeCompiler");
    function evaluateIfStatement(ifStatement: string): boolean {
        try {
            const isTrue = Parser.evaluate(ifStatement, {
                accent_h: HexToHSL(colors.accent)[0],
                accent_s: HexToHSL(colors.accent)[1],
                accent_l: HexToHSL(colors.accent)[2],
                primary_h: HexToHSL(colors.primary)[0],
                primary_s: HexToHSL(colors.primary)[1],
                primary_l: HexToHSL(colors.primary)[2],
                secondary_h: HexToHSL(colors.secondary)[0],
                secondary_s: HexToHSL(colors.secondary)[1],
                secondary_l: HexToHSL(colors.secondary)[2],
                tertiary_h: HexToHSL(colors.tertiary)[0],
                tertiary_s: HexToHSL(colors.tertiary)[1],
                tertiary_l: HexToHSL(colors.tertiary)[2]
            });

            return Boolean(isTrue);
        } catch (e) {
            logger.warn("Error while compiling Colorway CSS:", e);
            return false;
        }
    }

    getAllRegexMatches(colorwayDefaultRegex, css).forEach(decl => {
        colors[decl[1]] = decl[2];
    });

    return css
        .replaceAll(/(?:colorway\()(accent|primary|secondary|tertiary)(?:|-(h|s|l))(?:|,\s(.*?))(?:\))/g, (_, color: "accent" | "primary" | "secondary" | "tertiary", index: "h" | "s" | "l" | undefined, fallback: string) => {
            fallback ??= colors[color];
            if (colorway.id === null) return fallback;
            if (index) return String(HexToHSL(colors[color])[getHSLIndex(index)]);
            return colors[color];
        })
        .replaceAll(/@if\((.*?)\) {([\S\s^{]*?)}@end-if\(\);/gdm, (_: string, ifStatement: string, onTrue: string) => {
            if (evaluateIfStatement(ifStatement) && colorway.id !== null) {
                return "\n" + compileColorwayTheme(onTrue.replaceAll("|end-if();", "@end-if();").replaceAll("|if", "@if"), colorway);
            }
            return "";
        }) + ((css.match(colorwayVarRegex) && colorway.id !== null) ? compileColorwayCSS(`\n:root:root {\n ${sanitisePreset(getAllRegexMatches(colorwayVarRegex, css).map(decl => `--${decl[1]}: ${decl[2]};`).join("\n  "))}\n}`, colors) : "");
}
