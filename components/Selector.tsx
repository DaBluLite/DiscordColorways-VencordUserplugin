/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { DataStore, FluxDispatcher, FluxEvents, PluginProps, Toasts, UserStore } from "..";
import { openModal, useEffect, useState } from "../";
import { ColorwayCSS } from "../colorwaysAPI";
import { nullColorwayObj } from "../constants";
import { contexts, setContext } from "../contexts";
import { generateCss, getAutoPresets, getPreset, gradientBase, gradientPresetIds } from "../css";
import { Colorway, ColorwayObject, SortOptions, SourceObject } from "../types";
import { Clipboard, colorToHex, compareColorwayObjects, saveFile, stringToHex } from "../utils";
import { hasManagerRole, requestManagerRole, sendColorway, updateRemoteSources, wsOpen } from "../wsClient";
import { CodeIcon, DeleteIcon, DownloadIcon, IDIcon, PencilIcon, PlusIcon, WirelessIcon } from "./Icons";
import Modal from "./Modal";
import SaveColorwayAsModal from "./Modals/SaveColorwayAsModal";
import Radio from "./Radio";
import ReloadButton from "./ReloadButton";
import RightClickContextMenu from "./RightClickContextMenu";
import Spinner from "./Spinner";
import StaticOptionsMenu from "./StaticOptionsMenu";

