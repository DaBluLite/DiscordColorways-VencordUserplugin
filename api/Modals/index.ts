/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { ModalAPI } from "../..";
import { ModalOptions, RenderFunction } from "../../types";

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
