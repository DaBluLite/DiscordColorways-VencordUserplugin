/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { FocusLock, useRef } from "..";
import { ModalProps } from "../types";

export default function ({
    modalProps,
    onFinish,
    title,
    children,
    type = "normal",
    confirmMsg = "Finish",
    additionalButtons = [],
    cancelMsg = "Cancel",
    style = {},
    divider = true,
    footer
}: {
    modalProps: ModalProps,
    onFinish?: (props: { closeModal: typeof modalProps.onClose; }) => void,
    title: React.ReactNode,
    children: React.ReactNode,
    style?: React.CSSProperties,
    confirmMsg?: string,
    type?: "normal" | "danger",
    divider?: boolean,
    additionalButtons?: {
        text: string,
        action: ((props: { closeModal: typeof modalProps.onClose; }) => any),
        type: "primary" | "brand" | "danger";
    }[],
    cancelMsg?: string,
    footer?: React.ReactNode;
}) {
    const cont = useRef(null);

    return <FocusLock containerRef={cont}>
        <div style={style} ref={cont} className={`dc-modal ${modalProps.transitionState === 2 ? "closing" : ""} ${modalProps.transitionState === 4 ? "hidden" : ""}`}>
            <h2 className="dc-modal-header" style={!divider ? { boxShadow: "none" } : {}}>
                {title}
            </h2>
            <div className="dc-modal-content" style={{ minWidth: "500px" }}>
                {children}
            </div>
            <div className="dc-modal-footer">
                {footer || <>
                    {onFinish ? <button
                        className={"dc-button dc-button-md" + (type === "danger" ? " dc-button-danger" : " dc-button-brand")}
                        onClick={() => onFinish({ closeModal: modalProps.onClose })}
                    >
                        {confirmMsg}
                    </button> : null}
                    {additionalButtons.map(({ type, action, text }, i: number) => <button
                        key={i}
                        className={`dc-button dc-button-md dc-button-${type}`}
                        onClick={() => action({ closeModal: modalProps.onClose })}
                    >
                        {text}
                    </button>)}
                    <button
                        className={"dc-button dc-button-md dc-button-primary"}
                        onClick={() => modalProps.onClose()}
                    >
                        {cancelMsg}
                    </button>
                </>}
            </div>
        </div>
    </FocusLock>;
}
