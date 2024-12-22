/*
 * Vencord, a Discord client mod
 * Copyright (c) 2023 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { useState } from "../../";
import { Dispatcher } from "../../api";
import { initContexts, setContext, setContexts, unsavedContexts } from "../../api/Contexts";
import { useContexts, useContextualState } from "../../api/Hooks";
import { openModal } from "../../api/Modals";
import { colorToHex } from "../../api/Utils/Colors";
import { chooseFile, saveFile } from "../../api/Utils/Fs";
import { connect } from "../../api/WebSocket";
import { nullColorwayObj, themes } from "../../constants";
import { getAutoPresets } from "../../css";
import { ColorwayObject, Context, ContextKey } from "../../types";
import ComboTextBox from "../ComboTextBox";
import FeaturePresenter from "../FeaturePresenter";
import { CogIcon, DownloadIcon, OpenExternalIcon, PalleteIcon, WirelessIcon } from "../Icons";
import Modal from "../Modal";
import SelectionCircle from "../SelectionCircle";
import Setting from "../Setting";
import Switch from "../Switch";
import TabBar from "../TabBar";
import Tooltip from "../Tooltip";

export default function () {
    const items = [
        {
            name: "Settings",
            component: () => <Settings />
        },
        {
            name: "History",
            component: () => <History />
        }
    ];
    const [active, setActive] = useState<typeof items[number]["name"]>(items[0].name);

    return <TabBar
        active={active}
        container={({ children }) => <div className="dc-page-header">{children}</div>}
        items={items}
        onChange={setActive}
    />;
}

function History() {
    const [searchValue, setSearchValue] = useState("");
    const [colorwayUsageMetrics] = useContextualState("colorwayUsageMetrics");
    return <>
        <ComboTextBox
            value={searchValue}
            onInput={setSearchValue}
            placeholder="Search for a Colorway..."

        >
            <button
                className="dc-button dc-button-primary"
                style={{ flexShrink: "0", width: "fit-content" }}
                onClick={async () => {
                    saveFile(new File([JSON.stringify(colorwayUsageMetrics)], "colorways_usage_metrics.json", { type: "application/json" }));
                }}
            >
                <DownloadIcon width={14} height={14} />
                Export usage data
            </button>
        </ComboTextBox>
        <div className="dc-selector" style={{ gridTemplateColumns: "unset", flexGrow: "1" }}>
            {colorwayUsageMetrics.filter(({ id }) => id?.toLowerCase().includes(searchValue.toLowerCase())).map(color => <div className="dc-colorway">
                <div className="dc-label-wrapper">
                    <span className="dc-label">{color.id}</span>
                    <span className="dc-label dc-subnote dc-note">in {color.source} • {color.uses} uses</span>
                </div>
            </div>)}
        </div>
    </>;
}

function Settings() {
    const contexts = useContexts();

    return <>
        <span className="dc-field-header">General</span>
        <Setting divider>
            <Switch
                value={contexts.showColorwaysButton}
                label="Enable Quick Step"
                id="showColorwaysButton"
                onChange={(v: boolean) => {
                    setContext("showColorwaysButton", v);
                }} />
            <span className="dc-note">Shows a button on the top of the servers list that launches the DiscordColorways App.</span>
        </Setting>
        <span className="dc-field-header">App theme</span>
        <Setting divider>
            <div style={{
                display: "flex",
                gap: "24px"
            }}>
                {themes.map(({ name, id, preview }) => <Tooltip
                    text={name}
                    position="top"
                >
                    {({ onClick, onMouseEnter, onMouseLeave }) => <div className="dc-color-swatch-selectable">
                        <div
                            className="dc-color-swatch"
                            onMouseEnter={onMouseEnter}
                            onMouseLeave={onMouseLeave}
                            onClick={e => {
                                onClick(e);
                                setContext("colorwaysPluginTheme", id);
                            }}
                            style={{ backgroundColor: preview }}
                        />
                        {contexts.colorwaysPluginTheme === id ? <SelectionCircle /> : null}
                    </div>}
                </Tooltip>)}
            </div>
        </Setting>
        <span className="dc-field-header">Auto Colors</span>
        <Setting divider>
            <div style={{
                display: "flex",
                gap: "24px"
            }}>
                {Object.values(getAutoPresets("5865f2")).map(({ name, id, colors }) => <Tooltip
                    text={name}
                    position="top"
                >
                    {({ onClick, onMouseEnter, onMouseLeave }) => <div className="dc-color-swatch-selectable">
                        <div
                            className="dc-color-swatch"
                            onMouseEnter={onMouseEnter}
                            onMouseLeave={onMouseLeave}
                            onClick={e => {
                                onClick(e);
                                setContext("activeAutoPreset", id);

                                if (contexts.activeColorwayObject.id === "Auto" && contexts.activeColorwayObject.sourceType === "auto") {
                                    const { colors } = getAutoPresets(colorToHex(getComputedStyle(document.body).getPropertyValue("--os-accent-color")).slice(0, 6))[id];
                                    const newObj: ColorwayObject = {
                                        id: "Auto",
                                        sourceType: "auto",
                                        source: null,
                                        colors: colors
                                    };
                                    if (!contexts.isConnected) {
                                        setContext("activeColorwayObject", newObj);
                                    } else {
                                        if (!contexts.hasManagerRole) {
                                        } else {
                                            Dispatcher.dispatch("COLORWAYS_SEND_COLORWAY", {
                                                active: newObj
                                            });
                                        }
                                    }
                                }
                            }}
                        >
                            <div className="dc-color-swatch-part" style={{ backgroundColor: colors.accent }} />
                            <div className="dc-color-swatch-part" style={{ backgroundColor: colors.primary }} />
                            <div className="dc-color-swatch-part" style={{ backgroundColor: colors.secondary }} />
                            <div className="dc-color-swatch-part" style={{ backgroundColor: colors.tertiary }} />
                        </div>
                        {contexts.activeAutoPreset === id ? <SelectionCircle /> : null}
                    </div>}
                </Tooltip>)}
            </div>
            <span className="dc-note">The auto colorway allows you to turn your system's accent color into a fully fledged colorway through various Auto Presets.</span>
        </Setting>
        <span className="dc-field-header">Manager</span>
        <Setting>
            <Switch
                value={contexts.colorwaysManagerDoAutoconnect}
                label="Automatically retry to connect to Manager"
                id="autoReconnect"
                onChange={(v: boolean) => {
                    setContext("colorwaysManagerDoAutoconnect", v);
                    if (!contexts.isConnected && v) connect();
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
                <label className="dc-switch-label">Reconnection Delay (in ms)</label>
                <input
                    type="number"
                    className="dc-textbox"
                    style={{
                        width: "100px",
                        textAlign: "end"
                    }}
                    value={contexts.colorwaysManagerAutoconnectPeriod}
                    autoFocus
                    onInput={({ currentTarget: { value } }) => {
                        setContext("colorwaysManagerAutoconnectPeriod", Number(value || "0"));
                    }}
                />
            </div>
        </Setting>
        <span className="dc-field-header">Manage Settings...</span>
        <Setting divider>
            <div style={{
                display: "flex",
                flexDirection: "row",
                width: "100%",
                alignItems: "center",
                cursor: "pointer"
            }}>
                <button
                    className="dc-button dc-button-primary"
                    onClick={() => {
                        const data = { ...contexts };

                        unsavedContexts.forEach(key => {
                            delete data[key];
                        });

                        saveFile(new File([JSON.stringify(data)], "DiscordColorways.settings.json", { type: "application/json" }));
                    }}
                >
                    Export Settings...
                </button>
                <button
                    className="dc-button dc-button-danger"
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
                                    const settings: { [key in ContextKey]: Context<key>; } = JSON.parse(reader.result as string) as { [key in ContextKey]: Context<key>; };
                                    Object.keys(settings).forEach(key => {
                                        setContext(key as ContextKey, settings[key], !unsavedContexts.includes(key));
                                    });

                                    closeModal();

                                    initContexts();
                                };
                            }}
                            confirmMsg="Import File..."
                            type="danger"
                        >
                            Are you sure you want to import a settings file? Current settings will be overwritten!
                        </Modal>);
                    }}
                >
                    Import from JSON file...
                </button>
                <button
                    className="dc-button dc-button-danger"
                    style={{
                        marginLeft: "8px"
                    }}
                    onClick={() => {
                        openModal(props => <Modal
                            modalProps={props}
                            title="Reset DiscordColorways"
                            onFinish={async ({ closeModal }) => {
                                const resetValues: ([ContextKey, Context<ContextKey>] | [ContextKey, Context<ContextKey>, boolean])[] = [
                                    ["colorwaysPluginTheme", "discord"],
                                    ["colorwaySourceFiles", []],
                                    ["customColorways", []],
                                    ["activeColorwayObject", nullColorwayObj],
                                    ["activeAutoPreset", "hueRotation"],
                                    ["colorwayData", [], false],
                                    ["showColorwaysButton", false],
                                    ["colorwayUsageMetrics", []],
                                    ["colorwaysManagerDoAutoconnect", true],
                                    ["colorwaysManagerAutoconnectPeriod", 3000],
                                    ["hasManagerRole", false, false],
                                    ["isConnected", false, false],
                                    ["boundKey", { "00000000": `discord.${Math.random().toString(16).slice(2)}.${new Date().getUTCMilliseconds()}` }, false],
                                    ["colorwaysBoundManagers", []],
                                ];

                                setContexts(...resetValues);
                                initContexts();
                                closeModal();
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
                                        title: "Your Colorways and presets"
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
                    Reset DiscordColorways
                </button>
            </div>
        </Setting>
        <span className="dc-field-header">About</span>
        <h1 className="dc-wordmark">
            Discord <span className="dc-wordmark-colorways">Colorways</span>
        </h1>
        <span
            style={{
                color: "var(--text-normal)",
                fontWeight: 500,
                fontSize: "14px"
            }}
        >by Project Colorway</span>
        <span
            className="dc-note"
            style={{
                color: "var(--text-normal)",
                fontWeight: 500,
                fontSize: "14px",
                marginBottom: "12px"
            }}
        >
            Version {contexts.discordColorwaysData.version.split(".")[0]}{contexts.discordColorwaysData.version.split(".")[1] !== "0" ? `.${contexts.discordColorwaysData.version.split(".")[1]}` : ""}{contexts.discordColorwaysData.version.split(".")[2] !== "0" ? ` (Patch ${contexts.discordColorwaysData.version.split(".")[2]})` : ""}
        </span>
        <div style={{
            display: "flex",
            flexDirection: "row",
            width: "100%",
            alignItems: "center",
            cursor: "pointer"
        }}>
            <a role="link" target="_blank" className="dc-button dc-button-primary" style={{ width: "fit-content" }} href="https://github.com/DaBluLite/DiscordColorways">DiscordColorways <OpenExternalIcon width={16} height={16} /></a>
            <a role="link" target="_blank" className="dc-button dc-button-primary" style={{ width: "fit-content", marginLeft: "8px" }} href="https://github.com/DaBluLite/ProjectColorway">Project Colorway <OpenExternalIcon width={16} height={16} /></a>
        </div>
    </>;
}
