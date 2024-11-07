/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { MouseEvent, MouseEventHandler } from "react";

import { DataStore, openModal, useEffect, useState } from "..";
import { ColorwayCSS } from "../colorwaysAPI";
import { generateCss, getAutoPresets, getPreset, gradientBase, gradientPresetIds } from "../css";
import { ColorwayObject, ModalProps, SortOptions } from "../types";
import { hasManagerRole, sendColorway, wsOpen } from "../wsClient";
import AutoColorwaySelector from "./Modals/AutoColorwaySelector";
import { CaretIcon, CogIcon } from "./Icons";
import Radio from "./Radio";

export default function ({ sort, onSortChange, source, sources, onSourceChange, onAutoPreset, onLayout, layout }: { sort: SortOptions, onSortChange: (newSort: SortOptions) => void; source: { name: string, id: string; }, sources: { name: string, id: string; }[], onSourceChange: (sourceId: string) => void; onAutoPreset: (autoPresetId: string) => void, onLayout: (layout: "normal" | "compact") => void, layout: "normal" | "compact"; }) {
    const [pos, setPos] = useState({ x: 0, y: 0 });
    const [subPos, setSubPos] = useState({ x: 0, y: 0 });
    const [showMenu, setShowMenu] = useState(false);
    const [showSort, setShowSort] = useState(false);
    const [showSources, setShowSources] = useState(false);
    const [showPresets, setShowPresets] = useState(false);
    const [showAutoPresets, setShowAutoPresets] = useState(false);
    const [showLayouts, setShowLayouts] = useState(false);
    const [preset, setPreset] = useState("default");
    const [current, setCurrent] = useState(source);
    const [autoColorwayId, setAutoColorwayId] = useState("");

    const layouts = [{ name: "Normal", id: "normal" }, { name: "Compact", id: "compact" }];

    function rightClickContextMenu(e: MouseEvent<HTMLButtonElement, MouseEvent>) {
        e.stopPropagation();
        window.dispatchEvent(new Event("click"));
        setShowMenu(!showMenu);
        setPos({
            x: e.currentTarget.getBoundingClientRect().x,
            y: e.currentTarget.getBoundingClientRect().y + e.currentTarget.offsetHeight + 8
        });

        return;
    }

    function onPageClick(this: Window, e: globalThis.MouseEvent) {
        setShowMenu(false);
    }

    useEffect(() => {
        (async () => {
            setPreset(await DataStore.get("colorwaysPreset") as string);
            setAutoColorwayId(await DataStore.get("activeAutoPreset") as string);
        })();
        window.addEventListener("click", onPageClick);
        return () => {
            window.removeEventListener("click", onPageClick);
        };
    }, []);

    function onSortChange_internal(newSort: SortOptions) {
        onSortChange(newSort);
        setShowMenu(false);
    }

    function onSourceChange_internal(newSort: { name: string, id: string; }) {
        onSourceChange(newSort.id);
        setCurrent(newSort);
        setShowMenu(false);
    }

    function onLayout_intrnl(layout: "normal" | "compact") {
        onLayout(layout);
        setShowMenu(false);
    }

    function onPresetChange(value: string) {
        setPreset(value);
        DataStore.set("colorwaysPreset", value);

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
        setShowMenu(false);
    }

    function onAutoPresetChange(activeAutoPreset: string) {
        onAutoPreset(activeAutoPreset);
        setShowMenu(false);
    }

    return <>
        {showMenu ? <nav className="colorwaysContextMenu" style={{
            position: "fixed",
            top: `${pos.y}px`,
            left: `${pos.x}px`
        }} onClick={e => e.stopPropagation()}>
            <button className="colorwaysContextMenuItm" onMouseEnter={e => {
                setShowSort(true);
                setSubPos({
                    x: e.currentTarget.getBoundingClientRect().x + e.currentTarget.offsetWidth,
                    y: e.currentTarget.getBoundingClientRect().y
                });
            }} onMouseLeave={e => {
                const elem = document.elementFromPoint(e.clientX, e.clientY);
                if (elem !== e.currentTarget) {
                    setShowSort(false);
                }
            }}>
                Sort by: {(() => {
                    switch (sort) {
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
                <div className="colorwaysCaretContainer">
                    <CaretIcon width={16} height={16} />
                </div>
                {showSort ? <div className="colorwaysSubmenuWrapper" style={{
                    position: "fixed",
                    top: `${subPos.y}px`,
                    left: `${subPos.x}px`
                }}>
                    <nav className="colorwaysContextMenu">
                        <button onClick={() => onSortChange_internal(9)} className="colorwaysContextMenuItm">
                            Most Used
                            <Radio checked={sort === 9} style={{
                                marginLeft: "8px"
                            }} />
                        </button>
                        <button onClick={() => onSortChange_internal(10)} className="colorwaysContextMenuItm">
                            Least Used
                            <Radio checked={sort === 10} style={{
                                marginLeft: "8px"
                            }} />
                        </button>
                        <button onClick={() => onSortChange_internal(1)} className="colorwaysContextMenuItm">
                            Name (A-Z)
                            <Radio checked={sort === 1} style={{
                                marginLeft: "8px"
                            }} />
                        </button>
                        <button onClick={() => onSortChange_internal(2)} className="colorwaysContextMenuItm">
                            Name (Z-A)
                            <Radio checked={sort === 2} style={{
                                marginLeft: "8px"
                            }} />
                        </button>
                        <button onClick={() => onSortChange_internal(3)} className="colorwaysContextMenuItm">
                            Source (A-Z)
                            <Radio checked={sort === 3} style={{
                                marginLeft: "8px"
                            }} />
                        </button>
                        <button onClick={() => onSortChange_internal(4)} className="colorwaysContextMenuItm">
                            Source (Z-A)
                            <Radio checked={sort === 4} style={{
                                marginLeft: "8px"
                            }} />
                        </button>
                        <button onClick={() => onSortChange_internal(5)} className="colorwaysContextMenuItm">
                            Source Type (Online First)
                            <Radio checked={sort === 5} style={{
                                marginLeft: "8px"
                            }} />
                        </button>
                        <button onClick={() => onSortChange_internal(6)} className="colorwaysContextMenuItm">
                            Source Type (Offline First)
                            <Radio checked={sort === 6} style={{
                                marginLeft: "8px"
                            }} />
                        </button>
                        <button onClick={() => onSortChange_internal(7)} className="colorwaysContextMenuItm">
                            Color Count (Ascending)
                            <Radio checked={sort === 7} style={{
                                marginLeft: "8px"
                            }} />
                        </button>
                        <button onClick={() => onSortChange_internal(8)} className="colorwaysContextMenuItm">
                            Color Count (Descending)
                            <Radio checked={sort === 8} style={{
                                marginLeft: "8px"
                            }} />
                        </button>
                    </nav>
                </div> : <></>}
            </button>
            <button className="colorwaysContextMenuItm" onMouseEnter={e => {
                setShowPresets(true);
                setSubPos({
                    x: e.currentTarget.getBoundingClientRect().x + e.currentTarget.offsetWidth,
                    y: e.currentTarget.getBoundingClientRect().y
                });
            }} onMouseLeave={e => {
                const elem = document.elementFromPoint(e.clientX, e.clientY);
                if (elem !== e.currentTarget) {
                    setShowPresets(false);
                }
            }}>
                Preset: {Object.values(getPreset({})).find(pr => pr.id === preset)?.name}
                <div className="colorwaysCaretContainer">
                    <CaretIcon width={16} height={16} />
                </div>
                {showPresets ? <div className="colorwaysSubmenuWrapper" style={{
                    position: "fixed",
                    top: `${subPos.y}px`,
                    left: `${subPos.x}px`
                }}>
                    <nav className="colorwaysContextMenu">
                        {Object.values(getPreset({})).map(({ name, id }) => {
                            return <button onClick={() => onPresetChange(id)} className="colorwaysContextMenuItm">
                                {name}
                                <Radio checked={preset === id} style={{
                                    marginLeft: "8px"
                                }} />
                            </button>;
                        })}
                    </nav>
                </div> : null}
            </button>
            <button
                className="colorwaysContextMenuItm"
                onMouseEnter={e => {
                    setShowAutoPresets(true);
                    setSubPos({
                        x: e.currentTarget.getBoundingClientRect().x + e.currentTarget.offsetWidth,
                        y: e.currentTarget.getBoundingClientRect().y
                    });
                }} onMouseLeave={e => {
                    const elem = document.elementFromPoint(e.clientX, e.clientY);
                    if (elem !== e.currentTarget) {
                        setShowAutoPresets(false);
                    }
                }}
                onClick={() => {
                    openModal((props: ModalProps) => <AutoColorwaySelector autoColorwayId={autoColorwayId} modalProps={props} onChange={autoPresetId => {
                        onAutoPresetChange(autoPresetId);
                    }} />);
                }}
            >
                Auto Colorway Preset: {Object.values(getAutoPresets()).find(pr => pr.id === autoColorwayId)?.name}
                <div className="colorwaysCaretContainer">
                    <CaretIcon width={16} height={16} />
                </div>
                {showAutoPresets ? <div className="colorwaysSubmenuWrapper" style={{
                    position: "fixed",
                    top: `${subPos.y}px`,
                    left: `${subPos.x}px`
                }}>
                    <nav className="colorwaysContextMenu">
                        {Object.values(getAutoPresets()).map(({ name, id }) => {
                            return <button onClick={() => onAutoPresetChange(id)} className="colorwaysContextMenuItm">
                                {name}
                                <Radio checked={autoColorwayId === id} style={{
                                    marginLeft: "8px"
                                }} />
                            </button>;
                        })}
                    </nav>
                </div> : null}
            </button>
            <button className="colorwaysContextMenuItm" onMouseEnter={e => {
                setShowSources(true);
                setSubPos({
                    x: e.currentTarget.getBoundingClientRect().x + e.currentTarget.offsetWidth,
                    y: e.currentTarget.getBoundingClientRect().y
                });
            }} onMouseLeave={e => {
                const elem = document.elementFromPoint(e.clientX, e.clientY);
                if (elem !== e.currentTarget) {
                    setShowSources(false);
                }
            }}>
                Source: {current.name}
                <div className="colorwaysCaretContainer">
                    <CaretIcon width={16} height={16} />
                </div>
                {showSources ? <div className="colorwaysSubmenuWrapper" style={{
                    position: "fixed",
                    top: `${subPos.y}px`,
                    left: `${subPos.x}px`
                }}>
                    <nav className="colorwaysContextMenu">
                        {sources.map(({ name, id }) => {
                            return <button onClick={() => onSourceChange_internal({ name, id })} className="colorwaysContextMenuItm">
                                {name}
                                <Radio checked={source.id === id} style={{
                                    marginLeft: "8px"
                                }} />
                            </button>;
                        })}
                    </nav>
                </div> : null}
            </button>
            <button className="colorwaysContextMenuItm" onMouseEnter={e => {
                setShowLayouts(true);
                setSubPos({
                    x: e.currentTarget.getBoundingClientRect().x + e.currentTarget.offsetWidth,
                    y: e.currentTarget.getBoundingClientRect().y
                });
            }} onMouseLeave={e => {
                const elem = document.elementFromPoint(e.clientX, e.clientY);
                if (elem !== e.currentTarget) {
                    setShowLayouts(false);
                }
            }}>
                Layout: {layouts.find(l => l.id === layout)?.name}
                <div className="colorwaysCaretContainer">
                    <CaretIcon width={16} height={16} />
                </div>
                {showLayouts ? <div className="colorwaysSubmenuWrapper" style={{
                    position: "fixed",
                    top: `${subPos.y}px`,
                    left: `${subPos.x}px`
                }}>
                    <nav className="colorwaysContextMenu">
                        {layouts.map(({ name, id }) => {
                            return <button onClick={() => onLayout_intrnl(id as "normal" | "compact")} className="colorwaysContextMenuItm">
                                {name}
                                <Radio checked={layout === id} style={{
                                    marginLeft: "8px"
                                }} />
                            </button>;
                        })}
                    </nav>
                </div> : null}
            </button>
        </nav> : null}
        <button className="colorwaysPillButton colorwaysPillButton-primary" onClick={rightClickContextMenu as unknown as MouseEventHandler<HTMLButtonElement>}><CogIcon width={14} height={14} /> Options...</button>
    </>;
}
