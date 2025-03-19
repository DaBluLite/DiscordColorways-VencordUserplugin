/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { colorwayDefaultRegex, colorwayVarRegex } from "../../constants";
import { ColorwayObject } from "../../types";
import { AST } from "..";
import { Parser } from "../ExpressionsParser";
import { getAllRegexMatches } from "../Utils";
import { getHSLIndex, HexToHSL } from "../Utils/Colors";
import { Atrule, StyleSheetPlain } from "../AST/CSS";

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

const fallbackColors = {
    primary: "#313338",
    secondary: "#2b2d31",
    tertiary: "#1e1f22",
    accent: "#5865f2"
};

export function compileColorwayCSS(css: string, colors: ColorwayObject["colors"]): string {
    return sanitisePreset(css)
        .replaceAll(/(?:colorway\()(accent|primary|secondary|tertiary)(?:|-(h|s|l))(?:|,\s(.*?))(?:\))/g, (_, color: "accent" | "primary" | "secondary" | "tertiary", index: "h" | "s" | "l" | undefined, fallback: string) => {
            fallback ??= fallbackColors[color];
            if (!colors[color]) return fallback;
            if (index) return String(HexToHSL(colors[color])[getHSLIndex(index)]);
            return colors[color];
        });
}

export const sanitisePreset = (css: string) => css.replaceAll("{{", "colorway(").replaceAll("}}", ")");

export function compileColorwayTheme(css: string, colorway: ColorwayObject): string {
    const { colors } = colorway;
    colors.primary ??= fallbackColors.primary;
    colors.secondary ??= fallbackColors.secondary;
    colors.tertiary ??= fallbackColors.tertiary;
    colors.accent ??= fallbackColors.accent;

    getAllRegexMatches(colorwayDefaultRegex, css).forEach(decl => {
        colors[decl[1]] = decl[2];
    });

    const evaluated = {
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
    }
    const ifStatements = ((AST.CSS.toPlainObject(AST.CSS.parse(css)) as StyleSheetPlain)
    .children
    .filter(node => (node.type === "Atrule" && node.name === "if")) as Atrule[])
    .map(node => ({ ...node, condition: (node.prelude as any).value.slice(1).split(") then")[0], selector: (node.prelude as any).value.split(" then ")[1], isTrue: Parser.evaluate((node.prelude as any).value.slice(1).split(") then")[0], evaluated) }))
    .filter(node => node.isTrue)
    .map(node => compileColorwayCSS(`${node.selector} {${Array(node.block?.children.map(decl => AST.CSS.generate(decl))).join(";")}}`, colors))
    .join("\n");

    return css
        .replaceAll(/(?:colorway\()(accent|primary|secondary|tertiary)(?:|-(h|s|l))(?:|,\s(.*?))(?:\))/g, (_, color: "accent" | "primary" | "secondary" | "tertiary", index: "h" | "s" | "l" | undefined, fallback: string) => {
            fallback ??= colors[color];
            if (colorway.id === null) return fallback;
            if (index) return String(HexToHSL(colors[color])[getHSLIndex(index)]);
            return colors[color];
        }) + "\n" + ifStatements + "\n" + ((css.match(colorwayVarRegex) && colorway.id !== null) ? compileColorwayCSS(`\n:root:root {\n ${sanitisePreset(getAllRegexMatches(colorwayVarRegex, css).map(decl => `--${decl[1]}: ${decl[2]};`).join("\n  "))}\n}`, colors) : "");
}
