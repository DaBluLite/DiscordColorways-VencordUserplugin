/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { ContextMenuApi, FluxDispatcher, FluxEvents, useEffect, useState } from "..";
import { contexts } from "../contexts";

export default function ({
    children,
    menu
}: {
    children: (props: { onContextMenu: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void; }) => JSX.Element,
    menu: JSX.Element;
}) {
    const [theme, setTheme] = useState(contexts.colorwaysPluginTheme);

    function Menu() {
        useEffect(() => {
            window.addEventListener("click", () => FluxDispatcher.dispatch({ type: "CONTEXT_MENU_CLOSE" }));
            FluxDispatcher.subscribe("COLORWAYS_UPDATE_THEME" as FluxEvents, ({ theme }) => setTheme(theme));
            return () => {
                window.removeEventListener("click", () => FluxDispatcher.dispatch({ type: "CONTEXT_MENU_CLOSE" }));
                FluxDispatcher.unsubscribe("COLORWAYS_UPDATE_THEME" as FluxEvents, ({ theme }) => setTheme(theme));
            };
        }, []);
        return <nav data-theme={theme} className="colorwaysContextMenu">
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
