/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import * as $Contexts from "./Contexts";
import * as $DataStore from "./DataStore";
import * as $Discord from "./Discord";
import * as $Dispatcher from "./Dispatcher";
import * as $Hooks from "./Hooks";
import $HTMLColorwayElement from "./HTMLColorwayElement";
import * as $LayerManager from "./LayerManager";
import * as $Presets from "./Presets";
import * as $Styles from "./Styles";
import * as $Utils from "./Utils";
import * as $WebSocket from "./WebSocket";

export const DataStore = $DataStore;
export const Styles = $Styles;
export const Dispatcher = $Dispatcher;
export const Contexts = $Contexts;
export const Hooks = $Hooks;
export const WebSocket = $WebSocket;
export const Utils = $Utils;
export const LayerManager = $LayerManager;
export const Discord = $Discord;
export const Presets = $Presets;
export class HTMLColorwayElement extends $HTMLColorwayElement { }

export class Logger {
    static makeTitle(color: string, title: string): [string, ...string[]] {
        return ["%c %c %s ", "", `background: ${color}; color: black; font-weight: bold; border-radius: 5px;`, title];
    }

    constructor(public name: string) { }

    private _log(level: "log" | "error" | "warn" | "info" | "debug", levelColor: string, args: any[]) {
        console[level](
            `%c DiscordColorways %c %c ${this.name} %c`,
            "background-color: #5865f2; color: #fff; font-family: 'gg sans', 'Noto Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 0 4px; border-radius: 4px;",
            "",
            "background-color: #5865f2; color: #fff; font-family: 'gg sans', 'Noto Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 0 4px; border-radius: 4px;",
            "",
            ...args
        );
    }

    public log(...args: any[]) {
        this._log("log", "#a6d189", args);
    }

    public info(...args: any[]) {
        this._log("info", "#a6d189", args);
    }

    public error(...args: any[]) {
        this._log("error", "#e78284", args);
    }

    public warn(...args: any[]) {
        this._log("warn", "#e5c890", args);
    }

    public debug(...args: any[]) {
        this._log("debug", "#eebebe", args);
    }
}
