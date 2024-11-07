/*
 * Vencord, a Discord client mod
 * Copyright (c) 2023 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { DataStore, FluxDispatcher, FluxEvents, openModal, PluginProps, useEffect, useState } from "..";
import { contexts } from "../contexts";
import { getAutoPresets } from "../css";
import { ColorwayObject } from "../types";
import { PalleteIcon } from "./Icons";
import ListItem from "./ListItem";
import MainModal from "./Modals/MainModal";

export default function () {
    const [activeColorway, setActiveColorway] = useState<ColorwayObject>(contexts.activeColorwayObject);
    const [visibility, setVisibility] = useState<boolean>(false);
    const [autoPreset, setAutoPreset] = useState<string>(contexts.activeAutoPreset);
    useEffect(() => {
        (async function () {
            setVisibility(await DataStore.get("showColorwaysButton") as boolean);
        })();

        FluxDispatcher.subscribe("COLORWAYS_UPDATE_BUTTON_VISIBILITY" as FluxEvents, ({ isVisible }) => setVisibility(isVisible));

        return () => {
            FluxDispatcher.unsubscribe("COLORWAYS_UPDATE_BUTTON_VISIBILITY" as FluxEvents, ({ isVisible }) => setVisibility(isVisible));
        };
    });

    return (visibility || PluginProps.clientMod === "BetterDiscord") ? <ListItem
        hasPill
        tooltip={
            <>
                <span>Discord Colorways</span>
                <span style={{ color: "var(--text-muted)", fontWeight: 500, fontSize: 12 }}>{"Active Colorway: " + (activeColorway.id || "None")}</span>
                {(activeColorway.id === "Auto" && activeColorway.sourceType === "auto") ? <span style={{ color: "var(--text-muted)", fontWeight: 500, fontSize: 12 }}>{"Auto Colorway Preset: " + (autoPreset ? getAutoPresets()[autoPreset].name : "None")}</span> : <></>}
            </>
        }>
        {({ onMouseEnter, onMouseLeave, isActive, onClick }) => {
            return <div
                className="ColorwaySelectorBtn"
                onMouseEnter={async e => {
                    onMouseEnter(e);
                    setActiveColorway(contexts.activeColorwayObject);
                    setAutoPreset(contexts.activeAutoPreset);
                }}
                onMouseLeave={e => {
                    onMouseLeave(e);
                }}
                onClick={e => {
                    onClick(e);
                    isActive(false);
                    openModal((props: any) => <MainModal modalProps={props} />);
                }}
            >
                <PalleteIcon />
            </div>;
        }}
    </ListItem> : <></>;
}
