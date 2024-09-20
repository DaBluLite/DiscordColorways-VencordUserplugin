/*
 * Vencord, a Discord client mod
 * Copyright (c) 2023 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { DataStore, FluxDispatcher, FluxEvents, PluginProps, ReactNode, useEffect, useState } from "../../";
import { defaultColorwaySource, fallbackColorways, nullColorwayObj } from "../../constants";
import { Colorway } from "../../types";
import { connect, isWSOpen } from "../../wsClient";
import Setting from "../Setting";
import Switch from "../Switch";
import TabBar from "../TabBar";

export default function ({
    hasTheme = false
}: {
    hasTheme?: boolean;
}) {
    const items = [
        {
            name: "Settings",
            component: () => <div className="colorwayInnerTab">
                <span className="colorwaysModalSectionHeader">Quick Switch</span>
                <Setting divider>
                    <Switch
                        value={colorsButtonVisibility}
                        label="Enable Quick Switch"
                        id="showColorwaysButton"
                        onChange={(v: boolean) => {
                            setColorsButtonVisibility(v);
                            DataStore.set("showColorwaysButton", v);
                            FluxDispatcher.dispatch({
                                type: "COLORWAYS_UPDATE_BUTTON_VISIBILITY" as FluxEvents,
                                isVisible: v
                            });
                        }} />
                    <span className="colorwaysNote">Shows a button on the top of the servers list that opens a colorway selector modal.</span>
                </Setting>
                <span className="colorwaysModalSectionHeader">Appearance</span>
                <Setting divider>
                    <div style={{
                        display: "flex",
                        flexDirection: "row",
                        width: "100%",
                        alignItems: "center",
                        cursor: "pointer"
                    }}>
                        <label className="colorwaySwitch-label">Plugin Theme</label>
                        <select
                            className="colorwaysPillButton"
                            style={{ border: "none" }}
                            onChange={({ currentTarget: { value } }) => {
                                setTheme(value);
                                DataStore.set("colorwaysPluginTheme", value);
                                FluxDispatcher.dispatch({
                                    type: "COLORWAYS_UPDATE_THEME" as FluxEvents,
                                    theme: value
                                });
                            }}
                            value={theme}
                        >
                            <option value="discord">Discord (Default)</option>
                            <option value="colorish">Colorish</option>
                        </select>
                    </div>
                </Setting>
                <span className="colorwaysModalSectionHeader">Manager</span>
                <Setting divider>
                    <div style={{
                        display: "flex",
                        flexDirection: "row",
                        width: "100%",
                        alignItems: "center",
                        cursor: "pointer"
                    }}>
                        <label className="colorwaySwitch-label">Automatically retry to connect to Manager</label>
                        <select
                            className="colorwaysPillButton"
                            style={{ border: "none" }}
                            onChange={({ currentTarget: { value } }) => {
                                setShouldAutoconnect(value as "1" | "2");
                                if (value === "1") {
                                    DataStore.set("colorwaysManagerDoAutoconnect", true);
                                    if (!isWSOpen()) connect();
                                } else {
                                    DataStore.set("colorwaysManagerDoAutoconnect", false);
                                }
                            }}
                            value={shouldAutoconnect}
                        >
                            <option value="1">On (Default)</option>
                            <option value="2">Off</option>
                        </select>
                    </div>
                </Setting>
                <span className="colorwaysModalSectionHeader">Other...</span>
                <Setting divider>
                    <div style={{
                        display: "flex",
                        flexDirection: "row",
                        width: "100%",
                        alignItems: "center",
                        cursor: "pointer"
                    }}>
                        <label className="colorwaySwitch-label">Reset plugin to default settings (CANNOT BE UNDONE)</label>
                        <button
                            className="colorwaysPillButton"
                            onClick={() => {
                                DataStore.setMany([
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
                                    ["colorwaysPreset", "default"]
                                ]);
                            }}
                        >
                            Reset...
                        </button>
                    </div>
                    <span className="colorwaysNote">Reset the plugin to its default settings. All bound managers, sources, and colorways will be deleted. Please reload Discord after use.</span>
                </Setting>
            </div>
        },
        {
            name: "About",
            component: () => <div style={{ flexDirection: "column", display: "flex" }} className="colorwayInnerTab">
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
                <span className="colorwaysModalSectionHeader">
                    Plugin Version:
                </span>
                <span
                    style={{
                        color: "var(--text-muted)",
                        fontWeight: 500,
                        fontSize: "14px",
                        marginBottom: "8px"
                    }}
                >
                    {PluginProps.pluginVersion} ({PluginProps.clientMod})
                </span>
                <span className="colorwaysModalSectionHeader">
                    UI Version:
                </span>
                <span
                    style={{
                        color: "var(--text-muted)",
                        fontWeight: 500,
                        fontSize: "14px",
                        marginBottom: "8px"
                    }}
                >
                    {PluginProps.UIVersion}
                </span>
                <span className="colorwaysModalSectionHeader">
                    CSS Version:
                </span>
                <span
                    style={{
                        color: "var(--text-muted)",
                        fontWeight: 500,
                        fontSize: "14px",
                        marginBottom: "8px"
                    }}
                >
                    {PluginProps.CSSVersion}
                </span>
                <span className="colorwaysModalSectionHeader">
                    Loaded Colorways:
                </span>
                <span
                    style={{
                        color: "var(--text-muted)",
                        fontWeight: 500,
                        fontSize: "14px",
                        marginBottom: "8px"
                    }}
                >
                    {[...colorways, ...customColorways].length}
                </span>
                <span className="colorwaysModalSectionHeader">
                    Project Repositories:
                </span>
                <a role="link" target="_blank" href="https://github.com/DaBluLite/DiscordColorways">DiscordColorways</a>
                <a role="link" target="_blank" href="https://github.com/DaBluLite/ProjectColorway">Project Colorway</a>
            </div>
        }
    ];

    const [colorways, setColorways] = useState<Colorway[]>([]);
    const [customColorways, setCustomColorways] = useState<Colorway[]>([]);
    const [colorsButtonVisibility, setColorsButtonVisibility] = useState<boolean>(false);
    const [theme, setTheme] = useState("discord");
    const [shouldAutoconnect, setShouldAutoconnect] = useState<"1" | "2">("1");
    const [preset, setPreset] = useState<string>("default");
    const [active, setActive] = useState(items[0].name);

    useEffect(() => {
        (async function () {
            const [
                customColorways,
                colorwaySourceFiles,
                showColorwaysButton,
                colorwaysPreset,
                colorwaysPluginTheme,
                colorwaysManagerDoAutoconnect
            ] = await DataStore.getMany([
                "customColorways",
                "colorwaySourceFiles",
                "showColorwaysButton",
                "colorwaysPreset",
                "colorwaysPluginTheme",
                "colorwaysManagerDoAutoconnect"
            ]);

            setTheme(colorwaysPluginTheme);
            setShouldAutoconnect(colorwaysManagerDoAutoconnect ? "1" : "2");

            setPreset(colorwaysPreset);

            const responses: Response[] = await Promise.all(
                colorwaySourceFiles.map(({ url }: { url: string; }) =>
                    fetch(url)
                )
            );
            const data = await Promise.all(
                responses.map((res: Response) =>
                    res.json().catch(() => { return { colorways: [] }; })
                ));
            const colorways = data.flatMap(json => json.colorways);
            setColorways(colorways || fallbackColorways);
            setCustomColorways(customColorways.map(source => source.colorways).flat(2));
            setColorsButtonVisibility(showColorwaysButton);
        })();
    }, []);

    function Container({ children }: { children: ReactNode; }) {
        if (hasTheme) return <div className="colorwaysModalTab" data-theme={theme}>{children}</div>;
        else return <div className="colorwaysModalTab">{children}</div>;
    }

    return <Container>
        <TabBar active={active} container={({ children }) => <div className="colorwaysPageHeader">{children}</div>} items={items} onChange={setActive} />
        {items.map(item => {
            const Component = item.component;
            return active === item.name ? <Component /> : null;
        })}
    </Container>;
}
