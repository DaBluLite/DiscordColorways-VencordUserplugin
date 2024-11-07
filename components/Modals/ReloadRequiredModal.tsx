/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { ModalProps } from "../../types";
import Modal from "../Modal";

export default function ({ modalProps }: { modalProps: ModalProps; }) {
    return <Modal
        modalProps={modalProps}
        title="Restart required!"
        confirmMsg="Reload"
        onFinish={() => location.reload()}
    >
        Reload Discord to reset/import settings to DiscordColorways
    </Modal>;
}
