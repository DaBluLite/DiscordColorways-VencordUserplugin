/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { DataStore } from "@api/index";
import { Flex } from "@components/Flex";
import { CopyIcon } from "@components/Icons";
import { SettingsTab } from "@components/VencordSettings/shared";
import { ModalFooter, ModalHeader, ModalRoot, openModal } from "@utils/modal";
import { findByProps } from "@webpack";
import { Button, Clipboard, ScrollerThin, Text, TextInput, useEffect, useState } from "@webpack/common";
import { defaultColorwaySource, knownColorwaySources } from "userplugins/discordColorways/constants";

import { CloseIcon } from "../Icons";

export default function () {
    const [colorwaySourceFiles, setColorwaySourceFiles] = useState<string[]>();

    const { item: radioBarItem, itemFilled: radioBarItemFilled } = findByProps("radioBar");

    useEffect(() => {
        (async function () {
            const colorwaySourceFiless = await DataStore.get("colorwaySourceFiles");
            setColorwaySourceFiles(colorwaySourceFiless);
        })();
    }, []);
    return <SettingsTab title="Sources">
        <Flex style={{ gap: "0", marginBottom: "8px" }}>
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
                Add a source...
            </Button>
        </Flex>
        <ScrollerThin orientation="vertical" style={{ maxHeight: "250px" }} className="colorwaysSettings-sourceScroller">
            {getComputedStyle(document.body).getPropertyValue("--os-accent-color") ? <div className={`${radioBarItem} ${radioBarItemFilled} colorwaysSettings-colorwaySource`}>
                <Text className="colorwaysSettings-colorwaySourceLabel">OS Accent Color <div className="colorways-badge">Built-In</div></Text>
            </div> : <></>}
            {colorwaySourceFiles?.map((colorwaySourceFile: string) => <div className={`${radioBarItem} ${radioBarItemFilled} colorwaysSettings-colorwaySource`}>
                {knownColorwaySources.find(o => o.url === colorwaySourceFile) ? <div className="hoverRoll">
                    <Text className="colorwaysSettings-colorwaySourceLabel hoverRoll_normal">
                        {knownColorwaySources.find(o => o.url === colorwaySourceFile)!.name} {colorwaySourceFile === defaultColorwaySource && <div className="colorways-badge">DEFAULT</div>}
                    </Text>
                    <Text className="colorwaysSettings-colorwaySourceLabel hoverRoll_hovered">
                        {colorwaySourceFile}
                    </Text>
                </div>
                    : <Text className="colorwaysSettings-colorwaySourceLabel">
                        {colorwaySourceFile}
                    </Text>}
                {colorwaySourceFile !== defaultColorwaySource
                    && <Button
                        innerClassName="colorwaysSettings-iconButtonInner"
                        size={Button.Sizes.ICON}
                        color={Button.Colors.PRIMARY}
                        look={Button.Looks.OUTLINED}
                        onClick={async () => {
                            var sourcesArr: string[] = [];
                            const colorwaySourceFilesArr = await DataStore.get("colorwaySourceFiles");
                            colorwaySourceFilesArr.map((source: string) => {
                                if (source !== colorwaySourceFile) {
                                    sourcesArr.push(source);
                                }
                            });
                            DataStore.set("colorwaySourceFiles", sourcesArr);
                            setColorwaySourceFiles(sourcesArr);
                        }}
                    >
                        <CloseIcon width={20} height={20} />
                    </Button>}
                <Button
                    innerClassName="colorwaysSettings-iconButtonInner"
                    size={Button.Sizes.ICON}
                    color={Button.Colors.PRIMARY}
                    look={Button.Looks.OUTLINED}
                    onClick={() => { Clipboard.copy(colorwaySourceFile); }}
                >
                    <CopyIcon width={20} height={20} />
                </Button>
            </div>
            )}
        </ScrollerThin>
    </SettingsTab>;
}
