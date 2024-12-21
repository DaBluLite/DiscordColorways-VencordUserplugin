/*
 * Vencord, a Discord client mod
 * Copyright (c) 2023 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { FocusLock, ThemeStore, useRef, useState } from "../";
import { Dispatcher, Hooks, LayerManager } from "../api";
import { Clipboard } from "../api/Utils";
import { themes } from "../constants";
import { Tabs } from "../types";
import { CaretIcon, CloseIcon, CogIcon, SelectorsIcon, WidgetsPlusIcon, WirelessErrorIcon, WirelessIcon } from "./Icons";
import RightClickContextMenu from "./RightClickContextMenu";
import Selector from "./Selector";
import SettingsPage from "./SettingsTabs/SettingsPage";
import SourceManager from "./SettingsTabs/SourceManager";
import SidebarTab from "./SidebarTab";
import Tooltip from "./Tooltip";

export default function (): JSX.Element | any {
    const [activeTab, setActiveTab] = useState<Tabs>(Tabs.Selector);
    const cont = useRef(null);
    const contexts = Hooks.useContexts();
    const [expanded, setExpanded] = useState(false);

    const ConnectionIcon = contexts.isConnected ? WirelessIcon : WirelessErrorIcon;

    return (
        <FocusLock containerRef={cont}>
            <div ref={cont} className={`dc-app-root theme-${ThemeStore.theme} ${(themes.find(t => t.id === contexts.colorwaysPluginTheme)?.classes || []).join(" ")}`} data-theme={contexts.colorwaysPluginTheme}>
                <div className="dc-app-sidebar">
                    <div
                        style={{
                            height: "24px",
                            minHeight: "unset",
                            width: "50px"
                        }}
                        className={`dc-button dc-button-icon ${(expanded ? "dc-button-md" : "dc-button-xl")}`}
                        onClick={() => setExpanded(!expanded)}
                    >
                        <CaretIcon width={expanded ? 18 : 24} height={expanded ? 18 : 24} />
                    </div>
                    <SidebarTab
                        activeTab={activeTab}
                        onSelect={id => {
                            setActiveTab(id);
                            setExpanded(false);
                        }}
                        Icon={SelectorsIcon}
                        id={Tabs.Selector}
                        title="Change Colorway/Preset"
                        expanded={expanded}
                    />
                    <SidebarTab
                        activeTab={activeTab}
                        onSelect={id => {
                            setActiveTab(id);
                            setExpanded(false);
                        }}
                        Icon={CogIcon}
                        id={Tabs.Settings}
                        title="Settings"
                        expanded={expanded}
                    />
                    <SidebarTab
                        activeTab={activeTab}
                        onSelect={id => {
                            setActiveTab(id);
                            setExpanded(false);
                        }}
                        Icon={WidgetsPlusIcon}
                        id={Tabs.Sources}
                        title="Sources"
                        expanded={expanded}
                    />
                    <div className="dc-divider" style={{ margin: "0" }} />
                    <div style={{
                        display: "flex",
                        flexDirection: expanded ? "row" : "column",
                        gap: "8px"
                    }}>
                        <Tooltip
                            position="right"
                            text={<>
                                <span>{contexts.isConnected ? "Connected to manager" : "No manager connected"}</span>
                                {contexts.isConnected ? <>
                                    <span style={{ color: "var(--text-muted)", fontWeight: 500, fontSize: 12 }}>Bound Key: {JSON.stringify(contexts.boundKey)}</span>
                                    <span style={{ color: "var(--text-muted)", fontWeight: 500, fontSize: 12 }}>Right click for options</span>
                                </> : null}
                            </>}
                        >
                            {({ onMouseEnter, onMouseLeave, onClick }) => <RightClickContextMenu
                                menu={<>
                                    {contexts.isConnected ? <>
                                        <button onClick={() => Clipboard.copy(JSON.stringify(contexts.boundKey))} className="dc-contextmenu-item">
                                            Copy Bound Key
                                        </button>
                                        <button onClick={() => Dispatcher.dispatch("COLORWAYS_RESTART_WS", {})} className="dc-contextmenu-item">
                                            Reset Connection
                                        </button>
                                        {!contexts.hasManagerRole ? <button onClick={() => Dispatcher.dispatch("COLORWAYS_REQUEST_MANAGER", {})} className="dc-contextmenu-item">
                                            Request manager role
                                        </button> : null}
                                    </> : null}
                                </>}
                            >
                                {({ onContextMenu }) => <div className={`dc-button dc-button-icon ${(expanded ? "dc-button-md" : "dc-button-xl")}`} onContextMenu={e => {
                                    if (contexts.isConnected) {
                                        onClick(e);
                                        onContextMenu(e);
                                    }
                                }}
                                    onMouseEnter={onMouseEnter}
                                    onMouseLeave={onMouseLeave}
                                >
                                    <ConnectionIcon width={expanded ? 18 : 24} height={expanded ? 18 : 24} style={contexts.isConnected ? { color: "var(--status-positive)" } : {}} />
                                </div>}
                            </RightClickContextMenu>}
                        </Tooltip>
                        <div className={`dc-button dc-button-icon ${(expanded ? "dc-button-md" : "dc-button-xl")}`} onClick={() => LayerManager.popLayer()}
                        >
                            <CloseIcon width={expanded ? 18 : 24} height={expanded ? 18 : 24} />
                        </div>
                    </div>
                </div>
                <div className="dc-modal-content" style={{ width: "100%" }}>
                    {activeTab === Tabs.Selector && <Selector />}
                    {activeTab === Tabs.Sources && <SourceManager />}
                    {activeTab === Tabs.Settings && <SettingsPage />}
                </div>
            </div>
        </FocusLock>
    );
}
