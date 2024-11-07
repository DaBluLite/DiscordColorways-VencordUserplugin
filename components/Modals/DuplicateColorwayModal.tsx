/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { DataStore, openModal } from "../..";
import { Colorway, ModalProps } from "../../types";
import Modal from "../Modal";
import NewColorwayNameModal from "./NewColorwayNameModal";

export default function ({ modalProps, onFinish, oldStores, storeToModify, colorway, storename }: { modalProps: ModalProps, onFinish: () => void, oldStores: { name: string, id?: string, colorways: Colorway[]; }[], storeToModify: { name: string, id?: string, colorways: Colorway[]; }, colorway: Colorway, storename: string; }) {
    return <Modal
        modalProps={modalProps}
        cancelMsg="Select different store"
        title="Duplicate Colorway"
        confirmMsg="Rename"
        onFinish={({ closeModal }) => openModal(propss => <NewColorwayNameModal
            storeToModify={storeToModify}
            modalProps={propss}
            onSelected={e => {
                const newStore = { name: storeToModify.name, colorways: [...storeToModify.colorways, { ...colorway, name: e }] };
                DataStore.set("customColorways", [...oldStores!.filter(source => source.name !== storename), newStore]);
                closeModal();
                onFinish();
            }} />)
        }
        additionalButtons={[
            {
                text: "Overwrite",
                type: "danger",
                action: ({ closeModal }) => {
                    openModal(propss => <Modal
                        modalProps={propss}
                        onFinish={({ closeModal: closeModall }) => {
                            const newStore = { name: storeToModify.name, colorways: [...storeToModify.colorways.filter(colorwayy => colorwayy.name !== colorway.name), colorway] };
                            DataStore.set("customColorways", [...oldStores!.filter(source => source.name !== storename), newStore]);
                            modalProps.onClose();
                            closeModal();
                            closeModall();
                            onFinish();
                        }}
                        title="Overwrite Colorway"
                        type="danger"
                        confirmMsg="Overwrite"
                    >
                        Overwrite duplicate colorway? This action cannot be undone!
                    </Modal>);
                }
            }
        ]}
    >
        <span className="colorwaysModalSectionHeader">A colorway with the same name was found in this store, what do you want to do?</span>
    </Modal>;
}
