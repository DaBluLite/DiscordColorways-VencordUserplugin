/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { DataStore } from ".";
import { nullColorwayObj } from "./constants";
import { Colorway, ColorwayObject, SourceObject } from "./types";

export const contexts: {
    colorwaysPluginTheme: string,
    colorwaysForceVR: boolean,
    colorwaySourceFiles: { name: string, url: string; }[],
    customColorways: { name: string, colorways: Colorway[]; }[],
    activeColorwayObject: ColorwayObject,
    activeAutoPreset: string,
    colorwayData: SourceObject[],
    showColorwaysButton: boolean,
    colorwayUsageMetrics: (ColorwayObject & { uses: number; })[],
    colorwaysManagerDoAutoconnect: boolean,
    colorwaysPreset: string,
    colorwaysManagerAutoconnectPeriod: number;
} = {
    colorwaysPluginTheme: "discord",
    colorwaysForceVR: false,
    colorwaySourceFiles: [],
    customColorways: [],
    activeColorwayObject: nullColorwayObj,
    activeAutoPreset: "hueRotation",
    colorwayData: [],
    showColorwaysButton: false,
    colorwayUsageMetrics: [],
    colorwaysManagerDoAutoconnect: true,
    colorwaysPreset: "default",
    colorwaysManagerAutoconnectPeriod: 3000
};

export async function initContexts() {
    const [
        colorwaysForceVR,
        colorwaysPluginTheme,
        customColorways,
        colorwaySourceFiles,
        activeColorwayObject,
        activeAutoPreset,
        showColorwaysButton,
        colorwayUsageMetrics,
        colorwaysManagerDoAutoconnect,
        colorwaysPreset,
        colorwaysManagerAutoconnectPeriod
    ] = await DataStore.getMany([
        "colorwaysForceVR",
        "colorwaysPluginTheme",
        "customColorways",
        "colorwaySourceFiles",
        "activeColorwayObject",
        "activeAutoPreset",
        "showColorwaysButton",
        "colorwayUsageMetrics",
        "colorwaysManagerDoAutoconnect",
        "colorwaysPreset",
        "colorwaysManagerAutoconnectPeriod"
    ]);

    contexts.colorwaysPluginTheme = colorwaysPluginTheme;
    contexts.colorwaysForceVR = colorwaysForceVR;
    contexts.customColorways = customColorways;
    contexts.colorwaySourceFiles = colorwaySourceFiles;
    contexts.activeColorwayObject = activeColorwayObject;
    contexts.activeAutoPreset = activeAutoPreset;
    contexts.showColorwaysButton = showColorwaysButton;
    contexts.colorwayUsageMetrics = colorwayUsageMetrics;
    contexts.colorwaysManagerDoAutoconnect = colorwaysManagerDoAutoconnect;
    contexts.colorwaysPreset = colorwaysPreset;
    contexts.colorwaysManagerAutoconnectPeriod = colorwaysManagerAutoconnectPeriod;

    const responses: Response[] = await Promise.all(
        colorwaySourceFiles.map(source =>
            fetch(source.url)
        )
    );

    contexts.colorwayData = await Promise.all(
        responses
            .map((res, i) => ({ response: res, name: colorwaySourceFiles[i].name }))
            .map((res: { response: Response, name: string; }) =>
                res.response.json().then(dt => ({ colorways: dt.colorways as Colorway[], source: res.name, type: "online" })).catch(() => ({ colorways: [] as Colorway[], source: res.name, type: "online" }))
            )) as { type: "online" | "offline" | "temporary", source: string, colorways: Colorway[]; }[];

    return contexts;
}

export function setContext(context: keyof typeof contexts, value: typeof contexts[keyof typeof contexts], save = true) {
    contexts[context] = value as never;
    save && DataStore.set(context, value);
    return value;
}

export async function refreshSources() {
    const responses: Response[] = await Promise.all(
        contexts.colorwaySourceFiles.map(source =>
            fetch(source.url)
        )
    );

    contexts.colorwayData = await Promise.all(
        responses
            .map((res, i) => ({ response: res, name: contexts.colorwaySourceFiles[i].name }))
            .map((res: { response: Response, name: string; }) =>
                res.response.json().then(dt => ({ colorways: dt.colorways as Colorway[], source: res.name, type: "online" })).catch(() => ({ colorways: [] as Colorway[], source: res.name, type: "online" }))
            )) as { type: "online" | "offline" | "temporary", source: string, colorways: Colorway[]; }[];
}
