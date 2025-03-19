/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { openModal } from "../api/Modals";
import GlobalSearch from "./Modals/GlobalSearch";

export default function ({ placeholder = "", children = <></>, style = {}, page = 0 }: { placeholder?: string, children?: React.ReactNode, style?: React.CSSProperties, page?: number; }) {
    return <div className="dc-selector-header dc-textbox" style={style}>
        <button
            className="dc-textbox dc-gs-launcher"
            onClick={() => openModal(props => <GlobalSearch modalProps={props} page={page} />)}
        >
            {placeholder}
        </button>
        {children}
    </div>;
}
