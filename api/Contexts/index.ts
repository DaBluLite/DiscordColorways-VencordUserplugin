/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { getThemeData, getThemesList } from "../..";
import openChangelogModal from "../../components/Modals/openChangelogModal";
import { colorwayVarRegex, defaultColorwaySource, nullColorwayObj } from "../../constants";
import { Colorway, ColorwayObject, Context, ContextKey, Preset, PresetObject, SourceObject } from "../../types";
import { DataStore, Dispatcher } from "../";

const defaultPreset: Preset = {
    name: "Discord",
    source: "Built-In",
    sourceType: "builtin",
    author: "DaBluLite",
    css: `:root:root {
    --brand-100-hsl: colorway(accent-h) calc(var(--saturation-factor, 1)*colorway(accent-s)%) max(calc(colorway(accent-l)% + 33.5%), 0);
    --brand-130-hsl: colorway(accent-h) calc(var(--saturation-factor, 1)*colorway(accent-s)%) max(calc(colorway(accent-l)% + 32.2%), 0%);
    --brand-160-hsl: colorway(accent-h) calc(var(--saturation-factor, 1)*colorway(accent-s)%) max(calc(colorway(accent-l)% + 30.2%), 0%);
    --brand-200-hsl: colorway(accent-h) calc(var(--saturation-factor, 1)*colorway(accent-s)%) max(calc(colorway(accent-l)% + 28.2%), 0%);
    --brand-230-hsl: colorway(accent-h) calc(var(--saturation-factor, 1)*colorway(accent-s)%) max(calc(colorway(accent-l)% + 26.2999%), 0%);
    --brand-260-hsl: colorway(accent-h) calc(var(--saturation-factor, 1)*colorway(accent-s)%) max(calc(colorway(accent-l)% + 23.8999%), 0%);
    --brand-300-hsl: colorway(accent-h) calc(var(--saturation-factor, 1)*colorway(accent-s)%) max(calc(colorway(accent-l)% + 21.2%), 0%);
    --brand-330-hsl: colorway(accent-h) calc(var(--saturation-factor, 1)*colorway(accent-s)%) max(calc(colorway(accent-l)% + 16.8999%), 0%);
    --brand-345-hsl: colorway(accent-h) calc(var(--saturation-factor, 1)*colorway(accent-s)%) max(calc(colorway(accent-l)% + 14.0999%), 0%);
    --brand-360-hsl: colorway(accent-h) calc(var(--saturation-factor, 1)*colorway(accent-s)%) max(calc(colorway(accent-l)% + 12.7999%), 0%);
    --brand-400-hsl: colorway(accent-h) calc(var(--saturation-factor, 1)*colorway(accent-s)%) max(calc(colorway(accent-l)% + 7.0999%), 0%);
    --brand-430-hsl: colorway(accent-h) calc(var(--saturation-factor, 1)*colorway(accent-s)%) max(calc(colorway(accent-l)% + 5.0999%), 0%);
    --brand-460-hsl: colorway(accent-h) calc(var(--saturation-factor, 1)*colorway(accent-s)%) max(calc(colorway(accent-l)% + 2.7999%), 0%);
    --brand-500-hsl: colorway(accent-h) calc(var(--saturation-factor, 1)*colorway(accent-s)%) colorway(accent-l)%;
    --brand-530-hsl: colorway(accent-h) calc(var(--saturation-factor, 1)*colorway(accent-s)%) min(calc(colorway(accent-l)% - 5.9%), 100%);
    --brand-560-hsl: colorway(accent-h) calc(var(--saturation-factor, 1)*colorway(accent-s)%) min(calc(colorway(accent-l)% - 12.3%), 100%);
    --brand-600-hsl: colorway(accent-h) calc(var(--saturation-factor, 1)*colorway(accent-s)%) min(calc(colorway(accent-l)% - 20.6%), 100%);
    --brand-630-hsl: colorway(accent-h) calc(var(--saturation-factor, 1)*colorway(accent-s)%) min(calc(colorway(accent-l)% - 26.5%), 100%);
    --brand-660-hsl: colorway(accent-h) calc(var(--saturation-factor, 1)*colorway(accent-s)%) min(calc(colorway(accent-l)% - 31.4%), 100%);
    --brand-700-hsl: colorway(accent-h) calc(var(--saturation-factor, 1)*colorway(accent-s)%) min(calc(colorway(accent-l)% - 38.8%), 100%);
    --brand-730-hsl: colorway(accent-h) calc(var(--saturation-factor, 1)*colorway(accent-s)%) min(calc(colorway(accent-l)% - 40.4%), 100%);
    --brand-760-hsl: colorway(accent-h) calc(var(--saturation-factor, 1)*colorway(accent-s)%) min(calc(colorway(accent-l)% - 42.5%), 100%);
    --brand-800-hsl: colorway(accent-h) calc(var(--saturation-factor, 1)*colorway(accent-s)%) min(calc(colorway(accent-l)% - 45.3%), 100%);
    --brand-830-hsl: colorway(accent-h) calc(var(--saturation-factor, 1)*colorway(accent-s)%) min(calc(colorway(accent-l)% - 49.8%), 100%);
    --brand-860-hsl: colorway(accent-h) calc(var(--saturation-factor, 1)*colorway(accent-s)%) min(calc(colorway(accent-l)% - 55.1%), 100%);
    --brand-900-hsl: colorway(accent-h) calc(var(--saturation-factor, 1)*colorway(accent-s)%) min(calc(colorway(accent-l)% - 61.6%), 100%);
}

.theme-dark {
    --primary-800-hsl: colorway(tertiary-h) calc(var(--saturation-factor, 1)*colorway(tertiary-s)%) max(calc(colorway(tertiary-l)% - 7.2%), 0%);
    --primary-730-hsl: colorway(tertiary-h) calc(var(--saturation-factor, 1)*colorway(tertiary-s)%) max(calc(colorway(tertiary-l)% - 3.6%), 0%);
    --primary-700-hsl: colorway(tertiary-h) calc(var(--saturation-factor, 1)*colorway(tertiary-s)%) colorway(tertiary-l)%;
    --primary-660-hsl: colorway(secondary-h) calc(var(--saturation-factor, 1)*colorway(secondary-s)%) max(calc(colorway(secondary-l)% - 3.6%), 0%);
    --primary-645-hsl: colorway(secondary-h) calc(var(--saturation-factor, 1)*colorway(secondary-s)%) max(calc(colorway(secondary-l)% - 1.1%), 0%);
    --primary-630-hsl: colorway(secondary-h) calc(var(--saturation-factor, 1)*colorway(secondary-s)%) colorway(secondary-l)%;
    --primary-600-hsl: colorway(primary-h) calc(var(--saturation-factor, 1)*colorway(primary-s)%) colorway(primary-l)%;
    --primary-560-hsl: colorway(primary-h) calc(var(--saturation-factor, 1)*colorway(primary-s)%) min(calc(colorway(primary-l)% + 3.6%), 100%);
    --primary-530-hsl: colorway(primary-h) calc(var(--saturation-factor, 1)*colorway(primary-s)%) min(calc(colorway(primary-l)% + 7.2%), 100%);
    --primary-500-hsl: colorway(primary-h) calc(var(--saturation-factor, 1)*colorway(primary-s)%) min(calc(colorway(primary-l)% + 10.8%), 100%);
    --interactive-muted: hsl(colorway(primary-h) calc(colorway(primary-s)%/2) max(min(calc(colorway(primary-l)% - 5%), 100%), 45%));
    --primary-460-hsl: 0 calc(var(--saturation-factor, 1)*0%) 50%;
}

.theme-light {
    --white-500-hsl: colorway(primary-h) calc(var(--saturation-factor, 1)*colorway(primary-s)%) min(calc(colorway(primary-l)% + 80%), 90%);
    --primary-130-hsl: colorway(secondary-h) calc(var(--saturation-factor, 1)*colorway(secondary-s)%) min(calc(colorway(secondary-l)% + 80%), 85%);
    --primary-160-hsl: colorway(secondary-h) calc(var(--saturation-factor, 1)*colorway(secondary-s)%) min(calc(colorway(secondary-l)% + 76.4%), 82.5%);
    --primary-200-hsl: colorway(tertiary-h) calc(var(--saturation-factor, 1)*colorway(tertiary-s)%) min(calc(colorway(tertiary-l)% + 80%), 80%);
}

.emptyPage_c6b11b,
.scrollerContainer_c6b11b,
.container_f1fd9c,
.header_f1fd9c {
    background-color: unset !important;
}

.container_c2efea,
.container_f1fd9c,
.header_f1fd9c {
    background: transparent !important;
}`,
    conditions: [
        {
            if: "primary-l",
            is: "greaterThan",
            than: "80",
            onCondition: `/*Primary*/
.theme-dark .container_c2739c,
.theme-dark .body_cd82a7,
.theme-dark .toolbar_fc4f04,
.theme-dark .container_f0fccd,
.theme-dark .messageContent_f9f2ca,
.theme-dark .attachButtonPlus_f298d4,
.theme-dark .username_f9f2ca:not([style]),
.theme-dark .children_fc4f04,
.theme-dark .buttonContainer_f9f2ca,
.theme-dark .listItem_c96c45,
.theme-dark .body_cd82a7 .caret_fc4f04,
.theme-dark .body_cd82a7 .titleWrapper_fc4f04 > h1,
.theme-dark .body_cd82a7 .icon_fc4f04 {
    --white-500: black !important;
    --interactive-normal: black !important;
    --text-normal: black !important;
    --text-muted: black !important;
    --header-primary: black !important;
    --header-secondary: black !important;
}

.theme-dark .contentRegionScroller_c25c6d :not(.mtk1,.mtk2,.mtk3,.mtk4,.mtk5,.mtk6,.mtk7,.mtk8,.mtk9,.monaco-editor .line-numbers) {
    --white-500: black !important;
}

.theme-dark .container_fc4f04 {
    --channel-icon: black;
}

.theme-dark .channelTextArea_a7d72e {
    --text-normal: black;
}

.theme-dark .placeholder_a552a6 {
    --channel-text-area-placeholder: black;
}

.theme-dark .placeholder_a552a6 {
    opacity: .6;
}

.theme-dark .root_f9a4c9 > .header_f9a4c9 > h1 {
    color: black;
}
/*End Primary*/`
        },
        {
            if: "secondary-l",
            is: "greaterThan",
            than: "80",
            onCondition: `/*Secondary*/
.theme-dark .wrapper_cd82a7 *,
.theme-dark .sidebar_a4d4d9 *:not(.hasBanner_fd6364 *),
.theme-dark .members_cbd271 *:not([style]),
.theme-dark .sidebarRegionScroller_c25c6d *,
.theme-dark .header_e06857,
.theme-dark .lookFilled_dd4f85.colorPrimary_dd4f85 {
    --white-500: black !important;
    --channels-default: black !important;
    --channel-icon: black !important;
    --interactive-normal: var(--white-500);
    --interactive-hover: var(--white-500);
    --interactive-active: var(--white-500);
}

.theme-dark .channelRow_f04d06 {
    background-color: var(--background-secondary);
}

.theme-dark .channelRow_f04d06 * {
    --channel-icon: black;
}

.theme-dark #app-mount .activity_a31c43 {
    --channels-default: var(--white-500) !important;
}

.theme-dark .nameTag_b2ca13 {
    --header-primary: black !important;
}

.theme-dark .bannerVisible_fd6364 .headerContent_fd6364 {
    color: #fff;
}

.theme-dark .embedFull_b0068a {
    --text-normal: black;
}
/*End Secondary*/`
        },
        {
            if: "secondary-h",
            is: "equal",
            than: "0",
            onCondition: `.theme-dark .nameTag_b2ca13 {
    --header-secondary: gray !important;
}
:root:root {
    --primary-430: gray;
    --neutral-36: gray;
    --primary-400: gray;
    --neutral-31: gray;
    --primary-360: gray;
    --neutral-24: gray;
}`,
            onConditionElse: `.theme-dark .nameTag_b2ca13 {
    --header-secondary: hsl(colorway(secondary-h), calc(var(--saturation-factor, 1)*100%), 90%) !important;
}
:root:root {
    --primary-430: hsl(colorway(secondary-h), calc(var(--saturation-factor, 1)*colorway(primary-s)%), 90%);
    --neutral-36: hsl(colorway(secondary-h), calc(var(--saturation-factor, 1)*colorway(primary-s)%), 90%);
    --primary-400: hsl(colorway(secondary-h), calc(var(--saturation-factor, 1)*colorway(primary-s)%), 90%);
    --neutral-31: hsl(colorway(secondary-h), calc(var(--saturation-factor, 1)*colorway(primary-s)%), 90%);
    --primary-360: hsl(colorway(secondary-h), calc(var(--saturation-factor, 1)*colorway(primary-s)%), 90%);
    --neutral-24: hsl(colorway(secondary-h), calc(var(--saturation-factor, 1)*colorway(primary-s)%), 90%);
}`
        },
        {
            if: "tertiary-l",
            is: "greaterThan",
            than: "80",
            onCondition: `/*Tertiary*/
.theme-dark .winButton_a934d8,
.theme-dark .searchBar_e0840f *,
.theme-dark .wordmarkWindows_a934d8,
.theme-dark .searchBar_a46bef *,
.theme-dark .searchBarComponent_f0963d {
    --white-500: black !important;
}

.theme-dark .popout_c5b389 > * {
    --interactive-normal: black !important;
    --header-secondary: black !important;
}

.theme-dark .tooltip_b6c360 {
    --text-normal: black !important;
}
.theme-dark .children_fc4f04 .icon_fc4f04 {
    color: var(--interactive-active) !important;
}
.theme-dark .callContainer_d880dc {
    --white-500: black !important;
}
/*End Tertiary*/`,
            onConditionElse: `.theme-dark .callContainer_d880dc {
    --white-500: white !important;
}`
        },
        {
            if: "accent-l",
            is: "greaterThan",
            than: "80",
            onCondition: `/*Accent*/
.selected_db6521 *,
.selected_ae80f7 *,
#app-mount .lookFilled_dd4f85.colorBrand_dd4f85:not(.buttonColor_adcaac),
.colorDefault_d90b3d.focused_d90b3d,
.row_c5b389:hover,
.checkmarkCircle_cb7c27 > circle {
    --white-500: black !important;
}

.dc-app-launcher:hover .vc-pallete-icon {
    color: #000 !important;
}

:root:root {
    --mention-foreground: black !important;
}
/*End Accent*/`
        }
    ]
};

