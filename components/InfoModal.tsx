/*
 * Vencord, a Discord client mod
 * Copyright (c) 2023 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import * as DataStore from "@api/DataStore";
import { CodeBlock } from "@components/CodeBlock";
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
import { Button, Clipboard, Forms, Text, Toasts, UserStore, useStateFromStores } from "@webpack/common";

import { ColorwayCSS } from "..";
import { generateCss, pureGradientBase } from "../css";
import { Colorway } from "../types";
import { colorToHex, stringToHex } from "../utils";
import SaveColorwayModal from "./SaveColorwayModal";
import ThemePreview from "./ThemePreview";

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
    const profile = useStateFromStores([UserStore], () => UserStore.getUser(colorwayProps.authorID));
    return <ModalRoot {...modalProps}>
        <ModalHeader separator={false}>
            <Text variant="heading-lg/semibold" tag="h1" style={{ marginRight: "auto" }}>
                Colorway: {colorwayProps.name}
            </Text>
            <ModalCloseButton onClick={() => modalProps.onClose()} />
        </ModalHeader>
        <ModalContent>
            <Flex style={{ gap: "8px", width: "100%" }} flexDirection="column">
                <Forms.FormTitle style={{ marginBottom: 0, width: "100%" }}>Creator:</Forms.FormTitle>
                <Flex style={{ gap: ".5rem" }}>
                    <UserSummaryItem
                        users={[profile]}
                        guildId={undefined}
                        renderIcon={false}
                        showDefaultAvatarsForNullUsers
                        size={32}
                        showUserPopout
                    />
                    <Text style={{ lineHeight: "32px" }}>{colorwayProps.author}</Text>
                </Flex>
                <Forms.FormTitle style={{ marginBottom: 0, width: "100%" }}>Colors:</Forms.FormTitle>
                <Flex style={{ gap: "8px" }}>
                    {colors.map(color => <div className="colorwayInfo-colorSwatch" style={{ backgroundColor: colorwayProps[color] }} />)}
                </Flex>
                <Forms.FormTitle style={{ marginBottom: 0, width: "100%" }}>Actions:</Forms.FormTitle>
                <Flex style={{ gap: "8px" }} flexDirection="column">
                    <Button
                        color={Button.Colors.PRIMARY}
                        size={Button.Sizes.MEDIUM}
                        look={Button.Looks.OUTLINED}
                        style={{ width: "100%" }}
                        onClick={() => {
                            const colorwayIDArray = `${colorwayProps.accent},${colorwayProps.primary},${colorwayProps.secondary},${colorwayProps.tertiary}|n:${colorwayProps.name}${colorwayProps.preset ? `|p:${colorwayProps.preset}` : ""}`;
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
                    <Button
                        color={Button.Colors.PRIMARY}
                        size={Button.Sizes.MEDIUM}
                        look={Button.Looks.OUTLINED}
                        style={{ width: "100%" }}
                        onClick={() => {
                            Clipboard.copy(colorwayProps["dc-import"]);
                            Toasts.show({
                                message: "Copied CSS to Clipboard",
                                type: 1,
                                id: "copy-colorway-css-notify",
                            });
                        }}
                    >
                        Copy CSS
                    </Button>
                    <Button
                        color={Button.Colors.PRIMARY}
                        size={Button.Sizes.MEDIUM}
                        look={Button.Looks.OUTLINED}
                        style={{ width: "100%" }}
                        onClick={async () => {
                            const newColorway = {
                                ...colorwayProps,
                                "dc-import": generateCss(colorToHex(colorwayProps.primary) || "313338", colorToHex(colorwayProps.secondary) || "2b2d31", colorToHex(colorwayProps.tertiary) || "1e1f22", colorToHex(colorwayProps.accent) || "5865f2", true, true)
                            };
                            openModal(props => <SaveColorwayModal modalProps={props} colorways={[newColorway]} />);
                        }}
                    >
                        Update CSS
                    </Button>
                    <Button
                        color={Button.Colors.PRIMARY}
                        size={Button.Sizes.MEDIUM}
                        look={Button.Looks.OUTLINED}
                        style={{ width: "100%" }}
                        onClick={() => {
                            openModal(props => <ModalRoot {...props} className="colorwayInfo-cssModal">
                                <ModalContent><CodeBlock lang="css" content={colorwayProps["dc-import"]} /></ModalContent>
                            </ModalRoot>);
                        }}
                    >
                        Show CSS
                    </Button>
                    <Button
                        color={Button.Colors.PRIMARY}
                        size={Button.Sizes.MEDIUM}
                        look={Button.Looks.OUTLINED}
                        style={{ width: "100%" }}
                        onClick={() => {
                            openModal((props: ModalProps) => <ModalRoot className="colorwaysPreview-modal" {...props}>
                                <style>
                                    {colorwayProps.isGradient ? pureGradientBase + `.colorwaysPreview-modal,.colorwaysPreview-wrapper {--gradient-theme-bg: linear-gradient(${colorwayProps.linearGradient})}` : ""}
                                </style>
                                <ThemePreview
                                    accent={colorwayProps.accent}
                                    primary={colorwayProps.primary}
                                    secondary={colorwayProps.secondary}
                                    tertiary={colorwayProps.tertiary}
                                    isModal
                                    modalProps={props}
                                />
                            </ModalRoot>);
                        }}
                    >
                        Show preview
                    </Button>
                    {offlineSourceName !== (null || "") && <Button
                        color={Button.Colors.RED}
                        size={Button.Sizes.MEDIUM}
                        look={Button.Looks.FILLED}
                        style={{ width: "100%" }}
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
            </Flex>
            <div style={{ width: "100%", height: "20px" }} />
        </ModalContent>
    </ModalRoot>;
}
