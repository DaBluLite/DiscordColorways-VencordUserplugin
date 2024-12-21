/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Forms, Popout } from "..";
import { parseClr } from "../api/Utils/Colors";
import { FormsType } from "../types";

export default function ({ onChange, onClose, color, suggestedColors, showEyeDropper, children }: {
    children: (props: {
        "aria-controls": string;
        "aria-expanded": boolean;
        onClick(event: React.MouseEvent<HTMLElement>): void;
        onKeyDown(event: React.KeyboardEvent<HTMLElement>): void;
        onMouseDown(event: React.MouseEvent<HTMLElement>): void;
    }) => React.ReactElement;
    onClose: () => void;
    color: number;
    showEyeDropper: boolean;
    suggestedColors: string[];
    onChange(color: number): void;
}) {
    const Form = Forms as FormsType;
    return <Popout
        positionKey={crypto.randomUUID()}
        renderPopout={e => <Form.CustomColorPicker {...e}
            value={parseClr(color)}
            onChange={(color: number) => onChange(color)}
            suggestedColors={suggestedColors}
            showEyeDropper={showEyeDropper}
        />}
        onRequestClose={onClose}
    >
        {({ ...n }) => {
            return children({ ...n });
        }}
    </Popout>;
}
