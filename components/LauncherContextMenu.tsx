/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { LayerManager } from "../api";
import { Tabs } from "../types";
import ContextMenuItem from "./ContextMenuItem";
import MainUI from "./MainUI";
import openChangelogModal from "./Modals/openChangelogModal";

export default function () {
    return <>
        <div className="dc-contextmenu-label">Change...</div>
        <ContextMenuItem
            onClick={e => {
                LayerManager.pushLayer(() => <MainUI tab={Tabs.Selector} subTab="Colorways" />);
            }}>
            Colorways
        </ContextMenuItem>
        <ContextMenuItem
            onClick={e => {
                LayerManager.pushLayer(() => <MainUI tab={Tabs.Selector} subTab="Presets" />);
            }}>
            Presets
        </ContextMenuItem>
        <ContextMenuItem
            onClick={e => {
                LayerManager.pushLayer(() => <MainUI tab={Tabs.Selector} subTab="Themes" />);
            }}>
            Themes
        </ContextMenuItem>
        <div className="dc-contextmenu-divider" />
        <div className="dc-contextmenu-label">Settings</div>
        <ContextMenuItem
            onClick={e => {
                LayerManager.pushLayer(() => <MainUI tab={Tabs.Settings} subTab="Settings" />);
            }}>
            Settings
        </ContextMenuItem>
        <ContextMenuItem
            onClick={e => {
                LayerManager.pushLayer(() => <MainUI tab={Tabs.Settings} subTab="History" />);
            }}>
            Usage History
        </ContextMenuItem>
        <div className="dc-contextmenu-divider" />
        <div className="dc-contextmenu-label">Sources</div>
        <ContextMenuItem
            onClick={e => {
                LayerManager.pushLayer(() => <MainUI tab={Tabs.Sources} subTab="Installed" />);
            }}>
            Installed
        </ContextMenuItem>
        <ContextMenuItem
            onClick={e => {
                LayerManager.pushLayer(() => <MainUI tab={Tabs.Sources} subTab="Discover" />);
            }}>
            Discover
        </ContextMenuItem>
        <div className="dc-contextmenu-divider" />
        <ContextMenuItem
            onClick={e => {
                openChangelogModal();
            }}>
            What's New...
        </ContextMenuItem>
    </>;
}
