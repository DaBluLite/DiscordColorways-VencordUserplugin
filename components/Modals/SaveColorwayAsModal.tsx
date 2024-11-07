/*
 * Vencord, a Discord client mod
 * Copyright (c) 2023 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { DataStore, openModal, PluginProps, useEffect, useReducer, UserStore, useState } from "../..";
import { colorPickerProps, colorProps, knownThemeVars } from "../../constants";
import { setContext } from "../../contexts";
import { Colorway, ColorwayObject, ModalProps } from "../../types";
import { colorToHex, getHex, hexToString } from "../../utils";
import { updateRemoteSources } from "../../wsClient";
import CPicker from "../ColorPicker";
import { PlusIcon } from "../Icons";
import Modal from "../Modal";
import ConflictingColorsModal from "./ConflictingColorsModal";
import DuplicateColorwayModal from "./DuplicateColorwayModal";
import InputColorwayIdModal from "./InputColorwayIdModal";
import NewStoreModal from "./NewStoreModal";
export default function ({
    modalProps,
    loadUI = () => { },
    colorwayID,
    colorwayObject,
    store
}: {
    modalProps: ModalProps;
    loadUI?: () => void;
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
    const [offlineColorwayStores, setOfflineColorwayStores] = useState<{ name: string, colorways: Colorway[], id?: string; }[]>([]);
    const [colorwayName, setColorwayName] = useState<string>(colorwayObject ? (colorwayObject.id as string) : "");
    const [noStoreError, setNoStoreError] = useState<boolean>(false);
    const [storename, setStorename] = useState<string>("");

    const setColor = [
        "accent",
        "primary",
        "secondary",
        "tertiary"
    ] as ("accent" | "primary" | "secondary" | "tertiary")[];

    useEffect(() => {
        (async function () {
            setOfflineColorwayStores(await DataStore.get("customColorways") as { name: string, colorways: Colorway[], id?: string; }[]);
        })();
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
            if (!storename) {
                return setNoStoreError(true);
            }
            const customColorway: Colorway = {
                name: (colorwayName || "Colorway"),
                accent: "#" + colors.accent,
                primary: "#" + colors.primary,
                secondary: "#" + colors.secondary,
                tertiary: "#" + colors.tertiary,
                author: UserStore.getCurrentUser().username,
                authorID: UserStore.getCurrentUser().id,
                CSSVersion: PluginProps.CSSVersion
            };
            const oldStores = (await DataStore.get("customColorways") as { name: string, colorways: Colorway[], id?: string; }[]);
            const storeToModify = (await DataStore.get("customColorways") as { name: string, colorways: Colorway[], id?: string; }[]).filter(source => source.name === store || storename)[0];
            const newStore = { name: storeToModify.name, colorways: [...storeToModify.colorways, customColorway] };
            if ((storeToModify.colorways.map(colorway => colorway.name).includes(customColorway.name)) && !store) {
                return openModal(props => <DuplicateColorwayModal
                    colorway={customColorway}
                    modalProps={props as unknown as ModalProps}
                    oldStores={oldStores}
                    storeToModify={storeToModify}
                    storename={storename}
                    onFinish={() => {
                        closeModal();
                        loadUI();
                        updateRemoteSources();
                    }}
                />);
            }
            setContext("customColorways", [...oldStores!.filter(source => source.name !== storename), newStore]);
            closeModal();
            loadUI();
            updateRemoteSources();
        }}
        additionalButtons={[
            ...(!store ? [{
                text: "Create New Store...",
                type: "brand" as "brand",
                action: () => openModal(props => <NewStoreModal
                    modalProps={props}
                    offlineOnly
                    onOffline={async ({ name }) => {
                        setOfflineColorwayStores(setContext("customColorways", [...offlineColorwayStores, { name, colorways: [] }]) as { name: string, colorways: Colorway[]; }[]);
                    }} />)
            }] : []),
            {
                text: "Copy Current Colors",
                type: "brand",
                action: () => {
                    function setAllColors({ accent, primary, secondary, tertiary }: { accent: string, primary: string, secondary: string, tertiary: string; }) {
                        updateColors({
                            task: "all",
                            colorObj: {
                                accent: accent.split("#")[1],
                                primary: primary.split("#")[1],
                                secondary: secondary.split("#")[1],
                                tertiary: tertiary.split("#")[1]
                            }
                        });
                    }
                    var copiedThemes = ["Discord"];
                    Object.values(knownThemeVars).map((theme: { variable: string; variableType?: string; }, i: number) => {
                        if (getComputedStyle(document.body).getPropertyValue(theme.variable)) {
                            copiedThemes.push(Object.keys(knownThemeVars)[i]);
                        }
                    });
                    if (copiedThemes.length > 1) {
                        openModal(props => <ConflictingColorsModal modalProps={props} onFinished={setAllColors} />);
                    } else {
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
                }
            },
            {
                text: "Enter Colorway ID",
                type: "primary",
                action: () => openModal((props: any) => <InputColorwayIdModal modalProps={props} onColorwayId={colorwayID => {
                    hexToString(colorwayID).split(/,#/).forEach((color: string, i: number) => updateColors({ task: setColor[i], color: colorToHex(color) }));
                }} />)
            }
        ]}
    >
        <div style={{ display: "flex", gap: "20px" }}>
            <div className="colorwayCreator-colorPreviews">
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
                <span className="colorwaysModalFieldHeader">Name</span>
                <input
                    type="text"
                    className="colorwayTextBox"
                    placeholder="Give your Colorway a name"
                    value={colorwayName}
                    autoFocus
                    onInput={e => setColorwayName(e.currentTarget.value)}
                />
                {!store ? <>
                    {!offlineColorwayStores.length ? <button
                        className="colorwaysPillButton colorwaysPillButton-primary"
                        style={{ marginTop: "8px" }}
                        onClick={() => {
                            openModal(props => <NewStoreModal
                                modalProps={props}
                                offlineOnly
                                onOffline={async ({ name }) => {
                                    setOfflineColorwayStores(setContext("customColorways", [...offlineColorwayStores, { name, colorways: [] }]) as { name: string, colorways: Colorway[]; }[]);
                                }} />);
                        }}
                    >
                        <PlusIcon width={14} height={14} style={{ boxSizing: "content-box" }} />
                        Create new store...
                    </button> : <span style={{ marginTop: "8px" }} className={`colorwaysModalFieldHeader${noStoreError ? " colorwaysModalFieldHeader-error" : ""}`}>Source{noStoreError ? <span className="colorwaysModalFieldHeader-errorMsg">
                        <span className="colorwaysModalFieldHeader-errorMsgSeparator">-</span>
                        No store selected
                    </span> : <></>}</span>}
                    <div className="colorways-selector">
                        {offlineColorwayStores.map(store => <div
                            className="discordColorway"
                            aria-checked={storename === store.name}
                            onClick={() => {
                                setStorename(store.name);
                            }}>
                            <svg aria-hidden="true" role="img" width="24" height="24" viewBox="0 0 24 24">
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="currentColor" />
                                {storename === store.name && <circle cx="12" cy="12" r="5" className="radioIconForeground-3wH3aU" fill="currentColor" />}
                            </svg>
                            <div className="colorwayLabelContainer">
                                <span className="colorwayLabel">{store.name}</span>
                                <span className="colorwayLabel colorwayLabelSubnote colorwaysNote">{store.colorways.length} colorways</span>
                            </div>
                        </div>)}
                    </div>
                </> : null}
            </div>
        </div>
    </Modal>;
}

