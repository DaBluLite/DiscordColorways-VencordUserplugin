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
            title: "The under-the-hood improvements",
            type: "improved",
            items: [
                "Removed unnessecary patches.",
                "Fixed the autoconnect toggle not working properly.",
                "The entirety of the under the hood storage system has been changed to contexts, thus improving startup times and performance.",
                "Auto colorway presets now change the colors generated from the system accent color, thus allowing you to use any preset for the auto colorway.",
                "Fixed various other bugs."
            ]
        },
        {
            title: "Bug Fixes",
            type: "fixed",
            items: [
                "Fixed usage metric saving, "
            ]
        },
        {
            title: "Changes & Additions",
            type: "added",
            items: [
                "New selector UI.",
                "Introducing the all-new presets: Download, share and create your own presets using the new tools provided by DiscordColorways"
            ]
        },
    ]
};

export default changelog;
