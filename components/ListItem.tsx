/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { useEffect, useRef, useState } from "..";
import Tooltip from "./Tooltip";

export default function ({
    children,
    tooltip,
    hasPill = false
}: {
    children: (props: { onMouseEnter: React.MouseEventHandler<HTMLDivElement>; onMouseLeave: React.MouseEventHandler<HTMLDivElement>; isActive: (e: boolean) => void, onClick: React.MouseEventHandler<HTMLDivElement>; }) => JSX.Element,
    tooltip?: JSX.Element,
    hasPill?: boolean;
}) {
    const [status, setStatus] = useState("none");
    const btn = useRef(null);

    function onWindowUnfocused(e) {
        e = e || window.event;
        var from = e.relatedTarget || e.toElement;
        if (!from || from.nodeName === "HTML") {
            setStatus("none");
        }
    }

    useEffect(() => {
        document.addEventListener("mouseout", () => onWindowUnfocused);
        return () => {
            document.removeEventListener("mouseout", onWindowUnfocused);
        };
    }, []);

    return <Tooltip text={tooltip || <></>} position="right">
        {({ onMouseEnter, onMouseLeave, onClick }) => {
            return <div ref={btn} className="dc-discordserverlist-listitem">
                {hasPill ? <div className="dc-discordserverlist-listitem-pill" data-status={status} /> : <></>}
                {children({
                    onMouseEnter: e => {
                        tooltip && onMouseEnter({ ...e, currentTarget: btn.current as unknown as EventTarget & HTMLDivElement });
                        status !== "active" ? setStatus("hover") : void 0;
                    },
                    onMouseLeave: e => {
                        tooltip && onMouseLeave(e);
                        status !== "active" ? setStatus("none") : void 0;
                    },
                    isActive: stat => setStatus(stat ? "active" : "none"),
                    onClick: e => tooltip && onClick(e)
                })}
            </div>;
        }}
    </Tooltip>;
}
