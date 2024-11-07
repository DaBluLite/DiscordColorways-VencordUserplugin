/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { MouseEvent, MouseEventHandler } from "react";

import { useEffect, useState } from "..";
import { SortOptions } from "../types";
import { CaretIcon, CogIcon } from "./Icons";
import Radio from "./Radio";

export default function ({
    sort,
    onSortChange,
    onLayout,
    layout
}: {
    sort: SortOptions;
    onSortChange: (newSort: SortOptions) => void;
    onLayout: (layout: "normal" | "compact") => void;
    layout: "normal" | "compact";
}) {
    const [pos, setPos] = useState({ x: 0, y: 0 });
    const [subPos, setSubPos] = useState({ x: 0, y: 0 });
    const [showMenu, setShowMenu] = useState(false);
    const [showSort, setShowSort] = useState(false);
    const [showLayouts, setShowLayouts] = useState(false);

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
        window.addEventListener("click", onPageClick);
        return () => {
            window.removeEventListener("click", onPageClick);
        };
    }, []);

    function onSortChange_internal(newSort: SortOptions) {
        onSortChange(newSort);
        setShowMenu(false);
        setShowSort(false);
    }

    function onLayout_intrnl(layout: "normal" | "compact") {
        onLayout(layout);
        setShowMenu(false);
        setShowLayouts(false);
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
                    </nav>
                </div> : <></>}
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
