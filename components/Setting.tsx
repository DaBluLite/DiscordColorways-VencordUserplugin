/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

export default function ({
    children,
    divider = false,
    disabled = false,
    style = {}
}: {
    children: React.ReactNode,
    divider?: boolean,
    disabled?: boolean,
    style?: React.CSSProperties;
}) {
    return <div style={{
        display: "flex",
        flexDirection: "column",
        marginBottom: "20px",
        ...style
    }}>
        {disabled ? <div style={{
            pointerEvents: "none",
            opacity: .5,
            cursor: "not-allowed"
        }}>{children}</div> : children}
        {divider && <div className="dc-divider" />}
    </div>;
}
