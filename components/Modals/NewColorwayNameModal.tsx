/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { useState } from "../..";
import { Colorway, ModalProps } from "../../types";
import Modal from "../Modal";

export default function ({ modalProps, onSelected, storeToModify }: { modalProps: ModalProps, onSelected: (e: string) => void, storeToModify: { name: string, id?: string, colorways: Colorway[]; }; }) {
    const [errorMsg, setErrorMsg] = useState<string>();
    const [newColorwayName, setNewColorwayName] = useState("");

    return <Modal
        modalProps={modalProps}
        title="Select new name"
        confirmMsg="Finish"
        type="normal"
        onFinish={({ closeModal }) => {
            setErrorMsg("");
            if (storeToModify.colorways.map(colorway => colorway.name).includes(newColorwayName)) {
                return setErrorMsg("Name already exists");
            }
            onSelected(newColorwayName);
            closeModal();
        }}
    >
        <span className={`colorwaysModalFieldHeader${errorMsg ? " colorwaysModalFieldHeader-error" : ""}`}>Name{errorMsg ? <span className="colorwaysModalFieldHeader-errorMsg">
            <span className="colorwaysModalFieldHeader-errorMsgSeparator">-</span>
            {errorMsg}
        </span> : <></>}</span>
        <input
            type="text"
            className="colorwayTextBox"
            value={newColorwayName}
            onInput={({ currentTarget: { value } }) => setNewColorwayName(value)}
            placeholder="Enter valid colorway name"
        />
    </Modal>;
}
