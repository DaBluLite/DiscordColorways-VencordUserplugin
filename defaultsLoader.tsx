/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { DataStore } from ".";
import { defaultColorwaySource, nullColorwayObj } from "./constants";

export default async function () {

    const [
        customColorways,
        colorwaySourceFiles,
        showColorwaysButton,
        activeColorwayObject,
        colorwaysPluginTheme,
        colorwaysBoundManagers,
        colorwaysManagerAutoconnectPeriod,
        colorwaysManagerDoAutoconnect,
        colorwaysPreset,
        colorwaysForceVR,
        activeAutoPreset,
        colorwayUsageMetrics
    ] = await DataStore.getMany([
        "customColorways",
        "colorwaySourceFiles",
        "showColorwaysButton",
        "activeColorwayObject",
        "colorwaysPluginTheme",
        "colorwaysBoundManagers",
        "colorwaysManagerAutoconnectPeriod",
        "colorwaysManagerDoAutoconnect",
        "colorwaysPreset",
        "colorwaysForceVR",
        "activeAutoPreset",
        "colorwayUsageMetrics"
    ]);

    [
        {
            name: "colorwaysManagerAutoconnectPeriod",
            value: colorwaysManagerAutoconnectPeriod,
            default: 3000
        },
        {
            name: "colorwaysManagerDoAutoconnect",
            value: colorwaysManagerDoAutoconnect,
            default: true
        },
        {
            name: "showColorwaysButton",
            value: showColorwaysButton,
            default: false
        },
        {
            name: "colorwaysBoundManagers",
            value: colorwaysBoundManagers,
            default: []
        },
        {
            name: "activeColorwayObject",
            value: activeColorwayObject,
            default: nullColorwayObj
        },
        {
            name: "colorwaysPluginTheme",
            value: colorwaysPluginTheme,
            default: "discord"
        },
        {
            name: "colorwaysPreset",
            value: colorwaysPreset,
            default: "default"
        },
        {
            name: "colorwaysForceVR",
            value: colorwaysForceVR,
            default: false
        },
        {
            name: "activeAutoPreset",
            value: activeAutoPreset,
            default: "hueRotation"
        },
        {
            name: "colorwayUsageMetrics",
            value: colorwayUsageMetrics,
            default: []
        }
    ].forEach(({ name, value, default: def }) => {
        if (!value) DataStore.set(name, def);
    });

    if (customColorways && Array.isArray(customColorways) && customColorways.length) {
        if (typeof customColorways[0] !== "object" || !Object.keys(customColorways[0]).includes("colorways")) {
            DataStore.set("customColorways", [{ name: "Custom", colorways: customColorways }]);
        }
    } else {
        DataStore.set("customColorways", []);
    }

    if (colorwaySourceFiles) {
        if (typeof colorwaySourceFiles[0] === "string") {
            DataStore.set("colorwaySourceFiles", colorwaySourceFiles.map((sourceURL: string, i: number) => {
                return { name: sourceURL === defaultColorwaySource ? "Project Colorway" : `Source #${i}`, url: sourceURL === "https://raw.githubusercontent.com/DaBluLite/ProjectColorway/master/index.json" ? defaultColorwaySource : sourceURL };
            }));
        }
    } else {
        DataStore.set("colorwaySourceFiles", [{
            name: "Project Colorway",
            url: defaultColorwaySource
        }]);
    }

}
