/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { colorToHex } from "../api/Utils/Colors";
import { ButtonColors } from "../types";
import Button from "./Button";
import { IconProps } from "./Icons";
import RightClickContextMenu from "./RightClickContextMenu";

export default function (props: {
    prefix?(): JSX.Element,
    suffix?(): JSX.Element,
    menu?: React.ReactNode,
    id: string,
    "aria-invalid"?: boolean,
    "aria-checked"?: boolean,
    colors?: string[],
    text: string,
    descriptions?: string[],
    actions?: {
        Icon(props: IconProps): JSX.Element,
        onClick: React.MouseEventHandler<HTMLButtonElement>,
        type: ButtonColors;
    }[];
    onContextMenu?(event: React.MouseEvent<HTMLDivElement>): any;
    onClick?(event: React.MouseEvent<HTMLDivElement>): any;
}) {
    return <RightClickContextMenu menu={props.menu}>
        {({ onContextMenu: ocm }) => <div
            onClick={props.onClick}
            className="dc-colorway"
            aria-invalid={props["aria-invalid"]}
            aria-checked={props["aria-checked"]}
            role="button"
            onContextMenu={e => {
                if (props.menu) ocm(e);
                props.onContextMenu && props.onContextMenu(e);
            }}
        >
            {props.prefix ? <props.prefix /> : (props.colors ? <div className="dc-color-swatch">
                {props.colors.map(colorStr => <div
                    className="dc-color-swatch-part"
                    style={{
                        backgroundColor: `#${colorToHex(colorStr)}`,
                    }}
                />)}
            </div> : null)}
            <div className="dc-label-wrapper">
                <span className="dc-label">{props.text}</span>
                {props.descriptions ? <span className="dc-label dc-subnote dc-note">{props.descriptions.join(" • ")}</span> : null}
            </div>
            {props.suffix ? <props.suffix /> : (props.actions || []).map(action => <Button color={action.type} onClick={action.onClick}><action.Icon width={20} height={20} /></Button>)}
        </div>}
    </RightClickContextMenu>;
}
