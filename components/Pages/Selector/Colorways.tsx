/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Toasts, useState } from "../../..";
import { Dispatcher, Hooks } from "../../../api";
import { useTimedState } from "../../../api/Hooks";
import { openModal } from "../../../api/Modals";
import { Clipboard, compareColorwayObjects } from "../../../api/Utils";
import { colorToHex, stringToHex } from "../../../api/Utils/Colors";
import { saveFile } from "../../../api/Utils/Fs";
import { nullColorwayObj } from "../../../constants";
import { generateCss, getAutoPresets } from "../../../css";
import { Colorway, ColorwayObject, SortOptions, SourceActions, SourceObject } from "../../../types";
import ColorwayItem from "../../Colorway";
import ComboSearchBox from "../../ComboSearchBox";
import { DeleteIcon, DownloadIcon, IDIcon, PencilIcon, PlusIcon } from "../../Icons";
import Modal from "../../Modal";
import SaveColorwayAsModal from "../../Modals/SaveColorwayAsModal";
import Radio from "../../Radio";
import ReloadButton from "../../ReloadButton";
import Spinner from "../../Spinner";
import StaticOptionsMenu from "../../StaticOptionsMenu";
import { get_updateCustomSource } from "./";

export default function Colorways() {
    const [colorwayData] = Hooks.useContextualState("colorwayData", false);
    const [customColorwayData, setCustomColorwayData] = Hooks.useContextualState("customColorways");
    const [activeColorwayObject, setActiveColorwayObject] = Hooks.useContextualState("activeColorwayObject");
    const [wsConnected] = Hooks.useContextualState("isConnected");
    const [isManager] = Hooks.useContextualState("hasManagerRole");
    const [usageMetrics, setUsageMetrics] = Hooks.useContextualState("colorwayUsageMetrics");
    const [activeAutoPreset] = Hooks.useContextualState("activeAutoPreset");
    const [invalidColorwayClicked, setInvalidColorwayClicked] = useTimedState<string>("", 2000);
    const [searchValue, setSearchValue] = useState<string>("");
    const [sortBy, setSortBy] = useState<SortOptions>(SortOptions.MOST_USED);
    const [showSpinner, setShowSpinner] = useState<boolean>(false);
    const [visibleSources, setVisibleSources] = useState<string>("all");
    const [layout, setLayout] = useState<"normal" | "compact">("normal");

    const updateCustomSource = get_updateCustomSource(customColorwayData, setCustomColorwayData);

    const layouts = [{ name: "Normal", id: "normal" }, { name: "Compact", id: "compact" }];

    const filters = [
        {
            name: "All",
            id: "all",
            sources: [...colorwayData, ...customColorwayData.map(source => ({ source: source.name, colorways: source.colorways, type: "offline" }))]
        },
        ...colorwayData.map(source => ({
            name: source.source,
            id: source.source.toLowerCase().replaceAll(" ", "-"),
            sources: [source]
        })),
        ...customColorwayData.map(source => ({
            name: source.name,
            id: source.name.toLowerCase().replaceAll(" ", "-"),
            sources: [{ source: source.name, colorways: source.colorways, type: "offline" }]
        }))
    ];

    return <>
        <ComboSearchBox placeholder="Search for Colorways..." >
            <Spinner className={`dc-selector-spinner${!showSpinner ? " dc-selector-spinner-hidden" : ""}`} />
            <ReloadButton setShowSpinner={setShowSpinner} />
            <button
                className="dc-button dc-button-primary"
                onClick={() => openModal(props => <SaveColorwayAsModal modalProps={props} />)}
            >
                <PlusIcon width={14} height={14} style={{ boxSizing: "content-box" }} />
                Add...
            </button>
            <StaticOptionsMenu
                xPos="right"
                menu={<>
                    <button onClick={() => setSortBy(9)} className="dc-contextmenu-item">
                        Most Used
                        <Radio checked={sortBy === 9} style={{
                            marginLeft: "8px"
                        }} />
                    </button>
                    <button onClick={() => setSortBy(10)} className="dc-contextmenu-item">
                        Least Used
                        <Radio checked={sortBy === 10} style={{
                            marginLeft: "8px"
                        }} />
                    </button>
                    <button onClick={() => setSortBy(1)} className="dc-contextmenu-item">
                        Name (A-Z)
                        <Radio checked={sortBy === 1} style={{
                            marginLeft: "8px"
                        }} />
                    </button>
                    <button onClick={() => setSortBy(2)} className="dc-contextmenu-item">
                        Name (Z-A)
                        <Radio checked={sortBy === 2} style={{
                            marginLeft: "8px"
                        }} />
                    </button>
                    <button onClick={() => setSortBy(3)} className="dc-contextmenu-item">
                        Source (A-Z)
                        <Radio checked={sortBy === 3} style={{
                            marginLeft: "8px"
                        }} />
                    </button>
                    <button onClick={() => setSortBy(4)} className="dc-contextmenu-item">
                        Source (Z-A)
                        <Radio checked={sortBy === 4} style={{
                            marginLeft: "8px"
                        }} />
                    </button>
                    <button onClick={() => setSortBy(5)} className="dc-contextmenu-item">
                        Source Type (Online First)
                        <Radio checked={sortBy === 5} style={{
                            marginLeft: "8px"
                        }} />
                    </button>
                    <button onClick={() => setSortBy(6)} className="dc-contextmenu-item">
                        Source Type (Offline First)
                        <Radio checked={sortBy === 6} style={{
                            marginLeft: "8px"
                        }} />
                    </button>
                    <button onClick={() => setSortBy(7)} className="dc-contextmenu-item">
                        Color Count (Ascending)
                        <Radio checked={sortBy === 7} style={{
                            marginLeft: "8px"
                        }} />
                    </button>
                    <button onClick={() => setSortBy(8)} className="dc-contextmenu-item">
                        Color Count (Descending)
                        <Radio checked={sortBy === 8} style={{
                            marginLeft: "8px"
                        }} />
                    </button>
                </>}>
                {({ onClick }) => <button
                    onClick={onClick}
                    className="dc-button dc-button-primary"
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
                xPos="right"
                menu={<>
                    {filters.map(({ name, id }, i: number) => {
                        return <button key={i} onClick={() => setVisibleSources(id)} className="dc-contextmenu-item">
                            {name}
                            <Radio checked={visibleSources === id} style={{
                                marginLeft: "8px"
                            }} />
                        </button>;
                    })}
                </>}>
                {({ onClick }) => <button
                    onClick={onClick}
                    className="dc-button dc-button-primary"
                >
                    Source: {(filters.find(filter => filter.id === visibleSources) as { name: string, id: string, sources: SourceObject[]; }).name}
                </button>}
            </StaticOptionsMenu>
            <button
                className="dc-button dc-button-primary"
                onClick={() => {
                    if (layout === "normal") return setLayout("compact");
                    else return setLayout("normal");
                }}
            >
                Layout: {layouts.find(l => l.id === layout)?.name}
            </button>
        </ComboSearchBox>
        <div style={{ maxHeight: "unset" }} className="dc-selector" data-layout={layout}>
            {(activeColorwayObject.sourceType === "temporary") && <div
                className="dc-colorway"
                id="colorway-Temporary"
                role="button"
                aria-checked={activeColorwayObject.sourceType === "temporary"}
                aria-invalid={invalidColorwayClicked === "colorway-Temporary"}
                onClick={async () => {
                    if (wsConnected) {
                        if (!isManager) {
                            setInvalidColorwayClicked("colorway-Temporary");
                        } else {
                            setActiveColorwayObject(nullColorwayObj);
                        }
                    } else {
                        setActiveColorwayObject(nullColorwayObj);
                    }
                }}
            >
                <div className="dc-color-swatch">
                    <div
                        className="dc-color-swatch-part"
                        style={{ backgroundColor: "#" + activeColorwayObject.colors.accent }} />
                    <div
                        className="dc-color-swatch-part"
                        style={{ backgroundColor: "#" + activeColorwayObject.colors.primary }} />
                    <div
                        className="dc-color-swatch-part"
                        style={{ backgroundColor: "#" + activeColorwayObject.colors.secondary }} />
                    <div
                        className="dc-color-swatch-part"
                        style={{ backgroundColor: "#" + activeColorwayObject.colors.tertiary }} />
                </div>
                <div className="dc-label-wrapper">
                    <span className="dc-label">{activeColorwayObject.id}</span>
                    <span className="dc-label dc-subnote dc-note">Temporary Colorway</span>
                </div>
                <button
                    className="dc-button dc-button-secondary"
                    onClick={async e => {
                        e.stopPropagation();
                        openModal(props => <SaveColorwayAsModal
                            modalProps={props}
                            colorwayObject={activeColorwayObject}
                        />);
                    }}
                >
                    <PlusIcon width={20} height={20} />
                </button>
            </div>}
            {getComputedStyle(document.body).getPropertyValue("--os-accent-color") && "auto".includes(searchValue.toLowerCase()) ? <ColorwayItem
                id="colorway-Auto"
                text="Auto Colorway"
                descriptions={[`Active preset: ${Object.values(getAutoPresets()).find(pr => pr.id === activeAutoPreset)?.name}`]}
                colors={[
                    getAutoPresets(colorToHex(getComputedStyle(document.body).getPropertyValue("--os-accent-color")).slice(0, 6))[activeAutoPreset].colors.accent,
                    getAutoPresets(colorToHex(getComputedStyle(document.body).getPropertyValue("--os-accent-color")).slice(0, 6))[activeAutoPreset].colors.primary,
                    getAutoPresets(colorToHex(getComputedStyle(document.body).getPropertyValue("--os-accent-color")).slice(0, 6))[activeAutoPreset].colors.secondary,
                    getAutoPresets(colorToHex(getComputedStyle(document.body).getPropertyValue("--os-accent-color")).slice(0, 6))[activeAutoPreset].colors.tertiary
                ]}
                aria-checked={activeColorwayObject.id === "Auto" && activeColorwayObject.sourceType === "auto"}
                aria-invalid={invalidColorwayClicked === "colorway-Auto"}
                onClick={async () => {
                    if (activeColorwayObject.id === "Auto" && activeColorwayObject.sourceType === "auto") {
                        setActiveColorwayObject(nullColorwayObj);
                    } else {
                        const { colors } = getAutoPresets(colorToHex(getComputedStyle(document.body).getPropertyValue("--os-accent-color")).slice(0, 6))[activeAutoPreset];
                        const newObj: ColorwayObject = {
                            id: "Auto",
                            sourceType: "auto",
                            source: null,
                            colors: colors
                        };
                        if (!wsConnected) {
                            setActiveColorwayObject(newObj);
                        } else {
                            if (!isManager) {
                                setInvalidColorwayClicked("colorway-Auto");
                            } else {
                                Dispatcher.dispatch("COLORWAYS_SEND_COLORWAY", {
                                    active: newObj
                                });
                            }
                        }
                    }
                }}
            /> : <></>}
            {(filters
                .find(filter => filter.id === visibleSources) as { name: string, id: string, sources: SourceObject[]; } || { name: "null", id: "null", sources: [] }).sources
                .map(({ colorways, source, type }) => (colorways || []).map((colorway: Colorway) => ({ ...colorway, sourceType: type, source: source, preset: colorway.preset || (colorway.isGradient ? "Gradient" : "Default") })))
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
                    const aMetric = usageMetrics.filter(metric => compareColorwayObjects(metric, objA))[0] || { ...objA, uses: 0 };
                    const bMetric = usageMetrics.filter(metric => compareColorwayObjects(metric, objB))[0] || { ...objB, uses: 0 };
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
                .map((color: Colorway, i: number) => <ColorwayItem
                    key={i}
                    id={"colorway-" + color.name}
                    aria-invalid={invalidColorwayClicked === "colorway-" + color.name}
                    aria-checked={activeColorwayObject.id === color.name && activeColorwayObject.source === color.source}
                    onClick={async () => {
                        if (activeColorwayObject.id === color.name && activeColorwayObject.source === color.source) {
                            setActiveColorwayObject(nullColorwayObj);
                        } else {
                            const newObj: ColorwayObject = {
                                id: color.name,
                                sourceType: color.sourceType,
                                source: color.source,
                                colors: {} as ColorwayObject["colors"]
                            };
                            color.accent ? (newObj.colors.accent = "#" + colorToHex(color.accent)) : void 0;
                            color.primary ? (newObj.colors.primary = "#" + colorToHex(color.primary)) : void 0;
                            color.secondary ? (newObj.colors.secondary = "#" + colorToHex(color.secondary)) : void 0;
                            color.tertiary ? (newObj.colors.tertiary = "#" + colorToHex(color.tertiary)) : void 0;
                            color.linearGradient ? (newObj.linearGradient = color.linearGradient) : void 0;

                            if (!wsConnected) {
                                setActiveColorwayObject(newObj);

                                if (usageMetrics.filter(metric => compareColorwayObjects(metric, newObj)).length) {
                                    setUsageMetrics(m => m.map(metric => {
                                        if (compareColorwayObjects(metric, newObj)) {
                                            return { ...metric, uses: metric.uses + 1 };
                                        }
                                        return metric;
                                    }));
                                } else {
                                    setUsageMetrics(m => [...m, { ...newObj, uses: 1 }]);
                                }
                            } else {
                                if (!isManager) {
                                    setInvalidColorwayClicked(`colorway-${color.name}`);
                                } else {
                                    Dispatcher.dispatch("COLORWAYS_SEND_COLORWAY", {
                                        active: newObj
                                    });
                                }
                            }
                        }
                    }}
                    menu={<>
                        <div className="dc-contextmenu-colors">
                            {(color.colors || [
                                "accent",
                                "primary",
                                "secondary",
                                "tertiary",
                            ]).map((c: string, i: number) => <div key={i} className="dc-contextmenu-color" style={{ backgroundColor: "#" + colorToHex(color[c]) }} onClick={() => {
                                Clipboard.copy("#" + colorToHex(color[c]));
                                Toasts.show({
                                    message: "Copied Color Successfully",
                                    type: "success",
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
                                type: "success",
                                id: "copy-colorway-id-notify",
                            });
                        }} className="dc-contextmenu-item">
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
                            saveFile(new File([generateCss(
                                newObj.colors,
                                true,
                                true,
                                undefined,
                                newObj.id as string
                            )], `${color.name.replaceAll(" ", "-").toLowerCase()}.theme.css`, { type: "text/plain" }));
                        }} className="dc-contextmenu-item">
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
                                />);
                            }} className="dc-contextmenu-item">
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
                                            setActiveColorwayObject(nullColorwayObj);
                                        }
                                        updateCustomSource({ type: SourceActions.RemoveColorway, colorway: color, source: color.source as string });
                                        closeModal();
                                    }}
                                    confirmMsg="Delete"
                                    type="danger"
                                >
                                    Are you sure you want to delete this colorway? This cannot be undone!
                                </Modal>);
                            }} className="dc-contextmenu-item dc-contextmenu-item-danger">
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
                                />);
                            }} className="dc-contextmenu-item">
                                Edit Colorway Locally
                                <PencilIcon width={16} height={16} style={{
                                    marginLeft: "8px"
                                }} />
                            </button>
                        </> : null}
                    </>}
                    colors={Object.values({
                        accent: color.accent,
                        primary: color.primary,
                        secondary: color.secondary,
                        tertiary: color.tertiary
                    })}
                    text={color.name}
                    descriptions={[`by ${color.author}`, `from ${color.source}`]}
                />)
            }
            {(!filters.flatMap(f => f.sources.map(s => s.colorways)).flat().length) ? <ColorwayItem text="It's quite emty in here." descriptions={["Try searching for something else, or add another source"]} id="colorway-nocolorways" /> : null}
        </div>
    </>;
}
