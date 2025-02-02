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
    description: "Just a maintenance update with a few bug fixes.",
    changes: [
        {
            title: "Improved",
            type: "improved",
            items: [
                "Overall stability improvements"
            ]
        }
    ]
};

export default changelog;
