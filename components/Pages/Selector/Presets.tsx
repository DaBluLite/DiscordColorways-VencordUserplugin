/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { useState } from "../../..";
import { Hooks } from "../../../api";
import { openModal } from "../../../api/Modals";
import { Preset, PresetObject, SortOptions, SourceActions, SourceObject } from "../../../types";
import ColorwayItem from "../../Colorway";
import ComboTextBox from "../../ComboTextBox";
import { DeleteIcon, PencilIcon, PlusIcon, WirelessIcon } from "../../Icons";
import Modal from "../../Modal";
import SavePresetAsModal from "../../Modals/SavePresetAsModal";
import Radio from "../../Radio";
import ReloadButton from "../../ReloadButton";
import Spinner from "../../Spinner";
import StaticOptionsMenu from "../../StaticOptionsMenu";
import { get_updateCustomSource } from "./";

export default function Presets() {
    const [colorwayData] = Hooks.useContextualState("colorwayData", false);
    const [customColorwayData, setCustomColorwayData] = Hooks.useContextualState("customColorways");
    const [activePresetObject, setActivePresetObject] = Hooks.useContextualState("activePresetObject");
    const [colorwaysDiscordPreset] = Hooks.useContextualState("colorwaysDiscordPreset");
    const [themePresets] = Hooks.useContextualState("themePresets");
    const [searchValue, setSearchValue] = useState<string>("");
    const [sortBy, setSortBy] = useState<SortOptions>(SortOptions.NAME_AZ);
    const [showSpinner, setShowSpinner] = useState<boolean>(false);
    const [visibleSources, setVisibleSources] = useState<string>("all");
    const [layout, setLayout] = useState<"normal" | "compact">("normal");

    const layouts = [{ name: "Normal", id: "normal" }, { name: "Compact", id: "compact" }];

    const updateCustomSource = get_updateCustomSource(customColorwayData, setCustomColorwayData);

    const filters = [
        {
            name: "All",
            id: "all",
            sources: [
                ...colorwayData.filter(s => (s.presets || []).length).map(s => ({ source: s.source, presets: s.presets, type: "online" })),
                ...customColorwayData.filter(s => (s.presets || []).length).map(source => ({ source: source.name, presets: source.presets, type: "offline" })),
                ...themePresets.map(theme => ({ source: theme.source, type: "theme", presets: [theme] })),
                { source: "Built-In", type: "builtin", presets: [colorwaysDiscordPreset] }
            ]
        },
        {
            name: colorwaysDiscordPreset.source,
            id: colorwaysDiscordPreset.sourceType,
            sources: [{ source: colorwaysDiscordPreset.source, type: colorwaysDiscordPreset.sourceType, presets: [colorwaysDiscordPreset] }]
        },
        ...colorwayData.map(source => ({
            name: source.source,
            id: source.source.toLowerCase().replaceAll(" ", "-"),
            sources: [{ source: source.source, presets: (source.presets || []) as Preset[], type: "online" }]
        })),
        ...customColorwayData.map(source => ({
            name: source.name,
            id: source.name.toLowerCase().replaceAll(" ", "-"),
            sources: [{ source: source.name, presets: (source.presets || []) as Preset[], type: "offline" }]
        })),
        {
            name: "Themes",
            id: "themes",
            sources: themePresets.map(preset => ({ source: preset.name, presets: [preset], type: "theme" }))
        }
    ];

    return <>
        <ComboTextBox
            placeholder="Search for Presets..."
            value={searchValue}
            onInput={setSearchValue}
        >
            <Spinner className={`dc-selector-spinner${!showSpinner ? " dc-selector-spinner-hidden" : ""}`} />
            <ReloadButton setShowSpinner={setShowSpinner} />
            <button
                className="dc-button dc-button-primary"
                onClick={() => openModal(props => <SavePresetAsModal modalProps={props} />)}
            >
                <PlusIcon width={14} height={14} style={{ boxSizing: "content-box" }} />
                Add...
            </button>
            <StaticOptionsMenu
                xPos="right"
                menu={<>
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
                            default:
                                return "Name (A-Z)";
                        }
                    })()}
                </button>}
            </StaticOptionsMenu>
            <StaticOptionsMenu
                xPos="right"
                menu={<>
                    {filters.filter(f => f.sources.filter(s => (s.presets || []).length).length).map(({ name, id }, i: number) => {
                        return <button onClick={() => setVisibleSources(id)} className="dc-contextmenu-item" key={i}>
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
        </ComboTextBox>
        <div style={{ maxHeight: "unset" }} className="dc-selector" data-layout={layout}>
            {(filters
                .find(filter => filter.id === visibleSources) as { name: string, id: string, sources: SourceObject[]; } || { name: "null", id: "null", sources: [] }).sources
                .map(({ presets, source, type }) => (presets || []).map((preset: Preset) => ({ ...preset, sourceType: type, source: source })))
                .flat()
                .sort((a, b) => {
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
                        default:
                            return a.name.localeCompare(b.name);
                    }
                })
                .filter(({ name }) => name.toLowerCase().includes(searchValue.toLowerCase()))
                .map((preset: Preset, i: number) => <ColorwayItem
                    key={i}
                    id={"preset-" + preset.name}
                    menu={<>
                        {preset.sourceType === "offline" ? <>
                            <button onClick={async () => {
                                openModal(props => <SavePresetAsModal
                                    store={preset.source as string}
                                    presetObject={{
                                        id: preset.name,
                                        source: preset.source,
                                        sourceType: preset.sourceType,
                                        css: preset.css,
                                        conditions: preset.conditions || []
                                    }}
                                    modalProps={props}
                                />);
                            }} className="dc-contextmenu-item">
                                Edit Preset
                                <PencilIcon width={16} height={16} style={{
                                    marginLeft: "8px"
                                }} />
                            </button>
                            <button onClick={() => {
                                openModal(props => <Modal
                                    modalProps={props}
                                    title="Delete Preset"
                                    onFinish={async ({ closeModal }) => {
                                        if (activePresetObject.id === preset.name) {
                                            setActivePresetObject({ id: colorwaysDiscordPreset.name, source: colorwaysDiscordPreset.source, sourceType: colorwaysDiscordPreset.sourceType, css: colorwaysDiscordPreset.css, conditions: colorwaysDiscordPreset.conditions || [] });
                                        }
                                        updateCustomSource({ type: SourceActions.RemovePreset, preset, source: preset.source as string });
                                        closeModal();
                                    }}
                                    confirmMsg="Delete"
                                    type="danger"
                                >
                                    Are you sure you want to delete this colorway? This cannot be undone!
                                </Modal>);
                            }} className="dc-contextmenu-item dc-contextmenu-item-danger">
                                Delete Preset...
                                <DeleteIcon width={16} height={16} style={{
                                    marginLeft: "8px"
                                }} />
                            </button>
                        </> : null}
                        {preset.sourceType === "online" ? <>
                            <button onClick={async () => {
                                openModal(props => <SavePresetAsModal
                                    presetObject={{
                                        id: preset.name,
                                        source: preset.source,
                                        sourceType: preset.sourceType,
                                        css: preset.css,
                                        conditions: preset.conditions || []
                                    }}
                                    modalProps={props}
                                />);
                            }} className="dc-contextmenu-item">
                                Edit Preset Locally
                                <PencilIcon width={16} height={16} style={{
                                    marginLeft: "8px"
                                }} />
                            </button>
                        </> : null}
                    </>}
                    aria-checked={activePresetObject.id === preset.name && activePresetObject.source === preset.source}
                    descriptions={[`by ${preset.author}`, `from ${preset.source}`]}
                    text={preset.name}
                    onClick={async () => {
                        const newObj: PresetObject = {
                            id: preset.name,
                            sourceType: preset.sourceType,
                            source: preset.source,
                            conditions: preset.conditions || [],
                            css: preset.css
                        };
                        setActivePresetObject(newObj);
                    }}
                />)}
            {(!filters.flatMap(f => f.sources.map(s => s.presets)).flat().length) ? <div
                className="dc-colorway"
                role="button"
                id="preset-nopresets"
            >
                <WirelessIcon width={30} height={30} style={{ color: "var(--interactive-active)" }} />
                <div className="dc-label-wrapper">
                    <span className="dc-label">It's quite emty in here.</span>
                    <span className="dc-label dc-subnote dc-note">Try searching for something else, or add another source</span>
                </div>
            </div> : null}
        </div>
    </>;
}