export default function ({
    settings = { selectorType: "normal" },
    hasTheme = false
}: {
    settings?: { selectorType: "preview" | "multiple-selection" | "normal", previewSource?: string, onSelected?: (colorways: Colorway[]) => void; };
    hasTheme?: boolean;
}) {
    const [colorwayData, setColorwayData] = useState<SourceObject[]>([]);
    const [searchValue, setSearchValue] = useState<string>("");
    const [sortBy, setSortBy] = useState<SortOptions>(SortOptions.MOST_USED);
    const [activeColorwayObject, setActiveColorwayObject] = useState<ColorwayObject>(contexts.activeColorwayObject);
    const [customColorwayData, setCustomColorwayData] = useState<SourceObject[]>(contexts.customColorways.map((colorSrc: { name: string, colorways: Colorway[], id?: string; }) => ({ type: "offline", source: colorSrc.name, colorways: colorSrc.colorways })));
    const [showSpinner, setShowSpinner] = useState<boolean>(false);
    const [visibleSources, setVisibleSources] = useState<string>("all");
    const [selectedColorways, setSelectedColorways] = useState<Colorway[]>([]);
    const [errorCode, setErrorCode] = useState<number>(0);
    const [wsConnected, setWsConnected] = useState(wsOpen);
    const [theme, setTheme] = useState(contexts.colorwaysPluginTheme);
    const [isManager, setManager] = useState<boolean>(hasManagerRole);
    const [layout, setLayout] = useState<"normal" | "compact">("normal");
    const [usageMetrics, setUsageMetrics] = useState<(ColorwayObject & { uses: number; })[]>(contexts.colorwayUsageMetrics);

    useEffect(() => {
        FluxDispatcher.subscribe("COLORWAYS_UPDATE_WS_CONNECTED" as FluxEvents, ({ isConnected }) => setWsConnected(isConnected));
        FluxDispatcher.subscribe("COLORWAYS_UPDATE_ACTIVE_COLORWAY" as FluxEvents, ({ active }) => setActiveColorwayObject(active));
        FluxDispatcher.subscribe("COLORWAYS_UPDATE_WS_MANAGER_ROLE" as FluxEvents, ({ isManager }) => setManager(isManager));
        FluxDispatcher.subscribe("COLORWAYS_UPDATE_THEME" as FluxEvents, ({ theme }) => setTheme(theme));

        return () => {
            FluxDispatcher.unsubscribe("COLORWAYS_UPDATE_WS_CONNECTED" as FluxEvents, ({ isConnected }) => setWsConnected(isConnected));
            FluxDispatcher.unsubscribe("COLORWAYS_UPDATE_ACTIVE_COLORWAY" as FluxEvents, ({ active }) => setActiveColorwayObject(active));
            FluxDispatcher.unsubscribe("COLORWAYS_UPDATE_WS_MANAGER_ROLE" as FluxEvents, ({ isManager }) => setManager(isManager));
            FluxDispatcher.unsubscribe("COLORWAYS_UPDATE_THEME" as FluxEvents, ({ theme }) => setTheme(theme));
        };
    }, [isManager]);

    function setColorway(obj: Colorway, src: string, action: "add" | "remove") {
        if (action === "add") {
            const srcList: { name: string, colorways: Colorway[]; }[] = customColorwayData.map(s => {
                if (s.source === src) {
                    return { name: s.source, colorways: [...s.colorways, obj] };
                }
                return { name: s.source, colorways: s.colorways };
            });
            setCustomColorwayData(srcList.map(colorSrc => ({ type: "offline", source: colorSrc.name, colorways: colorSrc.colorways })));
            setContext("customColorways", srcList);
            updateRemoteSources();
        }
        if (action === "remove") {
            const srcList: { name: string, colorways: Colorway[]; }[] = customColorwayData.map(s => {
                if (s.source === src) {
                    return { name: s.source, colorways: s.colorways.filter(c => c.name !== obj.name) };
                }
                return { name: s.source, colorways: s.colorways };
            });
            setCustomColorwayData(srcList.map(colorSrc => ({ type: "offline", source: colorSrc.name, colorways: colorSrc.colorways })));
            setContext("customColorways", srcList);
            updateRemoteSources();
        }
    }

    const layouts = [{ name: "Normal", id: "normal" }, { name: "Compact", id: "compact" }];

    const filters = [
        {
            name: "All",
            id: "all",
            sources: [...colorwayData, ...customColorwayData]
        },
        ...colorwayData.map(source => ({
            name: source.source,
            id: source.source.toLowerCase().replaceAll(" ", "-"),
            sources: [source]
        })),
        ...customColorwayData.map(source => ({
            name: source.source,
            id: source.source.toLowerCase().replaceAll(" ", "-"),
            sources: [source]
        }))
    ];

    useEffect(() => {
        (async function () {
            if (settings.previewSource) {
                setShowSpinner(true);

                const res: Response = await fetch(settings.previewSource);

                const dataPromise = res.json().then(data => data).catch(() => ({ colorways: [], errorCode: 1, errorMsg: "Colorway Source format is invalid" }));

                const data = await dataPromise;

                if (data.errorCode) {
                    setErrorCode(data.errorCode);
                }

                const colorwayList: Colorway[] = data.css ? data.css.map(customStore => customStore.colorways).flat() : data.colorways;

                setColorwayData([{ colorways: colorwayList || [], source: res.url, type: "online" }] as { type: "online" | "offline" | "temporary", source: string, colorways: Colorway[]; }[]);
                setShowSpinner(false);
            } else setColorwayData(contexts.colorwayData);
        })();
    }, []);

    return <><div className="colorwayModal-selectorHeader" data-theme={hasTheme ? theme : "discord"}>
        <div className="colorwaySelectorHeader colorwayTextBox">
            <input
                type="text"
                className="colorwayTextBox"
                placeholder="Search for Colorways..."
                value={searchValue}
                autoFocus
                onInput={({ currentTarget: { value } }) => setSearchValue(value)}
            />
            <Spinner className={`colorwaySelectorSpinner${!showSpinner ? " colorwaySelectorSpinner-hidden" : ""}`} />
            <ReloadButton
                onClick={async data => setColorwayData(data)}
                setShowSpinner={setShowSpinner}
            />
            <button
                className="colorwaysPillButton colorwaysPillButton-primary"
                onClick={() => {
                    openModal(props => <SaveColorwayAsModal
                        modalProps={props}
                        loadUI={async () => {
                            setContext("customColorways", await DataStore.get("customColorways") as ReturnType<typeof setContext>);
                            setCustomColorwayData((await DataStore.get("customColorways")).map((colorSrc: { name: string, colorways: Colorway[], id?: string; }) => ({ type: "offline", source: colorSrc.name, colorways: colorSrc.colorways })));
                        }}
                    />);
                }}
            >
                <PlusIcon width={14} height={14} style={{ boxSizing: "content-box" }} />
                Add...
            </button>
            <StaticOptionsMenu
                menu={<>
                    <button onClick={() => setSortBy(9)} className="colorwaysContextMenuItm">
                        Most Used
                        <Radio checked={sortBy === 9} style={{
                            marginLeft: "8px"
                        }} />
                    </button>
                    <button onClick={() => setSortBy(10)} className="colorwaysContextMenuItm">
                        Least Used
                        <Radio checked={sortBy === 10} style={{
                            marginLeft: "8px"
                        }} />
                    </button>
                    <button onClick={() => setSortBy(1)} className="colorwaysContextMenuItm">
                        Name (A-Z)
                        <Radio checked={sortBy === 1} style={{
                            marginLeft: "8px"
                        }} />
                    </button>
                    <button onClick={() => setSortBy(2)} className="colorwaysContextMenuItm">
                        Name (Z-A)
                        <Radio checked={sortBy === 2} style={{
                            marginLeft: "8px"
                        }} />
                    </button>
                    <button onClick={() => setSortBy(3)} className="colorwaysContextMenuItm">
                        Source (A-Z)
                        <Radio checked={sortBy === 3} style={{
                            marginLeft: "8px"
                        }} />
                    </button>
                    <button onClick={() => setSortBy(4)} className="colorwaysContextMenuItm">
                        Source (Z-A)
                        <Radio checked={sortBy === 4} style={{
                            marginLeft: "8px"
                        }} />
                    </button>
                    <button onClick={() => setSortBy(5)} className="colorwaysContextMenuItm">
                        Source Type (Online First)
                        <Radio checked={sortBy === 5} style={{
                            marginLeft: "8px"
                        }} />
                    </button>
                    <button onClick={() => setSortBy(6)} className="colorwaysContextMenuItm">
                        Source Type (Offline First)
                        <Radio checked={sortBy === 6} style={{
                            marginLeft: "8px"
                        }} />
                    </button>
                    <button onClick={() => setSortBy(7)} className="colorwaysContextMenuItm">
                        Color Count (Ascending)
                        <Radio checked={sortBy === 7} style={{
                            marginLeft: "8px"
                        }} />
                    </button>
                    <button onClick={() => setSortBy(8)} className="colorwaysContextMenuItm">
                        Color Count (Descending)
                        <Radio checked={sortBy === 8} style={{
                            marginLeft: "8px"
                        }} />
                    </button>
                </>}>
                {({ onClick }) => <button
                    onClick={onClick}
                    className="colorwaysPillButton colorwaysPillButton-primary"
                >
                    Sort By: {(() => {
                        switch (sortBy) {
                            case 1:
                                return "Name (A-Z)";
                            case 2:
                                return "Name (Z-A)";
                            case 3:
                                return "Source (A-Z)";
                            case 4:
                                return "Source (Z-A)";
                            case 5:
                                return "Source Type (Online First)";
                            case 6:
                                return "Source Type (Offline First)";
                            case 7:
                                return "Color Count (Ascending)";
                            case 8:
                                return "Color Count (Descending)";
                            case 9:
                                return "Most Used";
                            case 10:
                                return "Least Used";
                            default:
                                return "Name (A-Z)";
                        }
                    })()}
                </button>}
            </StaticOptionsMenu>
            <StaticOptionsMenu
                menu={<>
                    {filters.map(({ name, id }) => {
                        return <button onClick={() => setVisibleSources(id)} className="colorwaysContextMenuItm">
                            {name}
                            <Radio checked={visibleSources === id} style={{
                                marginLeft: "8px"
                            }} />
                        </button>;
                    })}
                </>}>
                {({ onClick }) => <button
                    onClick={onClick}
                    className="colorwaysPillButton colorwaysPillButton-primary"
                >
                    Source: {(filters.find(filter => filter.id === visibleSources) as { name: string, id: string, sources: SourceObject[]; }).name}
                </button>}
            </StaticOptionsMenu>
            <button
                className="colorwaysPillButton colorwaysPillButton-primary"
                onClick={() => {
                    if (layout === "normal") return setLayout("compact");
                    else return setLayout("normal");
                }}
            >
                Layout: {layouts.find(l => l.id === layout)?.name}
            </button>
        </div>
    </div>
        {(wsConnected && settings.selectorType === "normal" && !isManager) ? <div className="colorwaysManagerActive">
            A manager is connected. Color selection is locked
            <button
                className="colorwaysPillButton colorwaysPillButton-primary"
                onClick={requestManagerRole}
            >
                <svg aria-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24">
                    <path fill="currentColor" fill-rule="evenodd" d="M6 9h1V6a5 5 0 0 1 10 0v3h1a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-8a3 3 0 0 1 3-3Zm9-3v3H9V6a3 3 0 1 1 6 0Zm-1 8a2 2 0 0 1-1 1.73V18a1 1 0 1 1-2 0v-2.27A2 2 0 1 1 14 14Z" clip-rule="evenodd" />
                </svg>
                Request Manager Role
            </button>
        </div> : <></>}
        <div style={{ maxHeight: settings.selectorType === "multiple-selection" ? "50%" : "unset" }} className="colorways-selector" data-theme={hasTheme ? theme : "discord"} data-layout={layout}>
            {(activeColorwayObject.sourceType === "temporary" && settings.selectorType === "normal") && <div
                className="discordColorway"
                id="colorway-Temporary"
                role="button"
                aria-checked={activeColorwayObject.sourceType === "temporary"}
                onClick={async () => {
                    setContext("activeColorwayObject", nullColorwayObj);
                    setActiveColorwayObject(nullColorwayObj);
                    ColorwayCSS.remove();
                }}
            >
                <div className="discordColorwayPreviewColorContainer">
                    <div
                        className="discordColorwayPreviewColor"
                        style={{ backgroundColor: "#" + activeColorwayObject.colors.accent }} />
                    <div
                        className="discordColorwayPreviewColor"
                        style={{ backgroundColor: "#" + activeColorwayObject.colors.primary }} />
                    <div
                        className="discordColorwayPreviewColor"
                        style={{ backgroundColor: "#" + activeColorwayObject.colors.secondary }} />
                    <div
                        className="discordColorwayPreviewColor"
                        style={{ backgroundColor: "#" + activeColorwayObject.colors.tertiary }} />
                </div>
                <div className="colorwayLabelContainer">
                    <span className="colorwayLabel">{activeColorwayObject.id}</span>
                    <span className="colorwayLabel colorwayLabelSubnote colorwaysNote">Temporary Colorway</span>
                </div>
                <button
                    className="colorwaysPillButton colorwaysPillButton-secondary"
                    onClick={async e => {
                        e.stopPropagation();
                        openModal(props => <SaveColorwayAsModal
                            modalProps={props}
                            colorwayObject={activeColorwayObject}
                            loadUI={async () => {
                                setContext("customColorways", await DataStore.get("customColorways") as ReturnType<typeof setContext>);
                                setCustomColorwayData((await DataStore.get("customColorways")).map((colorSrc: { name: string, colorways: Colorway[], id?: string; }) => ({ type: "offline", source: colorSrc.name, colorways: colorSrc.colorways })));
                            }}
                        />);
                    }}
                >
                    <PlusIcon width={20} height={20} />
                </button>
            </div>}
            {getComputedStyle(document.body).getPropertyValue("--os-accent-color") && settings.selectorType === "normal" && "auto".includes(searchValue.toLowerCase()) ? <div
                className="discordColorway"
                id="colorway-Auto"
                role="button"
                aria-checked={activeColorwayObject.id === "Auto" && activeColorwayObject.sourceType === "auto"}
                onClick={async () => {
                    const activeAutoPreset = await DataStore.get("activeAutoPreset");
                    if (activeColorwayObject.id === "Auto" && activeColorwayObject.sourceType === "auto") {
                        if (isManager) {
                            sendColorway(nullColorwayObj);
                        } else {
                            setContext("activeColorwayObject", nullColorwayObj);
                            setActiveColorwayObject(nullColorwayObj);
                            ColorwayCSS.remove();
                        }
                    } else {
                        const { colors } = getAutoPresets(colorToHex(getComputedStyle(document.body).getPropertyValue("--os-accent-color")).slice(0, 6))[activeAutoPreset];
                        const newObj: ColorwayObject = {
                            id: "Auto",
                            sourceType: "online",
                            source: null,
                            colors: colors
                        };
                        if (isManager) {
                            sendColorway(newObj);
                        } else {
                            ColorwayCSS.set(generateCss(
                                colors,
                                true,
                                true,
                                undefined,
                                "Auto Colorway"
                            ));
                            setContext("activeColorwayObject", newObj);
                            setActiveColorwayObject(newObj);
                        }
                    }
                }}
            >
                <div className="discordColorwayPreviewColorContainer" style={{ backgroundColor: "var(--os-accent-color)" }} />
                <div className="colorwayLabelContainer">
                    <span className="colorwayLabel">Auto Colorway</span>
                    <span className="colorwayLabel colorwayLabelSubnote colorwaysNote">Active preset: {Object.values(getAutoPresets()).find(pr => pr.id === contexts.activeAutoPreset)?.name}</span>
                </div>
            </div> : <></>}
            {errorCode !== 0 && <span style={{
                color: "#fff",
                margin: "auto",
                fontWeight: "bold",
                display: "flex",
                gap: "8px",
                alignItems: "center"
            }}>
                {errorCode === 1 && "Error: Invalid Colorway Source Format. If this error persists, contact the source author to resolve the issue."}
            </span>}
            {(filters
                .find(filter => filter.id === visibleSources) as { name: string, id: string, sources: SourceObject[]; } || { name: "null", id: "null", sources: [] }).sources
                .map(({ colorways, source, type }) => colorways.map((colorway: Colorway) => ({ ...colorway, sourceType: type, source: source, preset: colorway.preset || (colorway.isGradient ? "Gradient" : "Default") })))
                .flat()
                .sort((a, b) => {
                    const objA = {
                        id: a.name,
                        source: a.source,
                        sourceType: a.sourceType,
                        colors: {}
                    } as ColorwayObject;
                    a.accent ? (objA.colors.accent = "#" + colorToHex(a.accent)) : void 0;
                    a.primary ? (objA.colors.primary = "#" + colorToHex(a.primary)) : void 0;
                    a.secondary ? (objA.colors.secondary = "#" + colorToHex(a.secondary)) : void 0;
                    a.tertiary ? (objA.colors.tertiary = "#" + colorToHex(a.tertiary)) : void 0;
                    const objB = {
                        id: b.name,
                        source: b.source,
                        sourceType: b.sourceType,
                        colors: {}
                    } as ColorwayObject;
                    b.accent ? (objB.colors.accent = "#" + colorToHex(b.accent)) : void 0;
                    b.primary ? (objB.colors.primary = "#" + colorToHex(b.primary)) : void 0;
                    b.secondary ? (objB.colors.secondary = "#" + colorToHex(b.secondary)) : void 0;
                    b.tertiary ? (objB.colors.tertiary = "#" + colorToHex(b.tertiary)) : void 0;
                    const aMetric = usageMetrics.find(metric => compareColorwayObjects(metric, objA)) || { ...objA, uses: 0 };
                    const bMetric = usageMetrics.find(metric => compareColorwayObjects(metric, objB)) || { ...objB, uses: 0 };
                    switch (sortBy) {
                        case SortOptions.NAME_AZ:
                            return a.name.localeCompare(b.name);
                        case SortOptions.NAME_ZA:
                            return b.name.localeCompare(a.name);
                        case SortOptions.SOURCE_AZ:
                            return a.source.localeCompare(b.source);
                        case SortOptions.SOURCE_ZA:
                            return b.source.localeCompare(a.source);
                        case SortOptions.SOURCETYPE_ONLINE:
                            return a.sourceType === "online" ? -1 : 1;
                        case SortOptions.SOURCETYPE_OFFLINE:
                            return a.sourceType === "offline" ? -1 : 1;
                        case SortOptions.COLORCOUNT_ASCENDING:
                            return (a.colors || [
                                "accent",
                                "primary",
                                "secondary",
                                "tertiary",
                            ]).length - (b.colors || [
                                "accent",
                                "primary",
                                "secondary",
                                "tertiary",
                            ]).length;
                        case SortOptions.COLORCOUNT_DESCENDING:
                            return (b.colors || [
                                "accent",
                                "primary",
                                "secondary",
                                "tertiary",
                            ]).length - (a.colors || [
                                "accent",
                                "primary",
                                "secondary",
                                "tertiary",
                            ]).length;
                        case SortOptions.MOST_USED:
                            if (aMetric.uses === bMetric.uses) {
                                return a.name.localeCompare(b.name);
                            } else {
                                return bMetric.uses - aMetric.uses;
                            }
                        case SortOptions.LEAST_USED:
                            if (aMetric.uses === bMetric.uses) {
                                return b.name.localeCompare(a.name);
                            } else {
                                return aMetric.uses - bMetric.uses;
                            }
                        default:
                            return a.name.localeCompare(b.name);
                    }
                })
                .filter(({ name }) => name.toLowerCase().includes(searchValue.toLowerCase()))
                .map((color: Colorway) => <RightClickContextMenu menu={<>
                    <div className="colorwaysContextMenuColors">
                        {(color.colors || [
                            "accent",
                            "primary",
                            "secondary",
                            "tertiary",
                        ]).map(c => <div className="colorwaysContextMenuColor" style={{ backgroundColor: "#" + colorToHex(color[c]) }} onClick={() => {
                            Clipboard.copy("#" + colorToHex(color[c]));
                            Toasts.show({
                                message: "Copied Color Successfully",
                                type: 1,
                                id: "copy-color-notify",
                            });
                        }} />)}
                    </div>
                    <button onClick={() => {
                        const colorwayIDArray = `${color.accent},${color.primary},${color.secondary},${color.tertiary}|n:${color.name}${color.preset ? `|p:${color.preset}` : ""}`;
                        const colorwayID = stringToHex(colorwayIDArray);
                        Clipboard.copy(colorwayID);
                        Toasts.show({
                            message: "Copied Colorway ID Successfully",
                            type: 1,
                            id: "copy-colorway-id-notify",
                        });
                    }} className="colorwaysContextMenuItm">
                        Copy Colorway ID
                        <IDIcon width={16} height={16} style={{
                            marginLeft: "8px"
                        }} />
                    </button>
                    <button onClick={() => {
                        const newObj: ColorwayObject = {
                            id: color.name,
                            sourceType: color.sourceType,
                            source: color.source,
                            colors: {}
                        } as ColorwayObject;
                        color.accent ? (newObj.colors.accent = "#" + colorToHex(color.accent)) : void 0;
                        color.primary ? (newObj.colors.primary = "#" + colorToHex(color.primary)) : void 0;
                        color.secondary ? (newObj.colors.secondary = "#" + colorToHex(color.secondary)) : void 0;
                        color.tertiary ? (newObj.colors.tertiary = "#" + colorToHex(color.tertiary)) : void 0;
                        Clipboard.copy(generateCss(
                            newObj.colors,
                            true,
                            true,
                            undefined,
                            newObj.id as string
                        ));
                        Toasts.show({
                            message: "Copied CSS to Clipboard",
                            type: 1,
                            id: "copy-colorway-css-notify",
                        });
                    }} className="colorwaysContextMenuItm">
                        Copy CSS
                        <CodeIcon width={16} height={16} style={{
                            marginLeft: "8px"
                        }} />
                    </button>
                    <button onClick={() => {
                        const newObj: ColorwayObject = {
                            id: color.name,
                            sourceType: color.sourceType,
                            source: color.source,
                            colors: {}
                        } as ColorwayObject;
                        color.accent ? (newObj.colors.accent = "#" + colorToHex(color.accent)) : void 0;
                        color.primary ? (newObj.colors.primary = "#" + colorToHex(color.primary)) : void 0;
                        color.secondary ? (newObj.colors.secondary = "#" + colorToHex(color.secondary)) : void 0;
                        color.tertiary ? (newObj.colors.tertiary = "#" + colorToHex(color.tertiary)) : void 0;
                        saveFile(new File([`/**
                            * @name ${color.name || "Colorway"}
                            * @version ${PluginProps.CSSVersion}
                            * @description Automatically generated Colorway.
                            * @author ${UserStore.getCurrentUser().username}
                            * @authorId ${UserStore.getCurrentUser().id}
                            */
                           ${generateCss(
                            newObj.colors,
                            true,
                            true,
                            undefined,
                            newObj.id as string
                        )}`], `${color.name.replaceAll(" ", "-").toLowerCase()}.theme.css`, { type: "text/plain" }));
                    }} className="colorwaysContextMenuItm">
                        Download CSS as Theme
                        <DownloadIcon width={16} height={16} style={{
                            marginLeft: "8px"
                        }} />
                    </button>
                    {color.sourceType === "offline" ? <>
                        <button onClick={async () => {
                            openModal(props => <SaveColorwayAsModal
                                store={color.source}
                                colorwayObject={{
                                    id: color.name,
                                    source: color.source,
                                    sourceType: color.sourceType,
                                    colors: {
                                        accent: colorToHex(color.accent) || "5865f2",
                                        primary: colorToHex(color.primary) || "313338",
                                        secondary: colorToHex(color.secondary) || "2b2d31",
                                        tertiary: colorToHex(color.tertiary) || "1e1f22"
                                    }
                                }}
                                modalProps={props}
                                loadUI={async () => {
                                    setContext("customColorways", await DataStore.get("customColorways") as ReturnType<typeof setContext>);
                                    setCustomColorwayData((await DataStore.get("customColorways")).map((colorSrc: { name: string, colorways: Colorway[], id?: string; }) => ({ type: "offline", source: colorSrc.name, colorways: colorSrc.colorways })));
                                }}
                            />);
                        }} className="colorwaysContextMenuItm">
                            Edit Colorway
                            <PencilIcon width={16} height={16} style={{
                                marginLeft: "8px"
                            }} />
                        </button>
                        <button onClick={() => {
                            openModal(props => <Modal
                                modalProps={props}
                                title="Delete Colorway"
                                onFinish={async ({ closeModal }) => {
                                    if (activeColorwayObject.id === color.name) {
                                        setContext("activeColorwayObject", nullColorwayObj);
                                        setActiveColorwayObject(nullColorwayObj);
                                        ColorwayCSS.remove();
                                    }
                                    setColorway(color, color.source as string, "remove");
                                    closeModal();
                                }}
                                confirmMsg="Delete"
                                type="danger"
                            >
                                Are you sure you want to delete this colorway? This cannot be undone!
                            </Modal>);
                        }} className="colorwaysContextMenuItm colorwaysContextMenuItm-danger">
                            Delete Colorway...
                            <DeleteIcon width={16} height={16} style={{
                                marginLeft: "8px"
                            }} />
                        </button>
                    </> : null}
                    {color.sourceType === "online" ? <>
                        <button onClick={async () => {
                            openModal(props => <SaveColorwayAsModal
                                colorwayObject={{
                                    id: color.name,
                                    source: color.source,
                                    sourceType: color.sourceType,
                                    colors: {
                                        accent: colorToHex(color.accent) || "5865f2",
                                        primary: colorToHex(color.primary) || "313338",
                                        secondary: colorToHex(color.secondary) || "2b2d31",
                                        tertiary: colorToHex(color.tertiary) || "1e1f22"
                                    }
                                }}
                                modalProps={props}
                                loadUI={async () => {
                                    setContext("customColorways", await DataStore.get("customColorways") as ReturnType<typeof setContext>);
                                    setCustomColorwayData((await DataStore.get("customColorways")).map((colorSrc: { name: string, colorways: Colorway[], id?: string; }) => ({ type: "offline", source: colorSrc.name, colorways: colorSrc.colorways })));
                                }}
                            />);
                        }} className="colorwaysContextMenuItm">
                            Edit Colorway Locally
                            <PencilIcon width={16} height={16} style={{
                                marginLeft: "8px"
                            }} />
                        </button>
                    </> : null}
                </>}>
                    {({ onContextMenu }) => <div
                        className="discordColorway"
                        role="button"
                        id={"colorway-" + color.name}
                        onContextMenu={onContextMenu}
                        aria-checked={activeColorwayObject.id === color.name && activeColorwayObject.source === color.source}
                        onClick={async () => {
                            if (settings.selectorType === "normal") {
                                if (activeColorwayObject.id === color.name && activeColorwayObject.source === color.source) {
                                    if (isManager) {
                                        sendColorway(nullColorwayObj);
                                    } else {
                                        setContext("activeColorwayObject", nullColorwayObj);
                                        setActiveColorwayObject(nullColorwayObj);
                                        ColorwayCSS.remove();
                                    }
                                } else {
                                    const newObj: ColorwayObject = {
                                        id: color.name,
                                        sourceType: color.sourceType,
                                        source: color.source,
                                        colors: {}
                                    } as ColorwayObject;
                                    color.accent ? (newObj.colors.accent = "#" + colorToHex(color.accent)) : void 0;
                                    color.primary ? (newObj.colors.primary = "#" + colorToHex(color.primary)) : void 0;
                                    color.secondary ? (newObj.colors.secondary = "#" + colorToHex(color.secondary)) : void 0;
                                    color.tertiary ? (newObj.colors.tertiary = "#" + colorToHex(color.tertiary)) : void 0;

                                    if (usageMetrics.find(metric => compareColorwayObjects(metric, newObj))) {
                                        const foundMetric = usageMetrics.find(metric => compareColorwayObjects(metric, newObj));
                                        const newMetrics = [...usageMetrics.filter(metric => !compareColorwayObjects(metric, newObj)), { ...foundMetric, uses: (foundMetric?.uses || 0) + 1 }];
                                        setContext("colorwayUsageMetrics", newMetrics as (ColorwayObject & { uses: number; })[]);
                                        setUsageMetrics(newMetrics as (ColorwayObject & { uses: number; })[]);
                                    } else {
                                        const newMetrics = [...usageMetrics, { ...newObj, uses: 1 }];
                                        setContext("colorwayUsageMetrics", newMetrics as (ColorwayObject & { uses: number; })[]);
                                        setUsageMetrics(newMetrics);
                                    }

                                    if (color.linearGradient) newObj.linearGradient = color.linearGradient;
                                    if (isManager) sendColorway(newObj);
                                    else {
                                        setActiveColorwayObject(newObj);
                                        setContext("activeColorwayObject", newObj);

                                        DataStore.get("colorwaysPreset").then((colorwaysPreset: string) => {
                                            if (colorwaysPreset === "default") {
                                                ColorwayCSS.set(generateCss(
                                                    newObj.colors,
                                                    true,
                                                    true,
                                                    undefined,
                                                    newObj.id as string
                                                ));
                                            } else {
                                                if (gradientPresetIds.includes(colorwaysPreset)) {
                                                    const css = Object.keys(newObj).includes("linearGradient")
                                                        ? gradientBase(newObj.colors, true) + `:root:root {--custom-theme-background: linear-gradient(${newObj.linearGradient})}`
                                                        : (getPreset(newObj.colors)[colorwaysPreset].preset as { full: string; }).full;
                                                    ColorwayCSS.set(css);
                                                } else {
                                                    ColorwayCSS.set(getPreset(newObj.colors)[colorwaysPreset].preset as string);
                                                }
                                            }
                                        });
                                    }
                                }
                            }
                            if (settings.selectorType === "multiple-selection") {
                                if (selectedColorways.includes(color)) {
                                    setSelectedColorways(selectedColorways.filter(c => c !== color));
                                } else {
                                    setSelectedColorways([...selectedColorways, color]);
                                }
                            }
                        }}
                    >
                        <div className="discordColorwayPreviewColorContainer">
                            {!color.isGradient ? Object.values({
                                accent: color.accent,
                                primary: color.primary,
                                secondary: color.secondary,
                                tertiary: color.tertiary
                            }).map(colorStr => <div
                                className="discordColorwayPreviewColor"
                                style={{
                                    backgroundColor: `#${colorToHex(colorStr)}`,
                                }}
                            />) : <div
                                className="discordColorwayPreviewColor"
                                style={{
                                    background: `linear-gradient(${color.linearGradient})`,
                                }}
                            />}
                        </div>
                        <div className="colorwayLabelContainer">
                            <span className="colorwayLabel">{color.name}</span>
                            <span className="colorwayLabel colorwayLabelSubnote colorwaysNote">by {color.author} • from {color.source}</span>
                        </div>
                    </div>}
                </RightClickContextMenu>)
            }
            {(!filters.flatMap(f => f.sources.map(s => s.colorways)).flat().length) ? <div
                className="discordColorway"
                role="button"
                id={"colorway-nocolorways"}
            >
                <WirelessIcon width={30} height={30} style={{ color: "var(--interactive-active)" }} />
                <div className="colorwayLabelContainer">
                    <span className="colorwayLabel">It's quite emty in here.</span>
                    <span className="colorwayLabel colorwayLabelSubnote colorwaysNote">Try searching for something else, or add another source</span>
                </div>
            </div> : null}
        </div>
    </>;
}
