/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { useEffect, useRef, useState } from "..";
import { contexts, setContext } from "../contexts";
import { Colorway, SourceObject } from "../types";

export default function ({
    onClick,
    setShowSpinner
}: {
    onClick: (data: SourceObject[]) => Promise<void>,
    setShowSpinner: (value: React.SetStateAction<boolean>) => void;
}) {
    const menuProps = useRef(null);
    const [pos, setPos] = useState({ x: 0, y: 0 });
    const [showMenu, setShowMenu] = useState(false);

    function rightClickContextMenu(e: React.MouseEvent<HTMLButtonElement>) {
        e.stopPropagation();
        window.dispatchEvent(new Event("click"));
        setShowMenu(!showMenu);
        setPos({
            x: e.currentTarget.getBoundingClientRect().x,
            y: e.currentTarget.getBoundingClientRect().y + e.currentTarget.offsetHeight + 8
        });
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

    async function onForceReload_internal() {
        setShowMenu(false);
        setShowSpinner(true);

        const responses: Response[] = await Promise.all(
            contexts.colorwaySourceFiles.map(source =>
                fetch(source.url, { "cache": "no-store" })
            )
        );

        setShowSpinner(false);

        return setContext("colorwayData", await Promise.all(
            responses
                .map((res, i) => ({ response: res, name: contexts.colorwaySourceFiles[i].name }))
                .map((res: { response: Response, name: string; }) =>
                    res.response.json().then(dt => ({ colorways: dt.colorways as Colorway[], source: res.name, type: "online" })).catch(() => ({ colorways: [] as Colorway[], source: res.name, type: "online" }))
                )) as { type: "online" | "offline" | "temporary", source: string, colorways: Colorway[]; }[], false);
    }

    async function onReload_internal() {
        setShowMenu(false);
        setShowSpinner(true);

        const responses: Response[] = await Promise.all(
            contexts.colorwaySourceFiles.map(source =>
                fetch(source.url)
            )
        );

        setShowSpinner(false);

        return setContext("colorwayData", await Promise.all(
            responses
                .map((res, i) => ({ response: res, name: contexts.colorwaySourceFiles[i].name }))
                .map((res: { response: Response, name: string; }) =>
                    res.response.json().then(dt => ({ colorways: dt.colorways as Colorway[], source: res.name, type: "online" })).catch(() => ({ colorways: [] as Colorway[], source: res.name, type: "online" }))
                )) as { type: "online" | "offline" | "temporary", source: string, colorways: Colorway[]; }[], false);
    }

    return <>
        {showMenu ? <nav className="colorwaysContextMenu" ref={menuProps} style={{
            position: "fixed",
            top: `${pos.y}px`,
            left: `${pos.x}px`
        }}>
            <button onClick={async () => onClick(await onForceReload_internal() as SourceObject[])} className="colorwaysContextMenuItm">
                Force Refresh
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    x="0px"
                    y="0px"
                    width="18"
                    height="18"
                    style={{ boxSizing: "content-box", marginLeft: "8px" }}
                    viewBox="0 0 24 24"
                    fill="currentColor"
                >
                    <rect
                        y="0"
                        fill="none"
                        width="24"
                        height="24"
                    />
                    <path
                        d="M6.351,6.351C7.824,4.871,9.828,4,12,4c4.411,0,8,3.589,8,8h2c0-5.515-4.486-10-10-10 C9.285,2,6.779,3.089,4.938,4.938L3,3v6h6L6.351,6.351z"
                    />
                    <path
                        d="M17.649,17.649C16.176,19.129,14.173,20,12,20c-4.411,0-8-3.589-8-8H2c0,5.515,4.486,10,10,10 c2.716,0,5.221-1.089,7.062-2.938L21,21v-6h-6L17.649,17.649z"
                    />
                </svg>
            </button>
        </nav> : null}
        <button className="colorwaysPillButton colorwaysPillButton-primary" onContextMenu={rightClickContextMenu} onClick={async () => onClick(await onReload_internal() as SourceObject[])}>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                x="0px"
                y="0px"
                width="14"
                height="14"
                style={{ boxSizing: "content-box" }}
                viewBox="0 0 24 24"
                fill="currentColor"
            >
                <rect
                    y="0"
                    fill="none"
                    width="24"
                    height="24"
                />
                <path
                    d="M6.351,6.351C7.824,4.871,9.828,4,12,4c4.411,0,8,3.589,8,8h2c0-5.515-4.486-10-10-10 C9.285,2,6.779,3.089,4.938,4.938L3,3v6h6L6.351,6.351z"
                />
                <path
                    d="M17.649,17.649C16.176,19.129,14.173,20,12,20c-4.411,0-8-3.589-8-8H2c0,5.515,4.486,10,10,10 c2.716,0,5.221-1.089,7.062-2.938L21,21v-6h-6L17.649,17.649z"
                />
            </svg>
            Refresh
        </button>
    </>;
}
