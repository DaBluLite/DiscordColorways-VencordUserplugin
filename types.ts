/*
 * Vencord, a Discord client mod
 * Copyright (c) 2023 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

export interface Colorway {
    [key: string]: any,
    name: string,
    "dc-import"?: string,
    accent: string,
    primary: string,
    secondary: string,
    tertiary: string,
    original?: boolean,
    author: string,
    authorID: string,
    colors?: string[],
    isGradient?: boolean,
    sourceType?: "online" | "offline" | "temporary" | null,
    source?: string,
    linearGradient?: string,
    preset?: string,
    CSSVersion: string;
}

export interface ColorPickerProps {
    color: number;
    showEyeDropper: boolean;
    suggestedColors: string[];
    label: any;
    onChange(color: number): void;
}

export type AnimatableComponent = string | Exclude<React.ElementType, string>;

export type WithAnimated = {
    (Component: AnimatableComponent): any;
    [key: string]: any;
};

export type Animatable<T = any> = T extends number
    ? number
    : T extends string
    ? string
    : T extends ReadonlyArray<number | string>
    ? Array<number | string> extends T // When true, T is not a tuple
    ? ReadonlyArray<number | string>
    : { [P in keyof T]: Animatable<T[P]> }
    : never;

export interface ColorwayObject {
    id: string | null,
    css?: string | null,
    sourceType: "online" | "offline" | "temporary" | "auto" | null | undefined,
    source: string | null | undefined,
    colors: {
        accent: string,
        primary: string,
        secondary: string,
        tertiary: string;
    },
    linearGradient?: string;
}

export interface SourceObject {
    type: "online" | "offline" | "temporary",
    source: string,
    colorways: Colorway[];
}

export enum SortOptions {
    NAME_AZ = 1,
    NAME_ZA = 2,
    SOURCE_AZ = 3,
    SOURCE_ZA = 4,
    SOURCETYPE_ONLINE = 5,
    SOURCETYPE_OFFLINE = 6,
    COLORCOUNT_ASCENDING = 7,
    COLORCOUNT_DESCENDING = 8,
    MOST_USED = 9,
    LEAST_USED = 10
}

export interface StoreObject {
    sources: StoreItem[];
}

export interface StoreItem {
    name: string,
    id: string,
    description: string,
    url: string,
    authorGh: string;
}

const enum ModalTransitionState {
    ENTERING,
    ENTERED,
    EXITING,
    EXITED,
    HIDDEN,
}

export interface ModalProps {
    transitionState: ModalTransitionState;
    onClose(): void;
}
