/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

const changelog: {
    description: string, changes: {
        title: string,
        type: "fixed" | "progress" | "added" | "improved",
        items: string[];
    }[];
} = {
    description: "DiscordColorways is rapidly growing into a very complex app that has a lot of things to take care of. This update will keep things running smoothly.",
    changes: [
        {
            title: "Added",
            type: "added",
            items: [
                "Online sources now report the number of their colorways and presets"
            ]
        },
        {
            title: "Bug Fixes",
            type: "fixed",
            items: [
                "Fixed various bugs with the new Dispatcher API",
                "Fixed \"Save Preset As...\" modal"
            ]
        },
        {
            title: "Changes",
            type: "improved",
            items: [
                "Moved location of project links below logo",
                "Removed total colorway counter from settings",
            ]
        }
    ]
};

export default changelog;
