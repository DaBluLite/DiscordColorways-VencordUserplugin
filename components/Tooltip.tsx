/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { useEffect, useRef, useState } from "..";

export default function ({
    children,
    text,
    position = "top"
}: {
    children: (props: { onMouseEnter: (e: React.MouseEvent<HTMLDivElement, MouseEvent>, ref?: React.MutableRefObject<null>) => void; onMouseLeave: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void; onClick: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void; }) => JSX.Element,
    text: React.ReactNode,
    position?: "top" | "bottom" | "left" | "right",
}) {
    const [visible, setVisible] = useState(false);
    const [pos, setPos] = useState({ x: 0, y: 0 });
    const tooltip = useRef(null);

    function showTooltip({ currentTarget }: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        setPos((() => {
            switch (position) {
                case "right":
                    return {
                        x: currentTarget.getBoundingClientRect().x + currentTarget.offsetWidth + 8,
                        y: (currentTarget.getBoundingClientRect().y + (currentTarget.offsetHeight / 2)) - ((tooltip.current as unknown as HTMLDivElement).offsetHeight / 2)
                    };
                case "left":
                    return {
                        x: currentTarget.getBoundingClientRect().x - (tooltip.current as unknown as HTMLDivElement).offsetWidth - 8,
                        y: currentTarget.getBoundingClientRect().y + (currentTarget.offsetHeight / 2) - ((tooltip.current as unknown as HTMLDivElement).offsetHeight / 2)
                    };
                case "bottom":
                    return {
                        x: currentTarget.getBoundingClientRect().x + (currentTarget.offsetWidth / 2) - ((tooltip.current as unknown as HTMLDivElement).offsetWidth / 2),
                        y: currentTarget.getBoundingClientRect().y + (tooltip.current as unknown as HTMLDivElement).offsetHeight + 8
                    };
                case "top":
                    return {
                        x: currentTarget.getBoundingClientRect().x + (currentTarget.offsetWidth / 2) - ((tooltip.current as unknown as HTMLDivElement).offsetWidth / 2),
                        y: currentTarget.getBoundingClientRect().y - (tooltip.current as unknown as HTMLDivElement).offsetHeight - 8
                    };
                default:
                    return {
                        x: currentTarget.getBoundingClientRect().x + currentTarget.offsetWidth + 8,
                        y: (currentTarget.getBoundingClientRect().y + (currentTarget.offsetHeight / 2)) - ((tooltip.current as unknown as HTMLDivElement).offsetHeight / 2)
                    };
            }
        })());
        setVisible(true);
    }

    function onWindowUnfocused(e) {
        e = e || window.event;
        var from = e.relatedTarget || e.toElement;
        if (!from || from.nodeName === "HTML") {
            setVisible(false);
        }
    }

    useEffect(() => {
        document.addEventListener("mouseout", onWindowUnfocused);
        return () => {
            document.removeEventListener("mouseout", onWindowUnfocused);
        };
    }, []);

    return <>
        {children({
            onMouseEnter: e => showTooltip(e),
            onMouseLeave: () => setVisible(false),
            onClick: () => setVisible(false)
        })}
        <div ref={tooltip} className={`dc-tooltip dc-tooltip-${position} ${!visible ? "dc-tooltip-hidden" : ""}`} style={{
            top: `${pos.y}px`,
            left: `${pos.x}px`
        }}>
            <div className="dc-tooltip-pointer" />
            <div className="dc-tooltip-content">{text}</div>
        </div>
    </>;
}
