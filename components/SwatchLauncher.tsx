/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { LayerManager } from "../api";
import { PalleteIcon } from "./Icons";
import MainUI from "./MainUI";
import Tooltip from "./Tooltip";

export default function () {
    return <Tooltip
        text={<span className="dc-tooltip-normal-text">Explore Discord Colorways</span>}
        position="top"
    >
        {({ onClick, onMouseEnter, onMouseLeave }) => <div className="dc-color-swatch-selectable">
            <div
                className="dc-color-swatch"
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
                onClick={e => {
                    onClick(e);
                    LayerManager.pushLayer(() => <MainUI />);
                }}
                style={{ justifyContent: "center", alignItems: "center", boxShadow: "inset 0 0 0 1px var(--interactive-normal)" }}
            >
                <PalleteIcon style={{ color: "var(--header-primary)" }} />
            </div>
        </div>}
    </Tooltip>;
}
