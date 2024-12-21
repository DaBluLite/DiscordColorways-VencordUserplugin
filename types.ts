/*
 * Vencord, a Discord client mod
 * Copyright (c) 2023 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { type contexts } from "./api/Contexts";
import { type colorVals } from "./constants";

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
    colors?: string[],
    isGradient?: boolean,
    sourceType?: "online" | "offline" | "temporary" | null,
    source?: string,
    linearGradient?: string;
}

type FormTextTypes = Record<"DEFAULT" | "INPUT_PLACEHOLDER" | "DESCRIPTION" | "LABEL_BOLD" | "LABEL_SELECTED" | "LABEL_DESCRIPTOR" | "ERROR" | "SUCCESS", string>;
type Heading = `h${1 | 2 | 3 | 4 | 5 | 6}`;

type FormTitle = React.ComponentType<React.HTMLProps<HTMLTitleElement> & React.PropsWithChildren<{
    /** is h5 */
    tag?: Heading;
    faded?: boolean;
    disabled?: boolean;
    required?: boolean;
    error?: React.ReactNode;
}>>;

type FormSection = React.ComponentType<React.PropsWithChildren<{
    /** is h5 */
    tag?: Heading;
    className?: string;
    titleClassName?: string;
    titleId?: string;
    title?: React.ReactNode;
    disabled?: boolean;
    htmlFor?: unknown;
}>>;

type FormDivider = React.ComponentType<{
    className?: string;
    style?: React.CSSProperties;
}>;


type FormText = React.ComponentType<React.PropsWithChildren<{
    disabled?: boolean;
    selectable?: boolean;
    /** defaults to FormText.Types.DEFAULT */
    type?: string;
}> & TextProps> & { Types: FormTextTypes; };

type TextVariant = "heading-sm/normal" | "heading-sm/medium" | "heading-sm/semibold" | "heading-sm/bold" | "heading-md/normal" | "heading-md/medium" | "heading-md/semibold" | "heading-md/bold" | "heading-lg/normal" | "heading-lg/medium" | "heading-lg/semibold" | "heading-lg/bold" | "heading-xl/normal" | "heading-xl/medium" | "heading-xl/bold" | "heading-xxl/normal" | "heading-xxl/medium" | "heading-xxl/bold" | "eyebrow" | "heading-deprecated-14/normal" | "heading-deprecated-14/medium" | "heading-deprecated-14/bold" | "text-xxs/normal" | "text-xxs/medium" | "text-xxs/semibold" | "text-xxs/bold" | "text-xs/normal" | "text-xs/medium" | "text-xs/semibold" | "text-xs/bold" | "text-sm/normal" | "text-sm/medium" | "text-sm/semibold" | "text-sm/bold" | "text-md/normal" | "text-md/medium" | "text-md/semibold" | "text-md/bold" | "text-lg/normal" | "text-lg/medium" | "text-lg/semibold" | "text-lg/bold" | "display-sm" | "display-md" | "display-lg" | "code";

type TextProps = React.PropsWithChildren<React.HtmlHTMLAttributes<HTMLDivElement> & {
    variant?: TextVariant;
    tag?: "div" | "span" | "p" | "strong" | Heading;
    selectable?: boolean;
    lineClamp?: number;
}>;

export type FormsType = {
    FormTitle: FormTitle,
    FormSection: FormSection,
    FormDivider: FormDivider,
    FormText: FormText,
    CustomColorPicker;
};

export interface ColorPickerProps {
    color: number;
    showEyeDropper: boolean;
    suggestedColors: string[];
    label: any;
    onChange(color: number): void;
}

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

type PresetSourceType = "online" | "offline" | "theme" | "builtin";

export interface Preset {
    name: string;
    css: string;
    sourceType: PresetSourceType,
    source: string,
    author: string,
    conditions?: PresetCondition[];
}

export interface PresetObject {
    id: string;
    css: string;
    sourceType: PresetSourceType,
    source: string,
    conditions?: PresetCondition[];
}

export const enum Tabs {
    Selector,
    Settings,
    Sources,
    WsConnection,
    ExpandSidebar
}

export interface PresetCondition {
    if: string;
    is: PresetConditionFunction;
    than: string;
    onCondition: string;
    onConditionElse?: string;
}

export type PresetConditionFunction = "greaterThan" | "lowerThan" | "equal";

export type ColorValue = typeof colorVals[number]["value"];

export interface SourceObject {
    type: "online" | "offline",
    source: string,
    colorways?: Colorway[],
    presets?: Preset[];
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

export const enum ModalTransitionState {
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

export interface ModalOptions {
    modalKey?: string;
    onCloseRequest?: (() => void);
    onCloseCallback?: (() => void);
}

export const enum SourceActions {
    AddColorway,
    RemoveColorway,
    AddPreset,
    RemovePreset
}

export interface ButtonProps {
    color?: ButtonColors;
    size?: ButtonSizes;
    props?: ("outlined" | "icon")[];
    onClick: React.MouseEventHandler<HTMLButtonElement>;
    children: React.ReactNode;
}

export const enum ButtonColors {
    BRAND = "brand",
    PRIMARY = "primary",
    SECONDARY = "secondary",
    DANGER = "danger"
}

export const enum ButtonSizes {
    TINY = "tn",
    MEDIUM = "md",
    LARGE = "lg",
    EXTRALARGE = "xl"
}

export type RenderFunction = (props: ModalProps) => React.ReactNode;

export type ContextKey = keyof typeof contexts;
export type Context<Key extends ContextKey> = typeof contexts[Key];
