/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { ContextMenuApi, FluxDispatcher, useEffect } from "..";
import { Hooks } from "../api";

export default function ({
    children,
    menu
}: {
    children: (props: { onContextMenu: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void; }) => React.ReactNode,
    menu: React.ReactNode;
}) {
    const theme = Hooks.useTheme();

    function Menu() {
        useEffect(() => {
            window.addEventListener("click", () => FluxDispatcher.dispatch({ type: "CONTEXT_MENU_CLOSE" }));
            return () => {
                window.removeEventListener("click", () => FluxDispatcher.dispatch({ type: "CONTEXT_MENU_CLOSE" }));
            };
        }, []);
        return <nav data-theme={theme} className="dc-contextmenu">
            {menu}
        </nav>;
    }

    return <>
        {children({
            onContextMenu: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
                ContextMenuApi.openContextMenu(e, () => <Menu />);
            }
        })}
    </>;
}
