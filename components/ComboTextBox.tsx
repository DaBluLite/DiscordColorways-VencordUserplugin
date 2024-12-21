/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

export default function ({ value = "", onInput = () => { }, placeholder = "", children = <></>, disabled = false, readOnly = false, style = {} }: { value?: string, onInput?: (value: string) => void, placeholder?: string, children?: React.ReactNode, disabled?: boolean, readOnly?: boolean, style?: React.CSSProperties; }) {
    return <div className="dc-selector-header dc-textbox" style={style}>
        <input
            type="text"
            className="dc-textbox"
            style={{ paddingRight: "6px" }}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            value={value}
            autoFocus
            onInput={({ currentTarget: { value } }) => onInput(value)}
        />
        {children}
    </div>;
}
