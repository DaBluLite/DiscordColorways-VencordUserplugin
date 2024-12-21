/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { useEffect, useState } from "..";
import { Hooks } from "../api";

export default function ({
    children,
    menu,
    xPos = "left",
    yPos = "bottom"
}: {
    children: (props: { onClick: React.MouseEventHandler<HTMLButtonElement>; }) => JSX.Element,
    menu: JSX.Element,
    xPos?: "left" | "right",
    yPos?: "top" | "bottom";
}) {
    const [pos, setPos] = useState({ x: 0, y: 0 });
    const [showMenu, setShowMenu] = useState(false);

    function rightClickContextMenu(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        e.stopPropagation();
        window.dispatchEvent(new Event("click"));
        setShowMenu(!showMenu);
        setPos({
            x: (() => {
                switch (xPos) {
                    case "left":
                        return e.currentTarget.getBoundingClientRect().x;
                    case "right":
                        return window.innerWidth - e.currentTarget.getBoundingClientRect().x - e.currentTarget.offsetWidth;
                }
            })(),
            y: e.currentTarget.getBoundingClientRect().y + e.currentTarget.offsetHeight + 8
        });

        return;
    }

    function onPageClick(this: Window, e: globalThis.MouseEvent) {
        setShowMenu(false);
    }

    const theme = Hooks.useTheme();

    function Menu() {
        useEffect(() => {
            window.addEventListener("click", onPageClick);
            return () => {
                window.removeEventListener("click", onPageClick);
            };
        }, []);
        return <nav data-theme={theme} className="dc-contextmenu" style={{
            position: "fixed",
            top: `${pos.y}px`,
            ...(xPos === "left" ? { left: `${pos.x}px` } : { right: `${pos.x}px` })
        }}>
            {menu}
        </nav>;
    }

    return <>
        {showMenu ? <Menu /> : null}
        {children({
            onClick: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
                rightClickContextMenu(e);
            }
        })}
    </>;
}
