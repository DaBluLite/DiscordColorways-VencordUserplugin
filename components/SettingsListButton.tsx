/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Hooks, LayerManager } from "../api";
import LauncherContextMenu from "./LauncherContextMenu";
import MainUI from "./MainUI";
import RightClickContextMenu from "./RightClickContextMenu";

export default function () {
    const [activeColorwayObject] = Hooks.useContextualState("activeColorwayObject");
    return <RightClickContextMenu menu={<LauncherContextMenu />}>
        {({ onContextMenu }) => <div className="dc-discordsettings-itm" onClick={() => LayerManager.pushLayer(() => <MainUI />)} onContextMenu={onContextMenu}>
            <div className="dc-label-wrapper">
                <span className="dc-label dc-label-Settings" style={{ margin: 0 }}>Discord Colorways</span>
                <span className="dc-label dc-subnote dc-note" style={{ margin: 0 }}>Active colorway: {activeColorwayObject.id ? activeColorwayObject.id : "None"}</span>
            </div>
        </div>}
    </RightClickContextMenu>;
}
