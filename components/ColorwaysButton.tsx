/*
 * Vencord, a Discord client mod
 * Copyright (c) 2023 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Hooks, LayerManager } from "../api";
import { getAutoPresets } from "../css";
import { PalleteIcon } from "./Icons";
import ListItem from "./ListItem";
import MainUI from "./MainUI";

export default function ({ hasPill = true }: { hasPill?: boolean; }) {
    const [activeColorway] = Hooks.useContextualState("activeColorwayObject");
    const [visibility] = Hooks.useContextualState("showColorwaysButton");
    const [autoPreset] = Hooks.useContextualState("activeAutoPreset");

    return (visibility || window.BdApi) ? <ListItem
        hasPill={hasPill}
        tooltip={
            <>
                <span>Discord Colorways</span>
                <span style={{ color: "var(--text-muted)", fontWeight: 500, fontSize: 12 }}>{"Current Colorway: " + (activeColorway.id || "None")}</span>
                {(activeColorway.id === "Auto" && activeColorway.sourceType === "auto") ? <span style={{ color: "var(--text-muted)", fontWeight: 500, fontSize: 12 }}>{"Auto Colors: " + (autoPreset ? getAutoPresets()[autoPreset].name : "None")}</span> : <></>}
            </>
        }>
        {({ onMouseEnter, onMouseLeave, isActive, onClick }) => {
            return <div
                className="dc-app-launcher"
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
                onClick={e => {
                    onClick(e);
                    isActive(false);
                    LayerManager.pushLayer(() => <MainUI />);
                }}
            >
                <PalleteIcon />
            </div>;
        }}
    </ListItem> : <></>;
}
