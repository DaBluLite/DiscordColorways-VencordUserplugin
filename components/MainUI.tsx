/*
 * Vencord, a Discord client mod
 * Copyright (c) 2023 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { FocusLock, useEffect, useRef, useState } from "../";
import { Dispatcher, Hooks, LayerManager } from "../api";
import { openModal } from "../api/Modals";
import { Clipboard } from "../api/Utils";
import { Tabs } from "../types";
import { CloseIcon, CodeIcon, CogIcon, CopyIcon, LinkIcon, PalleteIcon, SelectorsIcon, WidgetsPlusIcon, WirelessErrorIcon, WirelessIcon } from "./Icons";
import GlobalSearch from "./Modals/GlobalSearch";
import Colorways from "./Pages/Selector/Colorways";
import Presets from "./Pages/Selector/Presets";
import Themes from "./Pages/Selector/Themes";
import History from "./Pages/Settings/History";
import Main from "./Pages/Settings/Main";
import Discover from "./Pages/Sources/Discover";
import Installed from "./Pages/Sources/Installed";
import RightClickContextMenu from "./RightClickContextMenu";
import SidebarTab from "./SidebarTab";
import Tooltip from "./Tooltip";

export default function ({
    tab = Tabs.Colorways
}: { tab?: Tabs; }): React.JSX.Element | any {
    const [activeTab, setActiveTab] = useState<Tabs>(tab);
    const cont = useRef(null);
    const contexts = Hooks.useContexts();
    const expanded = true;

    const ConnectionIcon = contexts.isConnected ? WirelessIcon : WirelessErrorIcon;

    useEffect(() => {
        function openGlobalSearch(e: KeyboardEvent) {
            if (e.ctrlKey && e.code === "KeyK") {
                e.preventDefault();
                openModal(props => <GlobalSearch modalProps={props} />);
            }
        }

        window.addEventListener("keydown", openGlobalSearch);

        return () => {
            window.removeEventListener("keydown", openGlobalSearch);
        };
    }, []);

    return (
        <FocusLock containerRef={cont}>
            <div ref={cont} className="dc-app-root">
                <div className="dc-app-sidebar">
                    <span className="dc-contextmenu-label">Colorways & Themes</span>
                    <SidebarTab
                        activeTab={activeTab}
                        onSelect={id => {
                            setActiveTab(id);
                        }}
                        Icon={SelectorsIcon}
                        id={Tabs.Colorways}
                        title="Colorways"
                        expanded={expanded}
                    />
                    <SidebarTab
                        activeTab={activeTab}
                        onSelect={id => {
                            setActiveTab(id);
                        }}
                        Icon={CodeIcon}
                        id={Tabs.Presets}
                        title="Presets"
                        expanded={expanded}
                    />
                    <SidebarTab
                        activeTab={activeTab}
                        onSelect={id => {
                            setActiveTab(id);
                        }}
                        Icon={PalleteIcon}
                        id={Tabs.Themes}
                        title="Themes"
                        expanded={expanded}
                    />
                    <span className="dc-contextmenu-label">Settings</span>
                    <SidebarTab
                        activeTab={activeTab}
                        onSelect={id => {
                            setActiveTab(id);
                        }}
                        Icon={CogIcon}
                        id={Tabs.Settings}
                        title="General"
                        expanded={expanded}
                    />
                    <SidebarTab
                        activeTab={activeTab}
                        onSelect={id => {
                            setActiveTab(id);
                        }}
                        Icon={CopyIcon}
                        id={Tabs.History}
                        title="History"
                        expanded={expanded}
                    />
                    <span className="dc-contextmenu-label">Sources</span>
                    <SidebarTab
                        activeTab={activeTab}
                        onSelect={id => {
                            setActiveTab(id);
                        }}
                        Icon={LinkIcon}
                        id={Tabs.Sources}
                        title="Installed"
                        expanded={expanded}
                    />
                    <SidebarTab
                        activeTab={activeTab}
                        onSelect={id => {
                            setActiveTab(id);
                        }}
                        Icon={WidgetsPlusIcon}
                        id={Tabs.Discover}
                        title="Discover"
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
                <div className="dc-mainui-container">
                    {activeTab === Tabs.Colorways && <Colorways />}
                    {activeTab === Tabs.Presets && <Presets />}
                    {activeTab === Tabs.Themes && <Themes />}
                    {activeTab === Tabs.Settings && <Main />}
                    {activeTab === Tabs.History && <History />}
                    {activeTab === Tabs.Sources && <Installed />}
                    {activeTab === Tabs.Discover && <Discover />}
                </div>
            </div>
        </FocusLock>
    );
}
