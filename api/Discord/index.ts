/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import style from "../../style";
import discordTheme from "../../theme.discord";
import discordVRTheme from "../../theme.discord-vr";
import { Context, ContextKey, Contexts as ContextsType, PresetCondition } from "../../types";
import { Contexts, Dispatcher, Presets, Styles, WebSocket } from "..";
import { simpleContext } from "../Hooks";
import { compileColorwayTheme } from "../Styles";
import { getThemesList } from "../Themes";
import { kebabCase } from "../Utils";
import { getHSLIndex, HexToHSL } from "../Utils/Colors";
import * as $Settings from "./Settings";

export const Settings = $Settings;

const updateThemes = async (contexts: ContextsType) => {
    const hasActiveTheme = Object.values(contexts.enabledColorwayThemes).includes(true);
    const themes = await getThemesList();
    Object.keys(contexts.enabledColorwayThemes).forEach(theme => {
        if ((contexts.enabledColorwayThemes[theme] === true) && themes.find(({ header }) => header.name === theme)) {
            Styles.setStyle("dc-theme-" + kebabCase(theme), compileColorwayTheme(themes.find(({ header }) => header.name === theme)?.css as string, contexts.activeColorwayObject));
        } else {
            Styles.removeStyle("dc-theme-" + kebabCase(theme));
        }
    });

    if (!hasActiveTheme) {
        Styles.setStyle("dc-css-active-colorway", (() => {
            if (contexts.activeColorwayObject.id) {
                const { colors } = contexts.activeColorwayObject;
                const css = Styles.compileColorwayCSS(contexts.activePresetObject.css, colors);
                const conditions = (contexts.activePresetObject.conditions || [] as PresetCondition[]).map(({ if: val1, is, than, onCondition, onConditionElse }) => {
                    if (Presets.conditionFunctions[is](HexToHSL(colors[val1.split("-")[0]])[getHSLIndex(val1.split("-")[1])], Number(than))) return Styles.compileColorwayCSS(onCondition, colors);
                    else return Styles.compileColorwayCSS((onConditionElse || ""), colors);
                }).join("\n");
                return css + "\n" + conditions;
            }
            return "";
        })());
    } else {
        Styles.setStyle("dc-css-active-colorway", "");
    }
};

export function start(callback: (context: Record<ContextKey, Context<ContextKey>>) => void = () => { }) {
    Styles.setStyle("dc-css-main", style);
    Styles.setStyle("dc-css-theme-discord", discordTheme);
    Styles.setStyle("dc-css-theme-discordvr", discordVRTheme);

    Contexts.initContexts().then(contexts => {
        updateThemes(contexts);

        Dispatcher.addListener("COLORWAYS_CONTEXT_UPDATED", ({ contexts }) => updateThemes(contexts));

        WebSocket.connect();

        callback(contexts);
    });
}

export function stop() {
    const [enabledColorwayThemes, _, discard] = simpleContext("enabledColorwayThemes");
    Styles.removeStyle("dc-css-main");
    Styles.removeStyle("dc-css-theme-discord");
    Styles.removeStyle("dc-css-theme-discordvr");
    Styles.removeStyle("dc-css-active-colorway");
    Object.keys(enabledColorwayThemes()).forEach(theme => Styles.removeStyle("dc-theme-" + kebabCase(theme)));
    Dispatcher.dispatch("COLORWAYS_CLOSE_WS", {});
    Dispatcher.removeListener("COLORWAYS_CONTEXT_UPDATED", ({ contexts }) => updateThemes(contexts));
    return discard();
}
