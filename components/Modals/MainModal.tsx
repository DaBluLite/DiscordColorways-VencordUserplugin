/*
 * Vencord, a Discord client mod
 * Copyright (c) 2023 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { FluxDispatcher, FluxEvents, FocusLock, useEffect, useRef, useState } from "../../";
import { contexts } from "../../contexts";
import { ModalProps } from "../../types";
import { Clipboard } from "../../utils";
import { boundKey as bk, hasManagerRole, requestManagerRole, restartWS, updateRemoteSources, wsOpen } from "../../wsClient";
import { CaretIcon, CogIcon, IconProps, PalleteIcon, WirelessIcon } from "../Icons";
import RightClickContextMenu from "../RightClickContextMenu";
import Selector from "../Selector";
import SettingsPage from "../SettingsTabs/SettingsPage";
import SourceManager from "../SettingsTabs/SourceManager";
import SidebarTab from "../SidebarTab";
import Tooltip from "../Tooltip";

type tabs = "selector" | "settings" | "sources" | "ws_connection" | "expand_sidebar";

function MainModalSidebar({ onTabChange }: { onTabChange: (tab: tabs) => void; }) {
    const [activeTab, setActiveTab] = useState<tabs>("selector");
    const [wsConnected, setWsConnected] = useState(wsOpen);
    const [boundKey, setBoundKey] = useState<{ [managerKey: string]: string; }>(bk as { [managerKey: string]: string; });
    const [expanded, setExpanded] = useState(false);
    const [isManager, setManager] = useState<boolean>(hasManagerRole);

    useEffect(() => {
        FluxDispatcher.subscribe("COLORWAYS_UPDATE_WS_CONNECTED" as FluxEvents, ({ isConnected }) => setWsConnected(isConnected));
        FluxDispatcher.subscribe("COLORWAYS_UPDATE_BOUND_KEY" as FluxEvents, ({ boundKey }) => setBoundKey(boundKey));
        FluxDispatcher.subscribe("COLORWAYS_UPDATE_WS_MANAGER_ROLE" as FluxEvents, ({ isManager }) => setManager(isManager));

        return () => {
            FluxDispatcher.unsubscribe("COLORWAYS_UPDATE_BOUND_KEY" as FluxEvents, ({ boundKey }) => setBoundKey(boundKey));
            FluxDispatcher.unsubscribe("COLORWAYS_UPDATE_WS_CONNECTED" as FluxEvents, ({ isConnected }) => setWsConnected(isConnected));
            FluxDispatcher.unsubscribe("COLORWAYS_UPDATE_WS_MANAGER_ROLE" as FluxEvents, ({ isManager }) => setManager(isManager));
        };
    }, []);

    return <>
        <div className="colorwaySelectorSidebar">
            <SidebarTab
                activeTab={activeTab}
                onSelect={() => setExpanded(!expanded)}
                Icon={(props: React.PropsWithChildren<IconProps>) => <CaretIcon {...props} style={expanded ? { transform: "rotate(90deg)" } : {}} />}
                id="expand_sidebar"
                expanded={expanded}
            />
            <SidebarTab
                activeTab={activeTab}
                onSelect={id => {
                    setActiveTab(id);
                    onTabChange(id);
                    setExpanded(false);
                }}
                Icon={PalleteIcon}
                id="selector"
                title="Change Colorway"
                expanded={expanded}
            />
            <SidebarTab
                activeTab={activeTab}
                onSelect={id => {
                    setActiveTab(id);
                    onTabChange(id);
                    setExpanded(false);
                }}
                Icon={CogIcon}
                id="settings"
                title="Settings"
                expanded={expanded}
            />
            <SidebarTab
                activeTab={activeTab}
                onSelect={id => {
                    setActiveTab(id);
                    onTabChange(id);
                    setExpanded(false);
                }}
                Icon={WirelessIcon}
                id="sources"
                title="Sources"
                expanded={expanded}
            />
            <Tooltip
                position="right"
                text={<>
                    <span>{wsConnected ? "Connected to manager" : "No manager connected"}</span>
                    {wsConnected ? <>
                        <span style={{ color: "var(--text-muted)", fontWeight: 500, fontSize: 12 }}>Bound Key: {JSON.stringify(boundKey)}</span>
                        <span style={{ color: "var(--text-muted)", fontWeight: 500, fontSize: 12 }}>Right click for options</span>
                    </> : null}
                </>}
            >
                {({ onMouseEnter, onMouseLeave, onClick }) => <RightClickContextMenu
                    menu={<>
                        {wsConnected ? <>
                            <button onClick={() => Clipboard.copy(JSON.stringify(boundKey))} className="colorwaysContextMenuItm">
                                Copy Bound Key
                            </button>
                            <button onClick={restartWS} className="colorwaysContextMenuItm">
                                Reset Connection
                            </button>
                            <button onClick={updateRemoteSources} className="colorwaysContextMenuItm">
                                Update Remote Sources
                            </button>
                            {!isManager ? <button onClick={requestManagerRole} className="colorwaysContextMenuItm">
                                Request manager role
                            </button> : null}
                        </> : null}
                    </>}
                >
                    {({ onContextMenu }) => <SidebarTab
                        activeTab={activeTab}
                        onSelect={(_, e) => {
                            if (wsConnected) {
                                onClick(e);
                                onContextMenu(e);
                            }
                        }}
                        bottom
                        onContextMenu={e => {
                            if (wsConnected) {
                                onClick(e);
                                onContextMenu(e);
                            }
                        }}
                        onMouseEnter={onMouseEnter}
                        onMouseLeave={onMouseLeave}
                        Icon={WirelessIcon}
                        id="ws_connection"
                        title="Manager Connection"
                        expanded={expanded}
                    />}
                </RightClickContextMenu>}
            </Tooltip>
        </div>
    </>;
}

export default function ({
    modalProps
}: {
    modalProps: ModalProps;
}): JSX.Element | any {
    const [activeTab, setActiveTab] = useState<tabs>("selector");
    const [theme, setTheme] = useState(contexts.colorwaysPluginTheme);
    const [forceVR, setForceVR] = useState(contexts.colorwaysForceVR);
    const cont = useRef(null);

    useEffect(() => {
        FluxDispatcher.subscribe("COLORWAYS_UPDATE_THEME" as FluxEvents, ({ theme }) => setTheme(theme));
        FluxDispatcher.subscribe("COLORWAYS_UPDATE_FORCE_VR" as FluxEvents, ({ enabled }) => setForceVR(enabled));

        return () => {
            FluxDispatcher.unsubscribe("COLORWAYS_UPDATE_THEME" as FluxEvents, ({ theme }) => setTheme(theme));
            FluxDispatcher.unsubscribe("COLORWAYS_UPDATE_FORCE_VR" as FluxEvents, ({ enabled }) => setForceVR(enabled));
        };
    }, []);

    return (
        <FocusLock containerRef={cont}>
            <div ref={cont} className={`colorwaySelectorModal${forceVR ? " visual-refresh" : ""} ${modalProps.transitionState === 2 ? "closing" : ""} ${modalProps.transitionState === 4 ? "hidden" : ""}`} data-theme={theme}>
                <MainModalSidebar onTabChange={setActiveTab} />
                <div className="colorwayModalContent">
                    {activeTab === "selector" && <div className="colorwayInnerTab" style={{ height: "100%" }}><Selector hasTheme /></div>}
                    {activeTab === "sources" && <SourceManager hasTheme />}
                    {activeTab === "settings" && <SettingsPage hasTheme />}
                </div>
            </div>
        </FocusLock>
    );
}
