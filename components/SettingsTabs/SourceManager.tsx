/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { DataStore } from "@api/index";
import { Flex } from "@components/Flex";
import { CopyIcon, DeleteIcon } from "@components/Icons";
import { SettingsTab } from "@components/VencordSettings/shared";
import { Logger } from "@utils/Logger";
import { closeModal, ModalContent, ModalFooter, ModalHeader, ModalProps, ModalRoot, openModal } from "@utils/modal";
import { chooseFile, saveFile } from "@utils/web";
import { findByProps } from "@webpack";
import { Button, Clipboard, Forms, ScrollerThin, Text, TextInput, useEffect, useState } from "@webpack/common";
import { defaultColorwaySource, knownColorwaySources } from "userplugins/discordColorways/constants";
import { Colorway } from "userplugins/discordColorways/types";

import { DownloadIcon, ImportIcon } from "../Icons";
import Spinner from "../Spinner";

export function StoreNameModal({ modalProps, originalName, onFinish, conflicting }: { modalProps: ModalProps, originalName: string, onFinish: (newName: string) => Promise<void>, conflicting: boolean; }) {
    const [error, setError] = useState<string>();
    const [newStoreName, setNewStoreName] = useState<string>(originalName);
    return <ModalRoot {...modalProps}>
        <ModalHeader separator={false}>
            <Text variant="heading-lg/semibold" tag="h1">{conflicting ? "Duplicate Store Name" : "Give this store a name"}</Text>
        </ModalHeader>
        <ModalContent>
            {conflicting ? <Text>A store with the same name already exists. Please give a different name to the imported store:</Text> : <></>}
            <TextInput error={error} value={newStoreName} onChange={e => setNewStoreName(e)} style={{ margin: "16px 0" }} />
        </ModalContent>
        <ModalFooter>
            <Button
                style={{ marginLeft: 8 }}
                color={Button.Colors.BRAND}
                size={Button.Sizes.MEDIUM}
                look={Button.Looks.FILLED}
                onClick={async () => {
                    setError("");
                    if ((await DataStore.get("customColorways")).map(store => store.name).includes(newStoreName)) {
                        return setError("Error: Store name already exists");
                    }
                    onFinish(newStoreName);
                    modalProps.onClose();
                }}
            >
                Finish
            </Button>
            <Button
                style={{ marginLeft: 8 }}
                color={Button.Colors.PRIMARY}
                size={Button.Sizes.MEDIUM}
                look={Button.Looks.OUTLINED}
                onClick={() => modalProps.onClose()}
            >
                Cancel
            </Button>
        </ModalFooter>
    </ModalRoot>;
}

