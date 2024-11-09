/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { IconProps } from "./Icons";

export default function ({ id, title, Icon, bottom, onSelect, activeTab, expanded = false, onContextMenu = () => { }, onMouseEnter = () => { }, onMouseLeave = () => { } }: { id: "selector" | "settings" | "sources" | "ws_connection" | "expand_sidebar", title?: string, Icon: (props: React.PropsWithChildren<IconProps>) => JSX.Element, bottom?: boolean, onSelect: (id: "selector" | "settings" | "sources" | "ws_connection" | "expand_sidebar", e: React.MouseEvent<HTMLDivElement>) => void, activeTab: string, expanded?: boolean, onContextMenu?: React.MouseEventHandler<HTMLDivElement>, onMouseEnter?: React.MouseEventHandler<HTMLDivElement>, onMouseLeave?: React.MouseEventHandler<HTMLDivElement>; }) {
    return <div
        className={`colorwaysPillButton ${(expanded ? "colorwaysPillButton-md" : "colorwaysPillButton-xl colorwaysPillButton-icon")}${(id === activeTab ? " colorwaysPillButton-secondary" : "")}`}
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
