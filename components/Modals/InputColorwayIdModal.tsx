/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { useState } from "../..";
import { ModalProps } from "../../types";
import { hexToString } from "../../utils";
import Modal from "../Modal";

export default function ({ modalProps, onColorwayId }: { modalProps: ModalProps, onColorwayId: (colorwayID: string) => void; }) {
    const [colorwayID, setColorwayID] = useState<string>("");
    const [error, setError] = useState("");

    return <Modal
        modalProps={modalProps}
        onFinish={({ closeModal }) => {
            if (!colorwayID) {
                return setError("Please enter a Colorway ID");
            } else if (!hexToString(colorwayID).includes(",")) {
                return setError("Invalid Colorway ID");
            } else {
                onColorwayId(colorwayID);
                closeModal();
            }
        }}
        title="Enter Colorway ID"
    >
        <span className={`colorwaysModalFieldHeader${error ? " colorwaysModalFieldHeader-error" : ""}`} style={{ marginBottom: "4px" }}>Colorway ID{error ? <span className="colorwaysModalFieldHeader-errorMsg">
            <span className="colorwaysModalFieldHeader-errorMsgSeparator">-</span>
            {error}
        </span> : null}</span>
        <input
            type="text"
            className="colorwayTextBox"
            placeholder="Enter Colorway ID"
            onInput={({ currentTarget: { value } }) => setColorwayID(value)}
        />
    </Modal>;
}