export default function () {
    const [colorwaySourceFiles, setColorwaySourceFiles] = useState<string[]>();
    const [customColorwayStores, setCustomColorwayStores] = useState<{ name: string, colorways: Colorway[]; }[]>([]);

    const { item: radioBarItem, itemFilled: radioBarItemFilled } = findByProps("radioBar");

    useEffect(() => {
        (async function () {
            setColorwaySourceFiles(await DataStore.get("colorwaySourceFiles"));
            setCustomColorwayStores(await DataStore.get("customColorways") as { name: string, colorways: Colorway[]; }[]);
        })();
    }, []);
    return <SettingsTab title="Sources">
        <Flex style={{ gap: "0", marginBottom: "8px", alignItems: "center" }}>
            <Forms.FormTitle tag="h5" style={{ marginBottom: 0, flexGrow: 1 }}>Online</Forms.FormTitle>
            <Button
                className="colorwaysSettings-colorwaySourceAction"
                innerClassName="colorwaysSettings-iconButtonInner"
                style={{ flexShrink: "0" }}
                size={Button.Sizes.SMALL}
                color={Button.Colors.TRANSPARENT}
                onClick={() => {
                    openModal(props => {
                        var colorwaySource = "";
                        return <ModalRoot {...props} className="colorwaySourceModal">
                            <ModalHeader>
                                <Text variant="heading-lg/semibold" tag="h1">
                                    Add a source:
                                </Text>
                            </ModalHeader>
                            <TextInput
                                placeholder="Enter a valid URL..."
                                onChange={e => colorwaySource = e}
                                style={{ margin: "8px", width: "calc(100% - 16px)" }}
                            />
                            <ModalFooter>
                                <Button
                                    style={{ marginLeft: 8 }}
                                    color={Button.Colors.BRAND}
                                    size={Button.Sizes.MEDIUM}
                                    look={Button.Looks.FILLED}
                                    onClick={async () => {
                                        var sourcesArr: string[] = [];
                                        const colorwaySourceFilesArr = await DataStore.get("colorwaySourceFiles");
                                        colorwaySourceFilesArr.map((source: string) => sourcesArr.push(source));
                                        if (colorwaySource !== defaultColorwaySource) {
                                            sourcesArr.push(colorwaySource);
                                        }
                                        DataStore.set("colorwaySourceFiles", sourcesArr);
                                        setColorwaySourceFiles(sourcesArr);
                                        props.onClose();
                                    }}
                                >
                                    Finish
                                </Button>
                                <Button
                                    style={{ marginLeft: 8 }}
                                    color={Button.Colors.PRIMARY}
                                    size={Button.Sizes.MEDIUM}
                                    look={Button.Looks.FILLED}
                                    onClick={() => props.onClose()}
                                >
                                    Cancel
                                </Button>
                            </ModalFooter>
                        </ModalRoot>;
                    });
                }}>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                    role="img"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24">
                    <path
                        fill="currentColor"
                        d="M20 11.1111H12.8889V4H11.1111V11.1111H4V12.8889H11.1111V20H12.8889V12.8889H20V11.1111Z"
                    />
                </svg>
                Add...
            </Button>
        </Flex>
        <ScrollerThin orientation="vertical" style={{ maxHeight: "250px" }} className="colorwaysSettings-sourceScroller">
            {colorwaySourceFiles?.map((colorwaySourceFile: string) => <div className={`${radioBarItem} ${radioBarItemFilled} colorwaysSettings-colorwaySource`}>

                {knownColorwaySources.find(o => o.url === colorwaySourceFile) ? <div className="hoverRoll">
                    <Text className="colorwaysSettings-colorwaySourceLabel hoverRoll_normal">
                        {knownColorwaySources.find(o => o.url === colorwaySourceFile)!.name} {colorwaySourceFile === defaultColorwaySource && <div className="colorways-badge">Built-In</div>}
                    </Text>
                    <Text className="colorwaysSettings-colorwaySourceLabel hoverRoll_hovered">
                        {colorwaySourceFile}
                    </Text>
                </div>
                    : <Text className="colorwaysSettings-colorwaySourceLabel">
                        {colorwaySourceFile}
                    </Text>}
                <Button
                    innerClassName="colorwaysSettings-iconButtonInner"
                    size={Button.Sizes.ICON}
                    color={Button.Colors.PRIMARY}
                    look={Button.Looks.OUTLINED}
                    onClick={() => { Clipboard.copy(colorwaySourceFile); }}
                >
                    <CopyIcon width={20} height={20} />
                </Button>
                {colorwaySourceFile !== defaultColorwaySource
                    && <>
                        <Button
                            innerClassName="colorwaysSettings-iconButtonInner"
                            size={Button.Sizes.ICON}
                            color={Button.Colors.PRIMARY}
                            look={Button.Looks.OUTLINED}
                            onClick={async () => {
                                openModal(props => <StoreNameModal conflicting={false} modalProps={props} originalName={knownColorwaySources.find(o => o.url === colorwaySourceFile)!.name || ""} onFinish={async e => {
                                    const modal = openModal(propss => <ModalRoot {...propss} className="colorwaysLoadingModal"><Spinner style={{ color: "#ffffff" }} /></ModalRoot>);
                                    const res = await fetch(colorwaySourceFile);
                                    const data = await res.json();
                                    DataStore.set("customColorways", [...await DataStore.get("customColorways"), { name: e, colorways: data.colorways || [] }]);
                                    setCustomColorwayStores(await DataStore.get("customColorways") as { name: string, colorways: Colorway[]; }[]);
                                    closeModal(modal);
                                }} />);
                            }}
                        >
                            <DownloadIcon width={20} height={20} />
                        </Button>
                        <Button
                            innerClassName="colorwaysSettings-iconButtonInner"
                            size={Button.Sizes.ICON}
                            color={Button.Colors.RED}
                            look={Button.Looks.OUTLINED}
                            onClick={async () => {
                                var sourcesArr: string[] = [...await DataStore.get("colorwaySourceFiles")];
                                DataStore.set("colorwaySourceFiles", sourcesArr.filter(source => source !== colorwaySourceFile));
                                setColorwaySourceFiles(sourcesArr.filter(source => source !== colorwaySourceFile));
                            }}
                        >
                            <DeleteIcon width={20} height={20} />
                        </Button>
                    </>}
            </div>
            )}
        </ScrollerThin>
        <Flex style={{ gap: "0", marginBottom: "8px", alignItems: "center" }}>
            <Forms.FormTitle tag="h5" style={{ marginBottom: 0, flexGrow: 1 }}>Offline</Forms.FormTitle>
            <Button
                className="colorwaysSettings-colorwaySourceAction"
                innerClassName="colorwaysSettings-iconButtonInner"
                style={{ flexShrink: "0", marginLeft: "8px" }}
                size={Button.Sizes.SMALL}
                color={Button.Colors.TRANSPARENT}
                onClick={async () => {
                    if (IS_DISCORD_DESKTOP) {
                        const [file] = await DiscordNative.fileManager.openFiles({
                            filters: [
                                { name: "DiscordColorways Offline Store", extensions: ["json"] },
                                { name: "all", extensions: ["*"] }
                            ]
                        });
                        if (file) {
                            try {
                                if ((await DataStore.get("customColorways") as { name: string, colorways: Colorway[]; }[]).map(store => store.name).includes(JSON.parse(new TextDecoder().decode(file.data)).name)) {
                                    openModal(props => <StoreNameModal conflicting modalProps={props} originalName={JSON.parse(new TextDecoder().decode(file.data)).name} onFinish={async e => {
                                        await DataStore.set("customColorways", [...await DataStore.get("customColorways"), { name: e, colorways: JSON.parse(new TextDecoder().decode(file.data)).colorways }]);
                                        setCustomColorwayStores(await DataStore.get("customColorways") as { name: string, colorways: Colorway[]; }[]);
                                    }} />);
                                } else {
                                    await DataStore.set("customColorways", [...await DataStore.get("customColorways"), JSON.parse(new TextDecoder().decode(file.data))]);
                                    setCustomColorwayStores(await DataStore.get("customColorways") as { name: string, colorways: Colorway[]; }[]);
                                }
                            } catch (err) {
                                new Logger("DiscordColorways").error(err);
                            }
                        }
                    } else {
                        const file = await chooseFile("application/json");
                        if (!file) return;

                        const reader = new FileReader();
                        reader.onload = async () => {
                            try {
                                if ((await DataStore.get("customColorways") as { name: string, colorways: Colorway[]; }[]).map(store => store.name).includes(JSON.parse(reader.result as string).name)) {
                                    openModal(props => <StoreNameModal conflicting modalProps={props} originalName={JSON.parse(reader.result as string).name} onFinish={async e => {
                                        await DataStore.set("customColorways", [...await DataStore.get("customColorways"), { name: e, colorways: JSON.parse(reader.result as string).colorways }]);
                                        setCustomColorwayStores(await DataStore.get("customColorways") as { name: string, colorways: Colorway[]; }[]);
                                    }} />);
                                } else {
                                    await DataStore.set("customColorways", [...await DataStore.get("customColorways"), JSON.parse(reader.result as string)]);
                                    setCustomColorwayStores(await DataStore.get("customColorways") as { name: string, colorways: Colorway[]; }[]);
                                }
                            } catch (err) {
                                new Logger("DiscordColorways").error(err);
                            }
                        };
                        reader.readAsText(file);
                    }
                }}
            >
                <ImportIcon width={14} height={14} />
                Import...
            </Button>
            <Button
                className="colorwaysSettings-colorwaySourceAction"
                innerClassName="colorwaysSettings-iconButtonInner"
                style={{ flexShrink: "0", marginLeft: "8px" }}
                size={Button.Sizes.SMALL}
                color={Button.Colors.TRANSPARENT}
                onClick={() => {
                    openModal(props => <StoreNameModal conflicting={false} modalProps={props} originalName="" onFinish={async e => {
                        await DataStore.set("customColorways", [...await DataStore.get("customColorways"), { name: e, colorways: [] }]);
                        setCustomColorwayStores(await DataStore.get("customColorways") as { name: string, colorways: Colorway[]; }[]);
                        props.onClose();
                    }} />);
                }}>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                    role="img"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24">
                    <path
                        fill="currentColor"
                        d="M20 11.1111H12.8889V4H11.1111V11.1111H4V12.8889H11.1111V20H12.8889V12.8889H20V11.1111Z"
                    />
                </svg>
                New...
            </Button>
        </Flex>
        <Flex flexDirection="column" style={{ gap: 0 }}>
            {getComputedStyle(document.body).getPropertyValue("--os-accent-color") ? <div className={`${radioBarItem} ${radioBarItemFilled} colorwaysSettings-colorwaySource`}>
                <Flex style={{ gap: 0, alignItems: "center", width: "100%", height: "44px" }}>
                    <Text className="colorwaysSettings-colorwaySourceLabel">OS Accent Color{" "}
                        <div className="colorways-badge">Built-In</div>
                    </Text>
                </Flex>
            </div> : <></>}
            {customColorwayStores.map(({ name: customColorwaySourceName, colorways: offlineStoreColorways }) => <div className={`${radioBarItem} ${radioBarItemFilled} colorwaysSettings-colorwaySource`}>

                <Text className="colorwaysSettings-colorwaySourceLabel">
                    {customColorwaySourceName}
                </Text>
                <Button
                    innerClassName="colorwaysSettings-iconButtonInner"
                    size={Button.Sizes.ICON}
                    color={Button.Colors.PRIMARY}
                    look={Button.Looks.OUTLINED}
                    onClick={async () => {
                        console.log(offlineStoreColorways);
                        if (IS_DISCORD_DESKTOP) {
                            DiscordNative.fileManager.saveWithDialog(JSON.stringify({ "name": customColorwaySourceName, "colorways": [...offlineStoreColorways] }), `${customColorwaySourceName.replaceAll(" ", "-").toLowerCase()}.colorways.json`);
                        } else {
                            saveFile(new File([JSON.stringify({ "name": customColorwaySourceName, "colorways": [...offlineStoreColorways] })], `${customColorwaySourceName.replaceAll(" ", "-").toLowerCase()}.colorways.json`, { type: "application/json" }));
                        }
                    }}
                >
                    <DownloadIcon width={20} height={20} />
                </Button>
                <Button
                    innerClassName="colorwaysSettings-iconButtonInner"
                    size={Button.Sizes.ICON}
                    color={Button.Colors.RED}
                    look={Button.Looks.OUTLINED}
                    onClick={async () => {
                        var sourcesArr: { name: string, colorways: Colorway[]; }[] = [];
                        const customColorwaySources = await DataStore.get("customColorways");
                        customColorwaySources.map((source: { name: string, colorways: Colorway[]; }) => {
                            if (source.name !== customColorwaySourceName) {
                                sourcesArr.push(source);
                            }
                        });
                        DataStore.set("customColorways", sourcesArr);
                        setCustomColorwayStores(sourcesArr);
                    }}
                >
                    <DeleteIcon width={20} height={20} />
                </Button>
            </div>
            )}
        </Flex>
    </SettingsTab>;
}