export const contexts: {
    colorwaysPluginTheme: string,
    colorwaySourceFiles: { name: string, url: string; }[],
    customColorways: { name: string, colorways?: Colorway[], presets?: Preset[]; }[],
    activeColorwayObject: ColorwayObject,
    activeAutoPreset: string,
    colorwayData: SourceObject[],
    showColorwaysButton: boolean,
    colorwayUsageMetrics: (ColorwayObject & { uses: number; })[],
    colorwaysManagerDoAutoconnect: boolean,
    colorwaysManagerAutoconnectPeriod: number,
    hasManagerRole: boolean,
    isConnected: boolean,
    boundKey: { [managerKey: string]: string; },
    colorwaysBoundManagers: { [managerKey: string]: string; }[];
    discordColorwaysData: {
        version: string,
        UIVersion: string;
    };
    themePresets: Preset[];
    activePresetObject: PresetObject;
    colorwaysDiscordPreset: Preset;
} = {
    colorwaysPluginTheme: "discord",
    colorwaySourceFiles: [],
    customColorways: [],
    activeColorwayObject: nullColorwayObj,
    activeAutoPreset: "hueRotation",
    colorwayData: [],
    showColorwaysButton: false,
    colorwayUsageMetrics: [],
    colorwaysManagerDoAutoconnect: true,
    colorwaysManagerAutoconnectPeriod: 3000,
    hasManagerRole: false,
    isConnected: false,
    boundKey: { "00000000": `discord.${Math.random().toString(16).slice(2)}.${new Date().getUTCMilliseconds()}` },
    colorwaysBoundManagers: [],
    discordColorwaysData: {
        version: "8.0.1",
        UIVersion: "3.0.0"
    },
    themePresets: [],
    activePresetObject: { id: defaultPreset.name, source: defaultPreset.source, sourceType: defaultPreset.sourceType, css: defaultPreset.css, conditions: defaultPreset.conditions },
    colorwaysDiscordPreset: defaultPreset
};

