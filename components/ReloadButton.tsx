/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Dispatch, SetStateAction } from "react";

import { Contexts, Hooks } from "../api";
import { defaultColorwaySource } from "../constants";
import { Colorway, Preset } from "../types";
import StaticOptionsMenu from "./StaticOptionsMenu";

export default function ({
    setShowSpinner
}: {
    setShowSpinner: Dispatch<SetStateAction<boolean>>;
}) {
    const [colorwaySourceFiles] = Hooks.useContextualState("colorwaySourceFiles");
    const [colorwayData, setColorwayData] = Hooks.useContextualState("colorwayData", false);
    async function onReload_internal(force = false) {
        setShowSpinner(true);

        const responses: Response[] = await Promise.all(
            colorwaySourceFiles.map(source =>
                fetch(source.url, force ? { "cache": "no-store" } : {})
            )
        );

        setColorwayData(await Promise.all(
            responses
                .map((res, i) => ({ response: res, name: colorwaySourceFiles[i].name }))
                .map((res: { response: Response, name: string; }) =>
                    res.response.json().then(dt => ({
                        colorways: (dt.colorways || []), presets: (dt.presets || [] as Preset[]).filter(preset => {
                            if (preset.name === "Discord" && preset.author === "DaBluLite" && res.response.url === defaultColorwaySource) {
                                Contexts.setContext("colorwaysDiscordPreset", {
                                    name: "Discord",
                                    source: "Built-In",
                                    sourceType: "builtin",
                                    author: "DaBluLite",
                                    css: preset.css,
                                    conditions: preset.conditions
                                });
                                return false;
                            }
                            return true;
                        }), source: res.name, type: "online"
                    })).catch(() => ({ colorways: [] as Colorway[], presets: [] as Preset[], source: res.name, type: "online" }))
                )) as { type: "online" | "offline", source: string, colorways: Colorway[]; }[]);

        colorwayData.find(d => d.source === "Project Colorway")!.presets?.forEach(preset => {
            if (preset.name === "Discord" && preset.author === "DaBluLite") Contexts.setContext("colorwaysDiscordPreset", {
                name: "Discord",
                source: "Built-In",
                sourceType: "builtin",
                author: "DaBluLite",
                css: preset.css,
                conditions: preset.conditions
            });
        });

        setShowSpinner(false);
    }

    return <StaticOptionsMenu menu={<button onClick={() => onReload_internal(true)} className="dc-contextmenu-item">
        Force Refresh
        <svg
            xmlns="http://www.w3.org/2000/svg"
            x="0px"
            y="0px"
            width="18"
            height="18"
            style={{ boxSizing: "content-box", marginLeft: "8px" }}
            viewBox="0 0 24 24"
            fill="currentColor"
        >
            <rect
                y="0"
                fill="none"
                width="24"
                height="24"
            />
            <path
                d="M6.351,6.351C7.824,4.871,9.828,4,12,4c4.411,0,8,3.589,8,8h2c0-5.515-4.486-10-10-10 C9.285,2,6.779,3.089,4.938,4.938L3,3v6h6L6.351,6.351z"
            />
            <path
                d="M17.649,17.649C16.176,19.129,14.173,20,12,20c-4.411,0-8-3.589-8-8H2c0,5.515,4.486,10,10,10 c2.716,0,5.221-1.089,7.062-2.938L21,21v-6h-6L17.649,17.649z"
            />
        </svg>
    </button>}>
        {({ onClick }) => <button className="dc-button dc-button-primary" onContextMenu={onClick} onClick={() => onReload_internal()}>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                x="0px"
                y="0px"
                width="14"
                height="14"
                style={{ boxSizing: "content-box" }}
                viewBox="0 0 24 24"
                fill="currentColor"
            >
                <rect
                    y="0"
                    fill="none"
                    width="24"
                    height="24"
                />
                <path
                    d="M6.351,6.351C7.824,4.871,9.828,4,12,4c4.411,0,8,3.589,8,8h2c0-5.515-4.486-10-10-10 C9.285,2,6.779,3.089,4.938,4.938L3,3v6h6L6.351,6.351z"
                />
                <path
                    d="M17.649,17.649C16.176,19.129,14.173,20,12,20c-4.411,0-8-3.589-8-8H2c0,5.515,4.486,10,10,10 c2.716,0,5.221-1.089,7.062-2.938L21,21v-6h-6L17.649,17.649z"
                />
            </svg>
            Refresh
        </button>}
    </StaticOptionsMenu>;
}
