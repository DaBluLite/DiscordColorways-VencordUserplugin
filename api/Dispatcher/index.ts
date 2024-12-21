/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

export const events: {
    [event: string]: {
        listeners: (() => any)[];
    };
} = {};

export function addListener(event: string | number, callback: (...args: any) => any) {
    // Check if the callback is not a function
    if (typeof callback !== "function") {
        console.error(`The listener callback must be a function, the given type is ${typeof callback}`);
        return false;
    }
    // Check if the event is not a string
    if (typeof event !== "string") {
        console.error(`The event name must be a string, the given type is ${typeof event}`);
        return false;
    }

    // Create the event if not exists
    if (events[event] === undefined) {
        events[event] = {
            listeners: []
        };
    }

    events[event].listeners.push(callback);
}

export function removeListener(event: string | number, callback: (...args: any) => any) {
    // check if this event not exists
    if (events[event] === undefined) {
        console.error(`This event: ${event} does not exist`);
        return false;
    }

    events[event].listeners = events[event].listeners.filter((listener: { toString: () => any; }) => {
        return listener.toString() !== callback.toString();
    });
}

export function dispatch(event: string | number, details: any) {
    // check if this event not exists
    if (events[event] === undefined) {
        events[event] = {
            listeners: []
        };
    }

    events[event].listeners.forEach((listener: (arg0: any) => void) => {
        listener(details);
    });
}
