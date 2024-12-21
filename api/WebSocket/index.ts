/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import MainUI from "../../components/MainUI";
import { nullColorwayObj } from "../../constants";
import { ColorwayObject } from "../../types";
import { Dispatcher, LayerManager } from "..";
import { setContext } from "../Contexts";
import { simpleContexts } from "../Hooks";
import { compareColorwayObjects, getWsClientIdentity } from "../Utils";

export function connect() {
    const [context, destroyContexts, addContextListener] = simpleContexts();

    if (context().isConnected) return;

    const ws: WebSocket = new WebSocket("ws://localhost:6124");

    let hasErrored = false;

    ws.onopen = function () {
        setContext("hasManagerRole", false, false);
        setContext("isConnected", true, false);

        Dispatcher.addListener("COLORWAYS_CLOSE_WS", () => ws?.close(3001, "Connection severed manually"));
        Dispatcher.addListener("COLORWAYS_RESTART_WS", () => {
            ws?.close(3001, "Connection severed manually");
            connect();
        });
    };

    ws.onmessage = function ({ data: raw }) {
        const data: ({
            type: "complication:ui-summon:summon" | "remove-colorway" | "complication:remote-sources:received" | "complication:remote-sources:update-request" | "complication:manager-role:granted" | "complication:manager-role:revoked",
        } | {
            type: "change-colorway",
            active: ColorwayObject;
        } | {
            type: "manager-connection-established",
            MID?: string;
        }) = JSON.parse(raw);

        if (data.type === "change-colorway") {
            if (data.active.id === null) {
                setContext("activeColorwayObject", nullColorwayObj);
            } else {
                if (data.active.id !== context().activeColorwayObject.id) {
                    if (context().colorwayUsageMetrics.filter(metric => compareColorwayObjects(metric, data.active)).length) {
                        const foundMetric = context().colorwayUsageMetrics.find(metric => compareColorwayObjects(metric, data.active));
                        const newMetrics = [...context().colorwayUsageMetrics.filter(metric => !compareColorwayObjects(metric, data.active)), { ...foundMetric, uses: (foundMetric?.uses || 0) + 1 }];
                        setContext("colorwayUsageMetrics", newMetrics as (ColorwayObject & { uses: number; })[]);
                    } else {
                        const newMetrics = [...context().colorwayUsageMetrics, { ...data.active, uses: 1 }];
                        setContext("colorwayUsageMetrics", newMetrics as (ColorwayObject & { uses: number; })[]);
                    }

                    setContext("activeColorwayObject", data.active);
                }
            }
        }
        if (data.type === "remove-colorway") {
            if (context().activeColorwayObject.id !== null) {
                setContext("activeColorwayObject", nullColorwayObj);
            }
        }
        if (data.type === "manager-connection-established") {
            if (data.MID) {
                const boundSearch = context().colorwaysBoundManagers.filter(boundManager => {
                    if (Object.keys(boundManager)[0] === data.MID) return boundManager;
                });
                if (boundSearch.length) {
                    setContext("boundKey", boundSearch[0], false);
                } else {
                    const id = { [data.MID]: `${getWsClientIdentity()}.${Math.random().toString(16).slice(2)}.${new Date().getUTCMilliseconds()}` };
                    setContext("colorwaysBoundManagers", [...context().colorwaysBoundManagers, id]);
                    setContext("boundKey", id, false);
                }
                ws?.send(JSON.stringify({
                    type: "client-sync-established",
                    boundKey: context().boundKey,
                    complications: [
                        "remote-sources",
                        "manager-role",
                        "ui-summon"
                    ]
                }));
                ws?.send(JSON.stringify({
                    type: "complication:remote-sources:init",
                    boundKey: context().boundKey,
                    online: context().colorwaySourceFiles,
                    offline: context().customColorways
                }));
                addContextListener("customColorways", (c, value) => {
                    ws?.send(JSON.stringify({
                        type: "complication:remote-sources:init",
                        boundKey: context().boundKey,
                        online: context().colorwaySourceFiles,
                        offline: value
                    }));
                });
                addContextListener("colorwaySourceFiles", (c, value) => {
                    ws?.send(JSON.stringify({
                        type: "complication:remote-sources:init",
                        boundKey: context().boundKey,
                        online: value,
                        offline: context().customColorways
                    }));
                });
                Dispatcher.addListener("COLORWAYS_SEND_COLORWAY", function ({ active }: { active: ColorwayObject; }) {
                    ws?.send(JSON.stringify({
                        type: "complication:manager-role:send-colorway",
                        active,
                        boundKey: context().boundKey
                    }));
                });
                Dispatcher.addListener("COLORWAYS_REQUEST_MANAGER", () => {
                    ws?.send(JSON.stringify({
                        type: "complication:manager-role:request",
                        boundKey: context().boundKey
                    }));
                });
            }
        }
        if (data.type === "complication:manager-role:granted") {
            setContext("hasManagerRole", true, false);
        }
        if (data.type === "complication:manager-role:revoked") {
            setContext("hasManagerRole", false, false);
        }
        if (data.type === "complication:ui-summon:summon") {
            LayerManager.pushLayer(MainUI);
        }
    };

    ws.onclose = function (e) {
        setContext("boundKey", { "00000000": `${getWsClientIdentity()}.${Math.random().toString(16).slice(2)}.${new Date().getUTCMilliseconds()}` }, false);
        setContext("hasManagerRole", false, false);
        setContext("isConnected", false, false);

        destroyContexts();

        Dispatcher.removeListener("COLORWAYS_SEND_COLORWAY", function ({ active }: { active: ColorwayObject; }) {
            ws?.send(JSON.stringify({
                type: "complication:manager-role:send-colorway",
                active,
                boundKey: context().boundKey
            }));
        });

        Dispatcher.removeListener("COLORWAYS_REQUEST_MANAGER", () => {
            ws?.send(JSON.stringify({
                type: "complication:manager-role:request",
                boundKey: context().boundKey
            }));
        });

        if (context().colorwaysManagerDoAutoconnect && (e.code !== 3001 || hasErrored)) {
            setTimeout(() => connect(), context().colorwaysManagerAutoconnectPeriod);
        }
    };

    ws.onerror = () => hasErrored = true;
}