export const unsavedContexts = ["themePresets", "isConnected", "boundKey", "hasManagerRole", "colorwayData"];

const contextKeys = Object.keys(contexts).filter(key => unsavedContexts.includes(key) === false);

export async function initContexts() {
    const data = await DataStore.getMany(contextKeys);

    contextKeys.forEach(async (key, i) => {
        if (data[i] === undefined) {
            DataStore.set(key, contexts[key]);
            if (key === "discordColorwaysData") {
                openChangelogModal();
            }
        } else {
            if (key === "discordColorwaysData" && (data[i].version !== contexts.discordColorwaysData.version)) {
                await DataStore.set(key, { ...data[i], version: contexts.discordColorwaysData.version });
                openChangelogModal();
            } else {
                contexts[key] = data[i];
            }
        }
    });

    const responses: Response[] = await Promise.all(
        contexts.colorwaySourceFiles.map(source =>
            fetch(source.url)
        )
    );

    const themes = await getThemesList();

    themes.forEach(async theme => {
        const css = await getThemeData(theme.fileName);
        if (css && css.match(colorwayVarRegex)) {
            setContext("themePresets", [
                ...contexts.themePresets, {
                    name: theme.name,
                    css: `:root:root {\n ${[
                        ...(css.match(colorwayVarRegex) || []).map(decl => (`--${decl.split(" ")[1]}: ${decl.split("@colorwayVar " + decl.split(" ")[1] + " ")[1]};`)),
                    ].join("\n  ")}\n}`,
                    author: theme.author,
                    sourceType: "theme",
                    source: theme.name
                }
            ], false);
        }
    });

    contexts.colorwayData = await Promise.all(
        responses
            .map((res, i) => ({ response: res, name: contexts.colorwaySourceFiles[i].name }))
            .map((res: { response: Response, name: string; }) =>
                res.response.json().then(dt => ({
                    colorways: (dt.colorways || []), presets: (dt.presets || [] as Preset[]).filter(preset => {
                        if (preset.name === "Discord" && preset.author === "DaBluLite" && res.response.url === defaultColorwaySource) {
                            contexts.colorwaysDiscordPreset = {
                                name: "Discord",
                                source: "Built-In",
                                sourceType: "builtin",
                                author: "DaBluLite",
                                css: preset.css,
                                conditions: preset.conditions
                            };
                            return false;
                        }
                        return true;
                    }), source: res.name, type: "online"
                })).catch(() => ({ colorways: [] as Colorway[], presets: [] as Preset[], source: res.name, type: "online" }))
            )) as { type: "online" | "offline", source: string, colorways: Colorway[]; }[];

    Object.keys(contexts).forEach(c => {
        Dispatcher.dispatch("COLORWAYS_CONTEXT_UPDATED", {
            c,
            value: contexts[c]
        });
    });

    return contexts;
}

export function setContext<C extends keyof typeof contexts>(context: C, value: typeof contexts[C], save = true): typeof contexts[C] {
    contexts[context] = value as never;
    Dispatcher.dispatch("COLORWAYS_CONTEXT_UPDATED", {
        c: context,
        value: value,
    });
    save && DataStore.set(context, value);
    return value;
}

export function setContexts<C extends ContextKey>(...conts: ([C, Context<C>] | [C, Context<C>, boolean])[]) {
    conts.forEach(context => {
        if (context[2]) {
            setContext(context[0], context[1], context[2]);
        }
    });
}
