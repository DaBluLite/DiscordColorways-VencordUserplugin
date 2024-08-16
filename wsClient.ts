import { DataStore } from ".";
import { ColorwayCSS } from "./colorwaysAPI";
import { updateWS } from "./components/Selector";
import { nullColorwayObj } from "./constants";
import { generateCss } from "./css";
import { ColorwayObject } from "./types";
import { colorToHex } from "./utils";

export let wsOpen = false;

export let boundKey: { [managerKey: string]: string; } | null = null;

export let hasManagerRole: boolean = false;

export let sendColorway: (obj: ColorwayObject) => void = () => { };

export let requestManagerRole: () => void = () => { };

export function connect() {
    var ws: WebSocket | null = new WebSocket('ws://localhost:6124');
    ws.onopen = function () {
        wsOpen = true;
        hasManagerRole = false;
        updateWS(true);
    };

    ws.onmessage = function (e) {
        const data: {
            type: "change-colorway" | "remove-colorway" | "manager-connection-established" | "complication:remote-sources:received" | "complication:remote-sources:update-request" | "complication:manager-role:granted" | "complication:manager-role:revoked",
            [key: string]: any;
        } = JSON.parse(e.data);

        function typeSwitch(type) {
            switch (type) {
                case "change-colorway":
                    if (data.active.id == null) {
                        DataStore.set("activeColorwayObject", nullColorwayObj);
                        ColorwayCSS.remove();
                    } else {
                        const demandedColorway = generateCss(
                            colorToHex("#" + data.active.colors.primary || "#313338").replace("#", ""),
                            colorToHex("#" + data.active.colors.secondary || "#2b2d31").replace("#", ""),
                            colorToHex("#" + data.active.colors.tertiary || "#1e1f22").replace("#", ""),
                            colorToHex("#" + data.active.colors.accent || "#5865f2").replace("#", "")
                        );
                        ColorwayCSS.set(demandedColorway);
                        DataStore.set("activeColorwayObject", { ...data.active, css: demandedColorway });
                    }
                    return;
                case "remove-colorway":
                    DataStore.set("activeColorwayObject", nullColorwayObj);
                    ColorwayCSS.remove();
                    return;
                case "manager-connection-established":
                    DataStore.get("colorwaysBoundManagers").then((boundManagers: { [managerKey: string]: string; }[]) => {
                        if (data.MID) {
                            const boundSearch = boundManagers.filter(boundManager => {
                                if (Object.keys(boundManager)[0] == data.MID) return boundManager;
                            });
                            if (boundSearch.length) {
                                boundKey = boundSearch[0];
                            } else {
                                const id = { [data.MID]: `vencord.${Math.random().toString(16).slice(2)}.${new Date().getUTCMilliseconds()}` };
                                DataStore.set("colorwaysBoundManagers", [...boundManagers, id]);
                                boundKey = id;
                            }
                            ws?.send(JSON.stringify({
                                type: "client-sync-established",
                                boundKey,
                                complications: [
                                    "remote-sources",
                                    "manager-role"
                                ]
                            }));
                            DataStore.getMany([
                                "colorwaySourceFiles",
                                "customColorways"
                            ]).then(([
                                colorwaySourceFiles,
                                customColorways
                            ]) => {
                                ws?.send(JSON.stringify({
                                    type: "complication:remote-sources:init",
                                    boundKey,
                                    online: colorwaySourceFiles,
                                    offline: customColorways
                                }));
                            });
                            sendColorway = (obj) => ws?.send(JSON.stringify({
                                type: "complication:manager-role:send-colorway",
                                active: obj,
                                boundKey
                            }));
                            requestManagerRole = () => ws?.send(JSON.stringify({
                                type: "complication:manager-role:request",
                                boundKey
                            }));
                        }
                    });
                    return;
                case "complication:manager-role:granted":
                    hasManagerRole = true;
                    return;
                case "complication:manager-role:revoked":
                    hasManagerRole = false;
                    return;
                case "complication:remote-sources:update-request":
                    DataStore.getMany([
                        "colorwaySourceFiles",
                        "customColorways"
                    ]).then(([
                        colorwaySourceFiles,
                        customColorways
                    ]) => {
                        ws?.send(JSON.stringify({
                            type: "complication:remote-sources:init",
                            boundKey,
                            online: colorwaySourceFiles,
                            offline: customColorways
                        }));
                    });
                    return;
            }
        }

        typeSwitch(data.type);
    };

    ws.onclose = function (e) {
        boundKey = null;
        hasManagerRole = false;
        sendColorway = () => { };
        requestManagerRole = () => { };
        try {
            ws.close();
        } catch (e) {
            return;
        }
        ws = null;
        wsOpen = false;
        updateWS(false);
        setTimeout(() => connect(), 3000);
    };

    ws.onerror = function (e) {
        e.preventDefault();
        boundKey = null;
        sendColorway = () => { };
        requestManagerRole = () => { };
        hasManagerRole = false;
        ws.close();
        ws = null;
        wsOpen = false;
        updateWS(false);
        setTimeout(() => connect(), 3000);
    };
}
