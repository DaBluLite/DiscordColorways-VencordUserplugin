/*
 * Vencord, a Discord client mod
 * Copyright (c) 2023 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { UserStore, useState } from "../..";
import { useContextualState } from "../../api/Hooks";
import { openModal } from "../../api/Modals";
import { colorVals, functs } from "../../constants";
import { ModalProps, Preset, PresetCondition, PresetObject } from "../../types";
import CodeInput from "../CodeInput";
import { PlusIcon } from "../Icons";
import Modal from "../Modal";
import NewStoreModal from "./NewStoreModal";
import PresetConditionModal from "./PresetConditionModal";
export default function ({
    modalProps,
    presetObject,
    store = ""
}: {
    modalProps: ModalProps;
    presetObject?: PresetObject;
    store?: string;
}) {
    const [CSS, setCSS] = useState(presetObject ? presetObject.css : "");
    const [offlineColorwayStores, setOfflineColorwayStores] = useContextualState("customColorways");
    const [colorwayName, setColorwayName] = useState<string>(presetObject ? (presetObject.id as string) : "");
    const [noStoreError, setNoStoreError] = useState<boolean>(false);
    const [noCSSError, setNoCSSError] = useState(false);
    const [duplicateError, setDuplicateError] = useState<boolean>(false);
    const [storename, setStorename] = useState<string>(store);
    const [conditions, setConditions] = useState<PresetCondition[]>(presetObject ? (presetObject.conditions || []) : []);

    return <Modal
        modalProps={modalProps}
        title={(() => {
            if (presetObject && !store) return "Save";
            if (presetObject && store) return "Edit";
            return "Create";
        })() + " Preset"}
        onFinish={async ({ closeModal }) => {
            setNoStoreError(false);
            setDuplicateError(false);
            setNoCSSError(false);
            if (!storename) {
                return setNoStoreError(true);
            }
            if (!CSS) {
                return setNoCSSError(true);
            }
            const customPreset: Preset = {
                name: (colorwayName || "Preset"),
                author: UserStore.getCurrentUser().username,
                css: CSS,
                conditions: conditions,
                sourceType: "offline",
                source: store || storename
            };
            if ((offlineColorwayStores.find(s => s.name === storename) && (offlineColorwayStores.find(s => s.name === storename)!.presets || []).find(preset => preset.name === customPreset.name)) && !store) {
                return setDuplicateError(true);
            } else {
                setOfflineColorwayStores(stores => stores.map(s => {
                    if (s.name === storename) {
                        return { name: s.name, presets: [...(s.presets || []).filter(p => p.name !== customPreset.name), customPreset], colorways: s.colorways || [] };
                    }
                    return s;
                }));
            }
            closeModal();
        }}
        additionalButtons={[
            ...(!store ? [{
                text: "Create New Store...",
                type: "brand" as "brand",
                action: () => openModal(props => <NewStoreModal
                    modalProps={props}
                    offlineOnly
                    onOffline={async ({ name }) => {
                        setOfflineColorwayStores(prev => [...prev, { name, presets: [], colorways: [] }]);
                    }} />)
            }] : [])
        ]}
    >
        <span style={{ marginTop: "8px" }} className={`dc-field-header${duplicateError ? " dc-field-header-error" : ""}`}>Name{duplicateError ? <span className="dc-field-header-errormsg">
            <span className="dc-field-header-errordiv">-</span>
            A preset with this name already exists
        </span> : <></>}</span>
        <input
            type="text"
            className="dc-textbox"
            placeholder="Give your preset a name"
            value={colorwayName}
            autoFocus
            onInput={e => setColorwayName(e.currentTarget.value)}
        />
        <span style={{ marginTop: "8px" }} className={`dc-field-header${noCSSError ? " dc-field-header-error" : ""}`}>CSS{noCSSError ? <span className="dc-field-header-errormsg">
            <span className="dc-field-header-errordiv">-</span>
            CSS cannot be empty
        </span> : <></>}</span>
        <CodeInput lang="css" onChange={setCSS} value={CSS} />
        <span style={{ marginTop: "8px" }} className="dc-field-header">Conditions</span>
        <div className="dc-selector" style={{ gridTemplateColumns: "100%" }}>
            {conditions.map(({ if: colorValue, is, than, onCondition, onConditionElse }, i) => <div
                className="dc-colorway"
                onClick={() => {
                    openModal(props => <PresetConditionModal modalProps={props} onCondition={onCondition} onConditionElse={onConditionElse} is={is} colorValue={colorValue} than={Number(than)} onConditionFinish={newCondition => {
                        setConditions(conds => {
                            const arr = [...conds];
                            arr[i] = newCondition;
                            return arr;
                        });
                    }} />);
                }}>
                <div className="dc-label-wrapper">
                    <span className="dc-label">{colorVals.find(cv => cv.value === colorValue)!.name} {functs.find(cf => cf.value === is)!.name} {than}</span>
                </div>
            </div>)}
            <div
                className="dc-colorway"
                onClick={() => {
                    openModal(props => <PresetConditionModal modalProps={props} onConditionFinish={newCondition => {
                        setConditions(conds => ([...conds, newCondition]));
                    }} />);
                }}>
                <div className="dc-label-wrapper">
                    <span className="dc-label">Add new condition</span>
                </div>
            </div>
        </div>
        {!store ? <>
            {!offlineColorwayStores.length ? <button
                className="dc-button dc-button-primary"
                style={{ marginTop: "8px" }}
                onClick={() => {
                    openModal(props => <NewStoreModal
                        modalProps={props}
                        offlineOnly
                        onOffline={async ({ name }) => {
                            setOfflineColorwayStores(prev => [...prev, { name, presets: [], colorways: [] }]);
                        }} />);
                }}
            >
                <PlusIcon width={14} height={14} style={{ boxSizing: "content-box" }} />
                Create new store...
            </button> : <span style={{ marginTop: "8px" }} className={`dc-field-header${noStoreError ? " dc-field-header-error" : ""}`}>Source{noStoreError ? <span className="dc-field-header-errormsg">
                <span className="dc-field-header-errordiv">-</span>
                No store selected
            </span> : <></>}</span>}
            <div className="dc-selector">
                {offlineColorwayStores.map(store => <div
                    className="dc-colorway"
                    aria-checked={storename === store.name}
                    onClick={() => {
                        setStorename(store.name);
                    }}>
                    <svg aria-hidden="true" role="img" width="24" height="24" viewBox="0 0 24 24">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="currentColor" />
                        {storename === store.name && <circle cx="12" cy="12" r="5" className="radioIconForeground-3wH3aU" fill="currentColor" />}
                    </svg>
                    <div className="dc-label-wrapper">
                        <span className="dc-label">{store.name}</span>
                        <span className="dc-label dc-subnote dc-note">{(store.presets || []).length} presets</span>
                    </div>
                </div>)}
            </div>
        </> : null}
    </Modal>;
}

