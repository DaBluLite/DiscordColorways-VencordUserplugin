/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import style from "../../style.css";
import discordTheme from "../../theme.discord.css";
import discordVRTheme from "../../theme.discord-vr.css";
import { Context, ContextKey } from "../../types";
import { Contexts, Dispatcher, HTMLColorwayElement, Styles, WebSocket } from "..";
import * as $Settings from "./Settings";

export const Settings = $Settings;

export function start(callback: (context: Record<ContextKey, Context<ContextKey>>) => void = () => { }) {
    Styles.setStyle("dc-css-main", style);
    Styles.setStyle("dc-css-theme-discord", discordTheme);
    Styles.setStyle("dc-css-theme-discordvr", discordVRTheme);

    Contexts.initContexts().then(contexts => {
        window.customElements.define("active-colorway", HTMLColorwayElement, { extends: "style" });

        document.head.append(Object.assign(document.createElement("style", { is: "active-colorway" })));

        WebSocket.connect();

        callback(contexts);
    });
}

export function stop() {
    Styles.removeStyle("dc-css-main");
    Styles.removeStyle("dc-css-theme-discord");
    Styles.removeStyle("dc-css-theme-discordvr");
    Dispatcher.dispatch("COLORWAYS_CLOSE_WS", {});
    Dispatcher.dispatch("COLORWAYS_REMOVE_ACTIVE_COLORWAY_CSS", {});
}
