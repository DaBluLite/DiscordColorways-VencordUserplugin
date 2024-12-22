/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { FluxDispatcher } from "../..";

export const events: {
    [event: string]: {
        listeners: (() => any)[];
    };
} = {};

export function addListener(event: string | number, callback: (...args: any) => any) {
    FluxDispatcher.subscribe(event as any, callback);
}

export function removeListener(event: string | number, callback: (...args: any) => any) {
    FluxDispatcher.unsubscribe(event as any, callback);
}

export function dispatch(event: string | number, details: Record<any, any>) {
    FluxDispatcher.dispatch({
        type: event as any,
        ...details
    });
}
