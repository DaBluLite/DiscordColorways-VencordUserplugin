/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { ButtonProps } from "../types";

export default function (props: ButtonProps): JSX.Element {
    return <button
        className={`dc-button ${props.color ? "dc-button-" + props.color : ""} ${props.size ? "dc-button-" + props.size : ""} ${(props.props || []).map(prop => ("dc-button-" + prop)).join(" ")}`}
        onClick={props.onClick}
    >
        {props.children}
    </button>;
}
