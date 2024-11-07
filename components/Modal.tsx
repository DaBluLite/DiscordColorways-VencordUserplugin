/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { FluxDispatcher, FluxEvents, FocusLock, useEffect, useRef, useState } from "..";
import { contexts } from "../contexts";
import { ModalProps } from "../types";

export default function ({ modalProps, onFinish, title, children, type = "normal", confirmMsg = "Finish", additionalButtons = [], cancelMsg = "Cancel" }: { modalProps: ModalProps, onFinish: (props: { closeModal: typeof modalProps.onClose; }) => void, title: string, children: React.ReactNode, confirmMsg?: string, type?: "normal" | "danger", additionalButtons?: { text: string, action: ((props: { closeModal: typeof modalProps.onClose; }) => any), type: "primary" | "brand" | "danger"; }[], cancelMsg?: string; }) {
    const [theme, setTheme] = useState(contexts.colorwaysPluginTheme);
    const [forceVR, setForceVR] = useState(contexts.colorwaysForceVR);
    const cont = useRef(null);

    useEffect(() => {
        FluxDispatcher.subscribe("COLORWAYS_UPDATE_THEME" as FluxEvents, ({ theme }) => setTheme(theme));
        FluxDispatcher.subscribe("COLORWAYS_UPDATE_FORCE_VR" as FluxEvents, ({ enabled }) => setForceVR(enabled));

        return () => {
            FluxDispatcher.unsubscribe("COLORWAYS_UPDATE_THEME" as FluxEvents, ({ theme }) => setTheme(theme));
            FluxDispatcher.unsubscribe("COLORWAYS_UPDATE_FORCE_VR" as FluxEvents, ({ enabled }) => setForceVR(enabled));
        };
    }, []);

    return <FocusLock containerRef={cont}>
        <div className={forceVR ? "visual-refresh" : ""} style={{ display: "contents" }}>
            <div ref={cont} className={`colorwaysModal ${modalProps.transitionState === 2 ? "closing" : ""} ${modalProps.transitionState === 4 ? "hidden" : ""}`} data-theme={theme}>
                <h2 className="colorwaysModalHeader">
                    {title}
                </h2>
                <div className="colorwaysModalContent" style={{ minWidth: "500px" }}>
                    {children}
                </div>
                <div className="colorwaysModalFooter">
                    <button
                        className={"colorwaysPillButton colorwaysPillButton-md" + (type === "danger" ? " colorwaysPillButton-danger" : " colorwaysPillButton-brand")}
                        onClick={() => onFinish({ closeModal: modalProps.onClose })}
                    >
                        {confirmMsg}
                    </button>
                    {additionalButtons.map(({ type, action, text }) => <button
                        className={`colorwaysPillButton colorwaysPillButton-md${type === "primary" ? " colorwaysPillButton-outlined" : ""} colorwaysPillButton-${type}`}
                        onClick={() => action({ closeModal: modalProps.onClose })}
                    >
                        {text}
                    </button>)}
                    <button
                        className={"colorwaysPillButton colorwaysPillButton-md colorwaysPillButton-outlined colorwaysPillButton-primary"}
                        onClick={() => modalProps.onClose()}
                    >
                        {cancelMsg}
                    </button>
                </div>
            </div>
        </div>
    </FocusLock>;
}
