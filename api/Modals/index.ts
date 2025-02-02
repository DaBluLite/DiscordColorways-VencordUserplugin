/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { filters, mapMangledModuleLazy } from "@webpack";

import { ModalOptions, RenderFunction } from "../../types";

type FilterFn = (mod: any) => boolean;

type PropsFilter = Array<string>;

function byProps(...props: PropsFilter): FilterFn {
    return props.length === 1
        ? m => m[props[0]] !== void 0
        : m => props.every(p => m[p] !== void 0);
}

type ModalAPI = {
    openModalLazy(render: () => Promise<RenderFunction>, options?: ModalOptions & { contextKey?: string; }): Promise<string>,
    openModal(render: RenderFunction, options?: ModalOptions, contextKey?: string): string,
    closeModal(modalKey: string, contextKey?: string): void,
    closeAllModals(): void;
};

export const ModalAPI: ModalAPI = mapMangledModuleLazy(".modalKey?", {
    openModalLazy: filters.byCode(".modalKey?"),
    openModal: filters.byCode(",instant:"),
    closeModal: filters.byCode(".onCloseCallback()"),
    closeAllModals: filters.byCode(".getState();for")
});

/**
 * Wait for the render promise to resolve, then open a modal with it.
 * This is equivalent to render().then(openModal)
 * You should use the Modal components exported by this file
 */
export function openModalLazy(render: () => Promise<RenderFunction>, options?: ModalOptions & { contextKey?: string; }): Promise<string> {
    return ModalAPI.openModalLazy(render, options);
}

/**
 * Open a Modal with the given render function.
 * You should use the Modal components exported by this file
 */
export function openModal(render: RenderFunction, options?: ModalOptions, contextKey?: string): string {
    return ModalAPI.openModal(render, options, contextKey);
}

/**
 * Close a modal by its key
 */
export function closeModal(modalKey: string, contextKey?: string): void {
    return ModalAPI.closeModal(modalKey, contextKey);
}

/**
 * Close all open modals
 */
export function closeAllModals(): void {
    return ModalAPI.closeAllModals();
}
