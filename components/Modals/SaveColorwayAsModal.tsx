/*
 * Vencord, a Discord client mod
 * Copyright (c) 2023 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { useEffect, useReducer, UserStore, useState } from "../..";
import { useContextualState } from "../../api/Hooks";
import { openModal } from "../../api/Modals";
import { colorToHex, getHex, hexToString } from "../../api/Utils/Colors";
import { colorPickerProps, colorProps } from "../../constants";
import { Colorway, ColorwayObject, ModalProps } from "../../types";
import CPicker from "../ColorPicker";
import { PlusIcon } from "../Icons";
import Modal from "../Modal";
import NewStoreModal from "./NewStoreModal";
export default function ({
    modalProps,
    colorwayID: colorID,
    colorwayObject,
    store = ""
}: {
    modalProps: ModalProps;
    colorwayID?: string;
    colorwayObject?: ColorwayObject;
    store?: string;
}) {
    const [colors, updateColors] = useReducer((colors: {
        accent: string,
        primary: string,
        secondary: string,
        tertiary: string;
    }, action: {
        task: "accent" | "primary" | "secondary" | "tertiary" | "all",
        color?: string;
        colorObj?: {
            accent: string,
            primary: string,
            secondary: string,
            tertiary: string;
        };
    }) => {
        if (action.task === "all") {
            return { ...action.colorObj } as {
                accent: string,
                primary: string,
                secondary: string,
                tertiary: string;
            };
        } else {
            return { ...colors, [action.task as "accent" | "primary" | "secondary" | "tertiary"]: action.color } as {
                accent: string,
                primary: string,
                secondary: string,
                tertiary: string;
            };
        }
    }, colorwayObject ? colorwayObject.colors : {
        accent: "5865f2",
        primary: "313338",
        secondary: "2b2d31",
        tertiary: "1e1f22"
    });
    const [offlineColorwayStores, setOfflineColorwayStores] = useContextualState("customColorways");
    const [colorwayName, setColorwayName] = useState<string>(colorwayObject ? (colorwayObject.id as string) : "");
    const [noStoreError, setNoStoreError] = useState<boolean>(false);
    const [duplicateError, setDuplicateError] = useState<boolean>(false);
    const [storename, setStorename] = useState<string>(store);
    const [colorwayID, setColorwayID] = useState(colorID);
    const [colorwayIDError, setColorwayIDError] = useState("");

    const setColor = [
        "accent",
        "primary",
        "secondary",
        "tertiary"
    ] as ("accent" | "primary" | "secondary" | "tertiary")[];

    useEffect(() => {
        if (colorwayID) {
            if (!colorwayID.includes(",")) {
                console.error("Invalid Colorway ID");
            } else {
                colorwayID.split("|").forEach((prop: string) => {
                    if (prop.includes(",#")) {
                        prop.split(/,#/).forEach((color: string, i: number) => updateColors({ task: setColor[i], color: colorToHex(color) }));
                    }
                    if (prop.includes("n:")) {
                        setColorwayName(prop.split("n:")[1]);
                    }
                });
            }
        }
    });

    return <Modal
        modalProps={modalProps}
        title={(() => {
            if (colorwayID) return "Save Temporary";
            if (colorwayObject && !store) return "Save";
            if (colorwayObject && store) return "Edit";
            return "Create";
        })() + " Colorway"}
        onFinish={async ({ closeModal }) => {
            setNoStoreError(false);
            setDuplicateError(false);
            if (!storename && !store) {
                return setNoStoreError(true);
            }
            const customColorway: Colorway = {
                name: (colorwayName || "Colorway"),
                accent: "#" + colors.accent,
                primary: "#" + colors.primary,
                secondary: "#" + colors.secondary,
                tertiary: "#" + colors.tertiary,
                author: UserStore.getCurrentUser().username,
                authorID: UserStore.getCurrentUser().id
            };
            if (((offlineColorwayStores.find(s => s.name === storename)!.colorways || []).find(colorway => colorway.name === customColorway.name)) && !store) {
                return setDuplicateError(true);
            } else {
                setOfflineColorwayStores(stores => stores.map(s => {
                    if (s.name === storename) {
                        return { name: s.name, colorways: [...(s.colorways || []).filter(c => c.name !== (colorwayObject || { id: "" }).id), customColorway], presets: s.presets || [] };
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
            }] : []),
            {
                text: "Copy Current Colors",
                type: "brand",
                action: () => {
                    updateColors({
                        task: "all", colorObj: {
                            primary: getHex(
                                getComputedStyle(
                                    document.body
                                ).getPropertyValue("--primary-600")
                            ).split("#")[1],
                            secondary: getHex(
                                getComputedStyle(
                                    document.body
                                ).getPropertyValue("--primary-630")
                            ).split("#")[1],
                            tertiary: getHex(
                                getComputedStyle(
                                    document.body
                                ).getPropertyValue("--primary-700")
                            ).split("#")[1],
                            accent: getHex(
                                getComputedStyle(
                                    document.body
                                ).getPropertyValue("--brand-500")
                            ).split("#")[1]
                        }
                    });
                }
            },
            {
                text: "Enter Colorway ID",
                type: "primary",
                action: () => openModal((props: any) => <Modal
                    modalProps={props}
                    onFinish={({ closeModal }) => {
                        setColorwayIDError("");
                        if (!colorwayID) {
                            return setColorwayIDError("Please enter a Colorway ID");
                        } else if (!hexToString(colorwayID).includes(",")) {
                            return setColorwayIDError("Invalid Colorway ID");
                        } else {
                            hexToString(colorwayID).split(/,#/).forEach((color: string, i: number) => updateColors({ task: setColor[i], color: colorToHex(color) }));
                            setColorwayIDError("");
                            closeModal();
                        }
                    }}
                    title="Enter Colorway ID"
                >
                    <span className={`dc-field-header${colorwayIDError ? " dc-field-header-error" : ""}`} style={{ marginBottom: "4px" }}>Colorway ID{colorwayIDError ? <span className="dc-field-header-errormsg">
                        <span className="dc-field-header-errordiv">-</span>
                        {colorwayIDError}
                    </span> : null}</span>
                    <input
                        type="text"
                        className="dc-textbox"
                        placeholder="Enter Colorway ID"
                        onInput={({ currentTarget: { value } }) => setColorwayID(value)}
                    />
                </Modal>)
            }
        ]}
    >
        <div style={{ display: "flex", gap: "20px" }}>
            <div className="dc-color-swatch" style={{ width: "100px", height: "100px" }}>
                {colorProps.map(presetColor => {
                    return <CPicker
                        color={parseInt(colors[presetColor.id], 16)}
                        onChange={(color: number) => {
                            let hexColor = color.toString(16);
                            while (hexColor.length < 6) {
                                hexColor = "0" + hexColor;
                            }
                            updateColors({ task: presetColor.id as "accent" | "primary" | "secondary" | "tertiary", color: hexColor });
                        }}
                        {...colorPickerProps}
                        onClose={() => { }}
                    >
                        {({ onClick }) => <div className="colorwaysSaveAsSwatch" style={{ backgroundColor: "#" + colors[presetColor.id] }} onClick={onClick} />}
                    </CPicker>;
                })}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px", width: "100%" }}>
                <span style={{ marginTop: "8px" }} className={`dc-field-header${duplicateError ? " dc-field-header-error" : ""}`}>Name{duplicateError ? <span className="dc-field-header-errormsg">
                    <span className="dc-field-header-errordiv">-</span>
                    A colorway with this name already exists
                </span> : <></>}</span>
                <input
                    type="text"
                    className="dc-textbox"
                    placeholder="Give your Colorway a name"
                    value={colorwayName}
                    autoFocus
                    onInput={e => setColorwayName(e.currentTarget.value)}
                />
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
                                <span className="dc-label dc-subnote dc-note">{(store.colorways || []).length} colorways • {(store.presets || []).length} presets</span>
                            </div>
                        </div>)}
                    </div>
                </> : null}
            </div>
        </div>
    </Modal>;
}

