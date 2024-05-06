/*
 * Vencord, a Discord client mod
 * Copyright (c) 2023 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import * as DataStore from "@api/DataStore";
import { Flex } from "@components/Flex";
import {
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalProps,
    ModalRoot,
    openModal,
} from "@utils/modal";
import { findComponentByCodeLazy } from "@webpack";
import { Button, Clipboard, Forms, Text, Toasts, UserStore, useState, useStateFromStores } from "@webpack/common";

import { ColorwayCSS } from "..";
import { generateCss, pureGradientBase } from "../css";
import { Colorway } from "../types";
import { colorToHex, stringToHex } from "../utils";
import SaveColorwayModal from "./SaveColorwayModal";
import ThemePreviewCategory from "./ThemePreview";

const UserSummaryItem = findComponentByCodeLazy("defaultRenderUser", "showDefaultAvatarsForNullUsers");

export default function ({
    modalProps,
    colorwayProps,
    offlineSourceName,
    loadUIProps
}: {
    modalProps: ModalProps;
    colorwayProps: Colorway;
    offlineSourceName?: string;
    loadUIProps: () => Promise<void>;
}) {
    const colors: string[] = colorwayProps.colors || [
        "accent",
        "primary",
        "secondary",
        "tertiary",
    ];
    const [collapsedCSS, setCollapsedCSS] = useState(true);
    const profile = useStateFromStores([UserStore], () => UserStore.getUser(colorwayProps.authorID));
    return <ModalRoot {...modalProps} className="colorwayCreator-modal">
        <ModalHeader>
            <Text variant="heading-lg/semibold" tag="h1" style={{ marginRight: "auto" }}>
                Colorway Details: {colorwayProps.name}
            </Text>
            <ModalCloseButton onClick={() => modalProps.onClose()} />
        </ModalHeader>
        <ModalContent>
            <div className="colorwayInfo-wrapper">
                <div className="colorwayInfo-colorSwatches">
                    {colors.map(color => <div
                        className="colorwayInfo-colorSwatch"
                        style={{ backgroundColor: colorwayProps[color] }}
                        onClick={() => {
                            Clipboard.copy(colorwayProps[color]);
                            Toasts.show({
                                message: "Copied color successfully",
                                type: 1,
                                id: "copy-colorway-color-notify",
                            });
                        }}
                    />)}
                </div>
                <div className="colorwayInfo-row colorwayInfo-author">
                    <Flex style={{ gap: "10px", width: "100%", alignItems: "center" }}>
                        <Forms.FormTitle style={{ marginBottom: 0, width: "100%" }}>Properties:</Forms.FormTitle>
                        <UserSummaryItem
                            users={[profile]}
                            guildId={undefined}
                            renderIcon={false}
                            showDefaultAvatarsForNullUsers
                            size={32}
                            showUserPopout
                        />
                        <Button
                            color={Button.Colors.PRIMARY}
                            size={Button.Sizes.MEDIUM}
                            look={Button.Looks.OUTLINED}
                            style={{ flex: "0 0 auto" }}
                            onClick={() => {
                                const colorwayIDArray = `${colorwayProps.accent},${colorwayProps.primary},${colorwayProps.secondary},${colorwayProps.tertiary}`;
                                const colorwayID = stringToHex(colorwayIDArray);
                                Clipboard.copy(colorwayID);
                                Toasts.show({
                                    message: "Copied Colorway ID Successfully",
                                    type: 1,
                                    id: "copy-colorway-id-notify",
                                });
                            }}
                        >
                            Copy Colorway ID
                        </Button>
                        {offlineSourceName !== (null || "") && <Button
                            color={Button.Colors.RED}
                            size={Button.Sizes.MEDIUM}
                            look={Button.Looks.FILLED}
                            style={{ flex: "0 0 auto" }}
                            onClick={async () => {
                                const oldStores = (await DataStore.get("customColorways") as { name: string, colorways: Colorway[], id?: string; }[]).filter(source => source.name !== offlineSourceName);
                                const storeToModify = (await DataStore.get("customColorways") as { name: string, colorways: Colorway[], id?: string; }[]).filter(source => source.name === offlineSourceName)[0];
                                const newStore = { name: storeToModify.name, colorways: storeToModify.colorways.filter(colorway => colorway.name !== colorwayProps.name) };
                                DataStore.set("customColorways", [...oldStores, newStore]);
                                if ((await DataStore.get("activeColorwayObject")).id === colorwayProps.name) {
                                    DataStore.set("activeColorwayObject", { id: null, css: null, sourceType: null, source: null });
                                    ColorwayCSS.remove();
                                }
                                modalProps.onClose();
                                loadUIProps();
                            }}
                        >
                            Delete
                        </Button>}
                    </Flex>
                </div>
                <div className={"colorwayInfo-row colorwayInfo-css" + (collapsedCSS ? " colorwaysCreator-settingCat-collapsed" : "")}>
                    <Flex style={{ gap: "10px", width: "100%", alignItems: "center" }}>
                        <Forms.FormTitle style={{ marginBottom: 0, width: "100%" }}>CSS:</Forms.FormTitle>
                        <Button
                            color={Button.Colors.PRIMARY}
                            size={Button.Sizes.MEDIUM}
                            look={Button.Looks.OUTLINED}
                            style={{ flex: "0 0 auto" }}
                            onClick={() => setCollapsedCSS(!collapsedCSS)}
                        >
                            {collapsedCSS ? "Show" : "Hide"}
                        </Button>
                        <Button
                            color={Button.Colors.PRIMARY}
                            size={Button.Sizes.MEDIUM}
                            look={Button.Looks.OUTLINED}
                            style={{ flex: "0 0 auto" }}
                            onClick={() => {
                                Clipboard.copy(colorwayProps["dc-import"]);
                                Toasts.show({
                                    message: "Copied CSS to Clipboard",
                                    type: 1,
                                    id: "copy-colorway-css-notify",
                                });
                            }}
                        >
                            Copy
                        </Button>
                        <Button
                            color={Button.Colors.PRIMARY}
                            size={Button.Sizes.MEDIUM}
                            look={Button.Looks.OUTLINED}
                            style={{ flex: "0 0 auto" }}
                            onClick={async () => {
                                const newColorway = {
                                    ...colorwayProps,
                                    "dc-import": generateCss(colorToHex(colorwayProps.primary) || "313338", colorToHex(colorwayProps.secondary) || "2b2d31", colorToHex(colorwayProps.tertiary) || "1e1f22", colorToHex(colorwayProps.accent) || "5865f2", true, true)
                                };
                                openModal(props => <SaveColorwayModal modalProps={props} colorway={newColorway} />);
                            }}
                        >
                            Update
                        </Button>
                    </Flex>
                    <Text
                        variant="code"
                        selectable={true}
                        className="colorwayInfo-cssCodeblock"
                    >
                        {colorwayProps["dc-import"]}
                    </Text>
                </div>
                <ThemePreviewCategory
                    accent={colorwayProps.accent}
                    primary={colorwayProps.primary}
                    secondary={colorwayProps.secondary}
                    tertiary={colorwayProps.tertiary}
                    previewCSS={colorwayProps.isGradient ? pureGradientBase + `.colorwaysPreview-modal,.colorwaysPreview-wrapper {--gradient-theme-bg: linear-gradient(${colorwayProps.linearGradient})}` : ""}
                />
            </div>
            <div style={{ width: "100%", height: "20px" }} />
        </ModalContent>
    </ModalRoot>;
}
