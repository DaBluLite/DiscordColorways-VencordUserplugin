/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Dispatch, SetStateAction } from "react";

import { useEffect, useReducer, useState } from "../..";
import { Context, ContextKey } from "../../types";
import { Dispatcher } from "..";
import { contexts, setContext } from "../Contexts";

/**
 * Returns a stateful value that points to a context, and a function to update said context.
 *
 * @param context The name of the context
 * @param [options={ save: true, listen: true }] Change if the state listens to context changes or if it saves the context via DataStore
 */
export function useContextualState<Key extends ContextKey>(context: Key, save = true): [Context<Key>, Dispatch<SetStateAction<Context<Key>>>] {
    const [get, set] = useState<Context<Key>>(contexts[context] as Context<Key>);
    useEffect(() => {
        Dispatcher.addListener("COLORWAYS_CONTEXT_UPDATED", ({ c, value }: { c: Key, value: Context<Key>; }) => {
            if (context === c) {
                set(value as Context<Key>);
            }
        });

        return () => {
            Dispatcher.removeListener("COLORWAYS_CONTEXT_UPDATED", ({ c, value }: { c: Key, value: Context<Key>; }) => {
                if (context === c) {
                    set(value as Context<Key>);
                }
            });
        };
    }, []);
    const setCustom: Dispatch<SetStateAction<Context<Key>>> = (value: Context<Key> | ((prevState: Context<Key>) => Context<Key>)) => {
        let newValue;

        function getVal(val: Context<Key>): Context<Key> {
            if (typeof value === "function") {
                setContext(context, value(val), save);
                return value(val);
            } else {
                setContext(context, (value as Context<Key>) as any, save);
                return value;
            }
        }

        set(v => {
            newValue = getVal(v);
            return newValue;
        });
        return newValue;
    };

    return [get, setCustom];
}

export function useContexts(): typeof contexts {
    const [get, set] = useReducer(function (state, action) {
        return {
            ...state,
            [action.c]: action.value
        };
    }, contexts);
    useEffect(() => {
        Dispatcher.addListener("COLORWAYS_CONTEXT_UPDATED", <Key extends ContextKey>({ c, value }: { c: Key, value: Context<Key>; }) => {
            set({ c, value });
        });

        return () => {
            Dispatcher.removeListener("COLORWAYS_CONTEXT_UPDATED", <Key extends ContextKey>({ c, value }: { c: Key, value: Context<Key>; }) => {
                set({ c, value });
            });
        };
    }, []);

    return get;
}

export function simpleContext<Key extends ContextKey>(context: Key, options: { save: boolean, listen: boolean; } = { save: true, listen: true }): [() => Context<Key>, (newVal: Context<Key>) => void, () => void, (context: ContextKey, callback: <Key extends ContextKey>(context: Key, value: Context<Key>) => void) => void] {
    let val: Context<Key> = contexts[context] as Context<Key>;
    let events: Partial<Events> = {};

    const set = (value: Context<Key>) => {
        val = setContext(context, value, options.save) as Context<Key>;
    };

    function callEvts({ c, value }: { c: Key, value: Context<Key>; }) {
        if (context === c) {
            val = value;
            if (events[c]) {
                events[c].forEach(callback => callback(c, value));
            }
        }
    }
    Dispatcher.addListener("COLORWAYS_CONTEXT_UPDATED", (params: { c: Key, value: Context<Key>; }) => callEvts(params));

    type Events = {
        [key in ContextKey]: (<Key extends ContextKey>(context: Key, value: Context<Key>) => void)[]
    };

    return [
        () => val,
        set,
        () => {
            Dispatcher.removeListener("COLORWAYS_CONTEXT_UPDATED", (params: { c: Key, value: Context<Key>; }) => callEvts(params));
            events = {};
        },
        (context: ContextKey, callback: <Key extends ContextKey>(context: Key, value: Context<Key>) => void) => {
            if (!events[context]) {
                events[context] = [];
            }
            events[context].push(callback);
        }
    ];
}

export function simpleContexts(): [() => { [key in ContextKey]: Context<key> }, () => void, (context: ContextKey, callback: <Key extends ContextKey>(context: Key, value: Context<Key>) => void) => void] {
    const val = contexts as { [key in ContextKey]: Context<key> };
    Dispatcher.addListener("COLORWAYS_CONTEXT_UPDATED", <Key extends ContextKey>({ c, value }: { c: Key, value: Context<Key>; }) => {
        val[c] = value;
        if (events[c]) {
            events[c].forEach(callback => callback(c, value));
        }
    });

    type Events = {
        [key in ContextKey]: (<Key extends ContextKey>(context: Key, value: Context<Key>) => void)[]
    };

    let events: Partial<Events> = {};

    return [
        () => val,
        () => {
            Dispatcher.removeListener("COLORWAYS_CONTEXT_UPDATED", <Key extends ContextKey>({ c, value }: { c: Key, value: Context<Key>; }) => {
                val[c] = value;
                if (events[c]) {
                    events[c].forEach(callback => callback(c, value));
                }
            });
            events = {};
        },
        (context: ContextKey, callback: <Key extends ContextKey>(context: Key, value: Context<Key>) => void) => {
            if (!events[context]) {
                events[context] = [];
            }
            events[context].push(callback);
        }
    ];
}

export function simpleContextsObject(): { contexts: () => { [key in ContextKey]: Context<key> }, destroyContexts: () => void, addContextListener: (context: ContextKey, callback: <Key extends ContextKey>(context: Key, value: Context<Key>) => void) => void; } {
    const val = contexts as { [key in ContextKey]: Context<key> };
    Dispatcher.addListener("COLORWAYS_CONTEXT_UPDATED", <Key extends ContextKey>({ c, value }: { c: Key, value: Context<Key>; }) => {
        val[c] = value;
        if (events[c]) {
            events[c].forEach(callback => callback(c, value));
        }
    });

    type Events = {
        [key in ContextKey]: (<Key extends ContextKey>(context: Key, value: Context<Key>) => void)[]
    };

    let events: Partial<Events> = {};

    return {
        contexts: () => val,
        destroyContexts: () => {
            Dispatcher.removeListener("COLORWAYS_CONTEXT_UPDATED", <Key extends ContextKey>({ c, value }: { c: Key, value: Context<Key>; }) => {
                val[c] = value;
                if (events[c]) {
                    events[c].forEach(callback => callback(c, value));
                }
            });
            events = {};
        },
        addContextListener: (context: ContextKey, callback: <Key extends ContextKey>(context: Key, value: Context<Key>) => void) => {
            if (!events[context]) {
                events[context] = [];
            }
            events[context].push(callback);
        }
    };
}

export function useTheme(): Context<"colorwaysPluginTheme"> {
    const [theme] = useContextualState("colorwaysPluginTheme", false);
    return theme;
}

export function useTimedState<S>(initialState: S | (() => S), resetEvery: number): [S, Dispatch<SetStateAction<S>>] {
    const init = initialState;
    const [get, set] = useState<S>(initialState);

    let timer: ReturnType<typeof setTimeout>;

    const setCustom: Dispatch<SetStateAction<S>> = (value: S | ((prevState: S) => S)) => {
        let newValue: S = undefined as S;

        function getVal(val: S): S {
            if (typeof value === "function") {
                return (value as ((prevState: S) => S))(val);
            } else {
                return value;
            }
        }

        set(v => {
            newValue = getVal(v);

            clearTimeout(timer);

            timer = setTimeout(() => {
                set(init);
            }, resetEvery);

            return newValue;
        });

        return newValue as S;
    };

    return [get, setCustom];
}
