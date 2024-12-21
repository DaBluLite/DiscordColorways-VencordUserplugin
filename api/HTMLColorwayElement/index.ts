/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Context, ContextKey, PresetCondition } from "../../types";
import { Dispatcher, Hooks, Logger, Presets, Styles } from "../";
import { getHSLIndex, HexToHSL } from "../Utils/Colors";

export default class extends HTMLStyleElement {
    constructor() {
        super();
        this.updateCSS();
        this.id = "active-colorway";
    }

    private logger = new Logger("Colorway CSS");

    connectedCallback() {
        Dispatcher.addListener("COLORWAYS_CONTEXT_UPDATED", () => this.updateCSS());
        Dispatcher.addListener("COLORWAYS_REMOVE_ACTIVE_COLORWAY_CSS", () => this.remove());
    }

    disconnectedCallback() {
        Dispatcher.removeListener("COLORWAYS_CONTEXT_UPDATED", () => this.updateCSS());
        Dispatcher.removeListener("COLORWAYS_REMOVE_ACTIVE_COLORWAY_CSS", () => this.remove());
    }

    updateCSS<Key extends ContextKey>(obj?: { c: Key, value: Context<Key>; }) {
        const [contexts, destroyContexts] = Hooks.simpleContexts();
        if (contexts().activeColorwayObject.id) {
            const { colors } = contexts().activeColorwayObject;
            const css = Styles.compileColorwayCSS(contexts().activePresetObject.css, colors);
            const conditions = (contexts().activePresetObject.conditions || [] as PresetCondition[]).map(({ if: val1, is, than, onCondition, onConditionElse }) => {
                if (Presets.conditionFunctions[is](HexToHSL(colors[val1.split("-")[0]])[getHSLIndex(val1.split("-")[1])], Number(than))) return Styles.compileColorwayCSS(onCondition, colors);
                else return Styles.compileColorwayCSS((onConditionElse || ""), colors);
            }).join("\n");
            // if (Object.keys(contexts().activeColorwayObject).includes("linearGradient")) {
            //     this.textContent = gradientBase(contexts().activeColorwayObject.colors, true) + `:root:root {--custom-theme-background: linear-gradient(${contexts().activeColorwayObject.linearGradient})}`;
            // } else {
            //     contexts().presets[contexts().colorwaysPreset] ? (this.textContent = contexts().presets[contexts().colorwaysPreset].preset(contexts().activeColorwayObject.colors)) : void 0;
            // }
            this.textContent = css + "\n" + conditions;
        }

        if (contexts().activeColorwayObject.id === null) {
            this.textContent = null;
        }

        return destroyContexts();
    }
}
