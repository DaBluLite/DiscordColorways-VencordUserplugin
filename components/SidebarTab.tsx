/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Tabs } from "../types";
import { IconProps } from "./Icons";

export default function ({ id, title, Icon, bottom, onSelect, activeTab, expanded = false, onContextMenu = () => { }, onMouseEnter = () => { }, onMouseLeave = () => { } }: { id: Tabs, title?: string, Icon: (props: React.PropsWithChildren<IconProps>) => JSX.Element, bottom?: boolean, onSelect: (id: Tabs, e: React.MouseEvent<HTMLDivElement>) => void, activeTab: Tabs, expanded?: boolean, onContextMenu?: React.MouseEventHandler<HTMLDivElement>, onMouseEnter?: React.MouseEventHandler<HTMLDivElement>, onMouseLeave?: React.MouseEventHandler<HTMLDivElement>; }) {
    return <div
        className={`dc-button ${(expanded ? "dc-button-md" : "dc-button-xl dc-button-icon")}${(id === activeTab ? " dc-button-secondary" : "")}`}
        onClick={e => {
            onSelect(id, e);
        }}
        style={{
            ...(bottom ? { marginTop: "auto" } : {}),
            ...(expanded ? { justifyContent: "start" } : {}),
            borderColor: "transparent"
        }}
        onContextMenu={onContextMenu}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
    >
        <Icon width={expanded ? 18 : 24} height={expanded ? 18 : 24} />{(expanded && title) ? <span style={{ marginLeft: "8px" }}>{title}</span> : null}
    </div>;
}
