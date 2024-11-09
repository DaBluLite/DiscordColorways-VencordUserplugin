/*
 * Vencord, a Discord client mod
 * Copyright (c) 2023 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { DataStore, FluxDispatcher, FluxEvents, openModal, PluginProps, useState } from "../../";
import { ColorwayCSS } from "../../colorwaysAPI";
import { defaultColorwaySource, nullColorwayObj, themes } from "../../constants";
import { contexts, setContext } from "../../contexts";
import { generateCss, getAutoPresets, getPreset, gradientBase, gradientPresetIds } from "../../css";
import { ColorwayObject, ModalProps } from "../../types";
import { chooseFile, saveFile } from "../../utils";
import { connect, hasManagerRole, isWSOpen, sendColorway, wsOpen } from "../../wsClient";
import FeaturePresenter from "../FeaturePresenter";
import { CogIcon, DownloadIcon, OpenExternalIcon, PalleteIcon, WirelessIcon } from "../Icons";
import Modal from "../Modal";
import ReloadRequiredModal from "../Modals/ReloadRequiredModal";
import Radio from "../Radio";
import Setting from "../Setting";
import StaticOptionsMenu from "../StaticOptionsMenu";
import Switch from "../Switch";
import TabBar from "../TabBar";

export default function ({
    hasTheme = false
}: {
    hasTheme?: boolean;
}) {
    const colorways = contexts.colorwayData.flatMap(src => src.colorways);
    const customColorways = contexts.customColorways.flatMap(src => src.colorways);
    const [colorsButtonVisibility, setColorsButtonVisibility] = useState<boolean>(contexts.showColorwaysButton);
    const [theme, setTheme] = useState(contexts.colorwaysPluginTheme);
    const [shouldAutoconnect, setShouldAutoconnect] = useState(contexts.colorwaysManagerDoAutoconnect);
    const [autoconnectDelay, setAutoconnectDelay] = useState(contexts.colorwaysManagerAutoconnectPeriod / 1000);
    const [forceVR, setForceVR] = useState(contexts.colorwaysForceVR);
    const [active, setActive] = useState("Settings");
    const [autoColorwayId, setAutoColorwayId] = useState(contexts.activeAutoPreset);
    const [preset, setPreset] = useState(contexts.colorwaysPreset);

    function onPresetChange(value: string) {
        setPreset(value);
        setContext("colorwaysPreset", value);

        DataStore.get("activeColorwayObject").then((active: ColorwayObject) => {
            if (active.id) {
                if (wsOpen) {
                    if (hasManagerRole) {
                        sendColorway(active);
                    }
                } else {
                    if (value === "default") {
                        ColorwayCSS.set(generateCss(
                            active.colors,
                            true,
                            true,
                            undefined,
                            active.id
                        ));
                    } else {
                        if (gradientPresetIds.includes(value)) {
                            const css = Object.keys(active).includes("linearGradient")
                                ? gradientBase(active.colors, true) + `:root:root {--custom-theme-background: linear-gradient(${active.linearGradient})}`
                                : (getPreset(active.colors)[value].preset as { full: string; }).full;
                            ColorwayCSS.set(css);
                        } else {
                            ColorwayCSS.set(getPreset(active.colors)[value].preset as string);
                        }
                    }
                }
            }
        });
    }

    return <div className="colorwaysModalTab" data-theme={hasTheme ? theme : "discord"}>
        <TabBar
            active={active}
            container={({ children }) => <div className="colorwaysPageHeader">{children}</div>}
            items={[
                {
                    name: "Settings",
                    component: () =>
                        <div className="colorwayInnerTab" style={{ gap: 0 }}>
                            <span className="colorwaysModalFieldHeader">Quick Switch</span>
                            <Setting divider>
                                <Switch
                                    value={colorsButtonVisibility}
                                    label="Enable Quick Switch"
                                    id="showColorwaysButton"
                                    onChange={(v: boolean) => {
                                        setColorsButtonVisibility(v);
                                        setContext("showColorwaysButton", v);
                                        FluxDispatcher.dispatch({
                                            type: "COLORWAYS_UPDATE_BUTTON_VISIBILITY" as FluxEvents,
                                            isVisible: v
                                        });
                                    }} />
                                <span className="colorwaysNote">Shows a button on the top of the servers list that opens a colorway selector modal.</span>
                            </Setting>
                            <span className="colorwaysModalFieldHeader">Appearance</span>
                            <Setting>
                                <div style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    width: "100%",
                                    alignItems: "center",
                                    cursor: "pointer"
                                }}>
                                    <label className="colorwaySwitch-label">Plugin Theme</label>
                                    <label className="colorwaySwitch-label" style={{ width: "fit-content", flex: "0 0 auto", marginRight: "8px" }}>{themes.find(t => t.id === theme)?.name}</label>
                                    <StaticOptionsMenu
                                        xPos="right"
                                        menu={<>{themes.map(({ name, id }) => <button onClick={() => {
                                            setTheme(id);
                                            setContext("colorwaysPluginTheme", id);
                                            FluxDispatcher.dispatch({ type: "COLORWAYS_UPDATE_THEME" as FluxEvents, theme: id });
                                        }} className="colorwaysContextMenuItm">
                                            {name}
                                            <Radio checked={theme === id} style={{
                                                marginLeft: "8px"
                                            }} />
                                        </button>)}</>}>
                                        {({ onClick }) => <button
                                            onClick={onClick}
                                            className="colorwaysPillButton colorwaysPillButton-md colorwaysPillButton-primary colorwaysPillButton-icon"
                                        >
                                            <CogIcon width={16} height={16} />
                                        </button>}
                                    </StaticOptionsMenu>
                                </div>
                            </Setting>
                            <Setting divider>
                                <Switch
                                    value={forceVR}
                                    label="Force Visual Refresh Variant on Discord Theme"
                                    id="forceVRVar"
                                    onChange={(v: boolean) => {
                                        setForceVR(v);
                                        setContext("colorwaysForceVR", v);
                                        FluxDispatcher.dispatch({
                                            type: "COLORWAYS_UPDATE_FORCE_VR" as FluxEvents,
                                            enabled: v
                                        });
                                    }} />
                                <span className="colorwaysNote">Note: Only applies to Modals</span>
                            </Setting>
                            <span className="colorwaysModalFieldHeader">Colorways</span>
                            <Setting>
                                <div style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    width: "100%",
                                    alignItems: "center",
                                    cursor: "pointer"
                                }}>
                                    <label className="colorwaySwitch-label">Colorway Preset</label>
                                    <label className="colorwaySwitch-label" style={{ width: "fit-content", flex: "0 0 auto", marginRight: "8px" }}>{Object.values(getPreset({})).find(pr => pr.id === preset)?.name}</label>
                                    <StaticOptionsMenu
                                        xPos="right"
                                        menu={<>
                                            {Object.values(getPreset({})).map(({ name, id }) => {
                                                return <button onClick={() => onPresetChange(id)} className="colorwaysContextMenuItm">
                                                    {name}
                                                    <Radio checked={preset === id} style={{
                                                        marginLeft: "8px"
                                                    }} />
                                                </button>;
                                            })}
                                        </>}>
                                        {({ onClick }) => <button
                                            onClick={onClick}
                                            className="colorwaysPillButton colorwaysPillButton-md colorwaysPillButton-primary colorwaysPillButton-icon"
                                        >
                                            <CogIcon width={16} height={16} />
                                        </button>}
                                    </StaticOptionsMenu>
                                </div>
                                <span className="colorwaysNote">The template which all colorways (excluding the Auto Colorway) use to generate a theme.</span>
                            </Setting>
                            <div className="dc-info-card" style={{ marginBottom: "20px" }}>
                                <strong>About the Auto Colorway</strong>
                                <span>The auto colorway allows you to use your system's accent color in combination with a selection of presets that will fully utilize it.</span>
                            </div>
                            <Setting divider>
                                <div style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    width: "100%",
                                    alignItems: "center",
                                    cursor: "pointer"
                                }}>
                                    <label className="colorwaySwitch-label">Auto Colorway Preset</label>
                                    <label className="colorwaySwitch-label" style={{ width: "fit-content", flex: "0 0 auto", marginRight: "8px" }}>{Object.values(getAutoPresets()).find(pr => pr.id === autoColorwayId)?.name}</label>
                                    <StaticOptionsMenu
                                        xPos="right"
                                        menu={<>
                                            {Object.values(getAutoPresets()).map(({ name, id }) => {
                                                return <button onClick={() => setAutoColorwayId(setContext("activeAutoPreset", id) as string)} className="colorwaysContextMenuItm">
                                                    {name}
                                                    <Radio checked={autoColorwayId === id} style={{
                                                        marginLeft: "8px"
                                                    }} />
                                                </button>;
                                            })}
                                        </>}>
                                        {({ onClick }) => <button
                                            onClick={onClick}
                                            className="colorwaysPillButton colorwaysPillButton-md colorwaysPillButton-primary colorwaysPillButton-icon"
                                        >
                                            <CogIcon width={16} height={16} />
                                        </button>}
                                    </StaticOptionsMenu>
                                </div>
                                <span className="colorwaysNote">The template which the Auto Colorway (visible on certain OSes) uses to generate a theme. These are also available as normal presets.</span>
                            </Setting>
                            <span className="colorwaysModalFieldHeader">Manager</span>
                            <Setting>
                                <Switch
                                    value={shouldAutoconnect}
                                    label="Automatically retry to connect to Manager"
                                    id="autoReconnect"
                                    onChange={(v: boolean) => {
                                        setShouldAutoconnect(v);
                                        setContext("colorwaysManagerDoAutoconnect", v);
                                        if (!isWSOpen() && v) connect();
                                    }} />
                            </Setting>
                            <Setting divider>
                                <div style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    width: "100%",
                                    alignItems: "center",
                                    cursor: "pointer"
                                }}>
                                    <label className="colorwaySwitch-label">Reconnection Delay (in seconds)</label>
                                    <input
                                        type="number"
                                        className="colorwayTextBox"
                                        style={{
                                            width: "100px",
                                            textAlign: "end"
                                        }}
                                        value={autoconnectDelay}
                                        autoFocus
                                        onInput={({ currentTarget: { value } }) => {
                                            setAutoconnectDelay(Number(value || "0"));
                                            setContext("colorwaysManagerAutoconnectPeriod", Number(value || "0") * 1000);
                                        }}
                                    />
                                </div>
                            </Setting>
                            <span className="colorwaysModalFieldHeader">Configuration</span>
                            <Setting>
                                <div style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    width: "100%",
                                    alignItems: "center",
                                    cursor: "pointer"
                                }}>
                                    <label className="colorwaySwitch-label">Manage Settings...</label>
                                    <button
                                        className="colorwaysPillButton colorwaysPillButton-primary"
                                        onClick={async () => {
                                            const keys = [
                                                "customColorways",
                                                "colorwaySourceFiles",
                                                "showColorwaysButton",
                                                "activeColorwayObject",
                                                "colorwaysPluginTheme",
                                                "colorwaysBoundManagers",
                                                "colorwaysManagerAutoconnectPeriod",
                                                "colorwaysManagerDoAutoconnect",
                                                "colorwaysPreset",
                                                "colorwaysForceVR",
                                                "activeAutoPreset",
                                                "colorwayUsageMetrics"
                                            ];

                                            const data = await DataStore.getMany(keys);

                                            const settings = {};

                                            keys.forEach((key, i) => {
                                                settings[key] = data[i];
                                            });

                                            saveFile(new File([JSON.stringify(settings)], "DiscordColorways.settings.json", { type: "application/json" }));
                                        }}
                                    >
                                        Export
                                    </button>
                                    <button
                                        className="colorwaysPillButton colorwaysPillButton-danger"
                                        style={{
                                            marginLeft: "8px"
                                        }}
                                        onClick={() => {
                                            openModal(props => <Modal
                                                modalProps={props}
                                                title="Import Settings for DiscordColorways"
                                                onFinish={async ({ closeModal }) => {
                                                    const file = await chooseFile("application/json");
                                                    if (!file) return;

                                                    const reader = new FileReader();
                                                    reader.onload = async () => {
                                                        const settings = JSON.parse(reader.result as string) as { [key: string]: any; };
                                                        Object.keys(settings).forEach(async key => {
                                                            await DataStore.set(key, settings[key]);
                                                        });

                                                        closeModal();

                                                        openModal(props => <ReloadRequiredModal modalProps={props as unknown as ModalProps} />);
                                                    };
                                                }}
                                                confirmMsg="Import File..."
                                                type="danger"
                                            >
                                                Are you sure you want to import a settings file? Current settings will be overwritten!
                                            </Modal>);
                                        }}
                                    >
                                        Import
                                    </button>
                                </div>
                            </Setting>
                            <Setting divider>
                                <div style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    width: "100%",
                                    alignItems: "center",
                                    cursor: "pointer"
                                }}>
                                    <label className="colorwaySwitch-label">Reset plugin to default settings</label>
                                    <button
                                        className="colorwaysPillButton colorwaysPillButton-danger"
                                        onClick={() => {
                                            openModal(props => <Modal
                                                modalProps={props}
                                                title="Reset DiscordColorways"
                                                onFinish={async ({ closeModal }) => {
                                                    const resetValues: any[] = [
                                                        ["customColorways", []],
                                                        ["colorwaySourceFiles", [{
                                                            name: "Project Colorway",
                                                            url: defaultColorwaySource
                                                        }]],
                                                        ["showColorwaysButton", false],
                                                        ["activeColorwayObject", nullColorwayObj],
                                                        ["colorwaysPluginTheme", "discord"],
                                                        ["colorwaysBoundManagers", []],
                                                        ["colorwaysManagerAutoconnectPeriod", 3000],
                                                        ["colorwaysManagerDoAutoconnect", true],
                                                        ["colorwaysPreset", "default"],
                                                        ["colorwaysForceVR", false],
                                                        ["activeAutoPreset", "hueRotation"],
                                                        ["colorwayUsageMetrics", []]
                                                    ];

                                                    DataStore.setMany(resetValues);

                                                    closeModal();

                                                    openModal(props => <ReloadRequiredModal modalProps={props as unknown as ModalProps} />);
                                                }}
                                                confirmMsg="Reset Plugin"
                                                type="danger"
                                            >
                                                Are you sure you want to reset DiscordColorways to its default settings? This will delete:
                                                <FeaturePresenter style={{
                                                    marginTop: "16px"
                                                }}
                                                    items={[
                                                        {
                                                            Icon: WirelessIcon,
                                                            title: "Your Online and Offline Sources"
                                                        },
                                                        {
                                                            Icon: PalleteIcon,
                                                            title: "Your Colorways"
                                                        },
                                                        {
                                                            Icon: CogIcon,
                                                            title: "Your Settings"
                                                        }
                                                    ]}
                                                />
                                            </Modal>);
                                        }}
                                    >
                                        Reset...
                                    </button>
                                </div>
                                <span className="colorwaysNote">Reset the plugin to its default settings. All bound managers, sources, and colorways will be deleted. Please reload Discord after use.</span>
                            </Setting>
                            <span className="colorwaysModalFieldHeader">About</span>
                            <h1 className="colorwaysWordmarkFirstPart">
                                Discord <span className="colorwaysWordmarkSecondPart">Colorways</span>
                            </h1>
                            <span
                                style={{
                                    color: "var(--text-normal)",
                                    fontWeight: 500,
                                    fontSize: "14px",
                                    marginBottom: "12px"
                                }}
                            >by Project Colorway</span>
                            <div className="colorwaysSettingsDivider" style={{ marginBottom: "20px" }} />
                            <Setting divider>
                                <div style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    width: "100%",
                                    alignItems: "center",
                                    cursor: "pointer"
                                }}>
                                    <label className="colorwaySwitch-label">Plugin Version</label>
                                    <span className="colorwaysNote">{PluginProps.pluginVersion} ({PluginProps.clientMod})</span>
                                </div>
                            </Setting>
                            <Setting divider>
                                <div style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    width: "100%",
                                    alignItems: "center",
                                    cursor: "pointer"
                                }}>
                                    <label className="colorwaySwitch-label">UI Version</label>
                                    <span className="colorwaysNote">{PluginProps.UIVersion}</span>
                                </div>
                            </Setting>
                            <Setting divider>
                                <div style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    width: "100%",
                                    alignItems: "center",
                                    cursor: "pointer"
                                }}>
                                    <label className="colorwaySwitch-label">CSS Version</label>
                                    <span className="colorwaysNote">{PluginProps.CSSVersion}</span>
                                </div>
                            </Setting>
                            <Setting divider>
                                <div style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    width: "100%",
                                    alignItems: "center",
                                    cursor: "pointer"
                                }}>
                                    <label className="colorwaySwitch-label">Loaded Colorways</label>
                                    <span className="colorwaysNote">{[...colorways, ...customColorways].length}</span>
                                </div>
                            </Setting>
                            <Setting>
                                <div style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    width: "100%",
                                    alignItems: "center",
                                    cursor: "pointer"
                                }}>
                                    <label className="colorwaySwitch-label">Project Links</label>
                                    <a role="link" target="_blank" className="colorwaysPillButton colorwaysPillButton-primary" style={{ width: "fit-content" }} href="https://github.com/DaBluLite/DiscordColorways">DiscordColorways <OpenExternalIcon width={16} height={16} /></a>
                                    <a role="link" target="_blank" className="colorwaysPillButton colorwaysPillButton-primary" style={{ width: "fit-content", marginLeft: "8px" }} href="https://github.com/DaBluLite/ProjectColorway">Project Colorway <OpenExternalIcon width={16} height={16} /></a>
                                </div>
                            </Setting>
                        </div>
                },
                {
                    name: "History",
                    component: () => <div className="colorwayInnerTab">
                        <div style={{
                            display: "flex",
                            gap: "8px"
                        }}>
                            <button
                                className="colorwaysPillButton colorwaysPillButton-primary"
                                style={{ flexShrink: "0" }}
                                onClick={async () => {
                                    saveFile(new File([JSON.stringify(contexts.colorwayUsageMetrics)], "colorways_usage_metrics.json", { type: "application/json" }));
                                }}
                            >
                                <DownloadIcon width={14} height={14} />
                                Export usage data
                            </button>
                        </div>
                        <div className="colorways-selector" style={{ gridTemplateColumns: "unset", flexGrow: "1" }}>
                            {contexts.colorwayUsageMetrics.map(color => <div className="discordColorway">
                                <div className="colorwayLabelContainer">
                                    <span className="colorwayLabel">{color.id}</span>
                                    <span className="colorwayLabel colorwayLabelSubnote colorwaysNote">in {color.source} • {color.uses} uses</span>
                                </div>
                            </div>)}
                        </div>
                    </div>
                }
            ]}
            onChange={setActive}
        />
    </div>;
}
