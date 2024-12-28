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
                "You can now use BetterDiscord compatible themes from DiscordColorways. This will come useful for Colorway Themes"
            ]
        }
    ]
};

export default changelog;
