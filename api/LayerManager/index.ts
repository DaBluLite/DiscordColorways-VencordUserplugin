/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { FluxDispatcher } from "../..";

export function pushLayer(component) {
    FluxDispatcher.dispatch({
        type: "LAYER_PUSH",
        component
    });
}

export function popLayer() {
    FluxDispatcher.dispatch({
        type: "LAYER_POP"
    });
}

export function popAllLayers() {
    FluxDispatcher.dispatch({
        type: "LAYER_POP_ALL"
    });
}
