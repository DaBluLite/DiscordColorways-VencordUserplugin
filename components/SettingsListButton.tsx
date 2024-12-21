/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Hooks, LayerManager } from "../api";
import MainUI from "./MainUI";

export default function () {
    const [activeColorwayObject] = Hooks.useContextualState("activeColorwayObject");
    return <div className="dc-discordsettings-itm" onClick={() => LayerManager.pushLayer(MainUI)}>
        <div className="dc-label-wrapper">
            <span className="dc-label dc-label-Settings" style={{ margin: 0 }}>Discord Colorways</span>
            <span className="dc-label dc-subnote dc-note" style={{ margin: 0 }}>Active colorway: {activeColorwayObject.id ? activeColorwayObject.id : "None"}</span>
        </div>
    </div>;
}
