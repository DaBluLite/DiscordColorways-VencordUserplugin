/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { DataStore, useState } from "../..";
import { getAutoPresets } from "../../css";
import { ModalProps } from "../../types";
import Modal from "../Modal";

export default function ({ modalProps, onChange, autoColorwayId = "" }: { modalProps: ModalProps, onChange: (autoPresetId: string) => void, autoColorwayId: string; }) {
    const [autoId, setAutoId] = useState(autoColorwayId);

    return <Modal
        modalProps={modalProps}
        title="Auto Colorway Settings"
        onFinish={({ closeModal }) => {
            DataStore.set("activeAutoPreset", autoId);
            onChange(autoId);
            closeModal();
        }}
    >
        <div className="dc-info-card" style={{ marginTop: "1em" }}>
            <strong>About the Auto Colorway</strong>
            <span>The auto colorway allows you to use your system's accent color in combination with a selection of presets that will fully utilize it.</span>
        </div>
        <span className="colorwaysModalFieldHeader">Presets:</span>
        <div className="colorways-selector">
            {Object.values(getAutoPresets()).map(autoPreset => <div
                className="discordColorway"
                aria-checked={autoId === autoPreset.id}
                onClick={() => {
                    setAutoId(autoPreset.id);
                }}>
                <svg aria-hidden="true" role="img" width="24" height="24" viewBox="0 0 24 24">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="currentColor" />
                    {autoId === autoPreset.id && <circle cx="12" cy="12" r="5" fill="currentColor" />}
                </svg>
                <span className="colorwayLabel">{autoPreset.name}</span>
            </div>)}
        </div>
    </Modal>;
}
