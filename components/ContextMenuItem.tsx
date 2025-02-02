/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

export default function ({ onClick, children }: { onClick: React.MouseEventHandler<HTMLButtonElement>, children: React.ReactNode; }) {
    return <button
        className="dc-contextmenu-item"
        onClick={onClick}
    >
        {children}
    </button>;
}
