/*
 * Vencord, a Discord client mod
 * Copyright (c) 2023 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import * as DataStore from "@api/DataStore";
import { addAccessory, removeAccessory } from "@api/MessageAccessories";
import { addServerListElement, removeServerListElement, ServerListRenderPosition } from "@api/ServerList";
import { disableStyle, enableStyle } from "@api/Styles";
import { Flex } from "@components/Flex";
import { Devs } from "@utils/constants";
import { ModalProps, openModal } from "@utils/modal";
import definePlugin from "@utils/types";
import {
    Button,
    Clipboard,
    Forms,
    SettingsRouter,
    Toasts
} from "@webpack/common";
import { Plugins } from "Vencord";

import AutoColorwaySelector from "./components/AutoColorwaySelector";
import ColorPickerModal from "./components/ColorPicker";
import ColorwaysButton from "./components/ColorwaysButton";
import CreatorModal from "./components/CreatorModal";
import Selector from "./components/Selector";
import ManageColorwaysPage from "./components/SettingsTabs/ManageColorwaysPage";
import OnDemandWaysPage from "./components/SettingsTabs/OnDemandPage";
import SettingsPage from "./components/SettingsTabs/SettingsPage";
import Spinner from "./components/Spinner";
import { defaultColorwaySource } from "./constants";
import { getAutoPresets } from "./css";
import style from "./style.css?managed";
import { ColorPickerProps } from "./types";
import { colorToHex, hexToString } from "./utils";

export let ColorPicker: React.FunctionComponent<ColorPickerProps> = () => {
    return <Spinner className="colorways-creator-module-warning" />;
};

(async function () {
    const [
        customColorways,
        colorwaySourceFiles,
        showColorwaysButton,
        onDemandWays,
        onDemandWaysTintedText,
        useThinMenuButton,
        onDemandWaysDiscordSaturation,
        onDemandWaysOsAccentColor
    ] = await DataStore.getMany([
        "customColorways",
        "colorwaySourceFiles",
        "showColorwaysButton",
        "onDemandWays",
        "onDemandWaysTintedText",
        "useThinMenuButton",
        "onDemandWaysDiscordSaturation",
        "onDemandWaysOsAccentColor"
    ]);

    const defaults = [
        { name: "customColorways", checkedValue: customColorways, defaults: [] },
        { name: "colorwaySourceFiles", checkedValue: colorwaySourceFiles, defaults: [defaultColorwaySource] },
        { name: "showColorwaysButton", checkedValue: showColorwaysButton, defaults: false },
        { name: "onDemandWays", checkedValue: onDemandWays, defaults: false },
        { name: "onDemandWaysTintedText", checkedValue: onDemandWaysTintedText, defaults: true },
        { name: "useThinMenuButton", checkedValue: useThinMenuButton, defaults: false },
        { name: "onDemandWaysDiscordSaturation", checkedValue: onDemandWaysDiscordSaturation, defaults: false },
        { name: "onDemandWaysOsAccentColor", checkedValue: onDemandWaysOsAccentColor, defaults: false }
    ];

    defaults.forEach(({ name, checkedValue, defaults }) => {
        if (!checkedValue) DataStore.set(name, defaults);
    });

})();

export const ColorwayCSS = {
    get: () => document.getElementById("activeColorwayCSS")?.textContent || "",
    set: (e: string) => {
        if (!document.getElementById("activeColorwayCSS")) {
            var activeColorwayCSS: HTMLStyleElement =
                document.createElement("style");
            activeColorwayCSS.id = "activeColorwayCSS";
            activeColorwayCSS.textContent = e;
            document.head.append(activeColorwayCSS);
        } else document.getElementById("activeColorwayCSS")!.textContent = e;
    },
    remove: () => document.getElementById("activeColorwayCSS")!.remove(),
};

export const versionData = {
    pluginVersion: "5.6.9.1",
    creatorVersion: "1.19.6",
};

export default definePlugin({
    name: "DiscordColorways",
    description: "A plugin that offers easy access to simple color schemes/themes for Discord, also known as Colorways",
    authors: [{
        name: "DaBluLite",
        id: 582170007505731594n
    }, Devs.ImLvna],
    dependencies: ["ServerListAPI", "MessageAccessoriesAPI"],
    pluginVersion: versionData.pluginVersion,
    creatorVersion: versionData.creatorVersion,
    toolboxActions: {
        "Change Colorway": () => openModal(props => <Selector modalProps={props} />),
        "Open Colorway Creator": () => openModal(props => <CreatorModal modalProps={props} />),
        "Open Color Stealer": () => openModal(props => <ColorPickerModal modalProps={props} />),
        "Open Settings": () => SettingsRouter.open("ColorwaysSettings"),
        "Open On-Demand Settings": () => SettingsRouter.open("ColorwaysOnDemand"),
        "Manage Colorways...": () => SettingsRouter.open("ColorwaysManagement"),
        "Change Auto Colorway Preset": async () => {
            const [
                activeAutoPreset,
                actveColorwayID
            ] = await DataStore.getMany([
                "activeAutoPreset",
                "actveColorwayID"
            ]);
            openModal((props: ModalProps) => <AutoColorwaySelector autoColorwayId={activeAutoPreset} modalProps={props} onChange={autoPresetId => {
                if (actveColorwayID === "Auto") {
                    const demandedColorway = getAutoPresets(colorToHex(getComputedStyle(document.body).getPropertyValue("--os-accent-color")))[autoPresetId].preset();
                    DataStore.set("actveColorway", demandedColorway);
                    ColorwayCSS.set(demandedColorway);
                }
            }} />);
        }
    },
    patches: [
        // Credits to Kyuuhachi for the BetterSettings plugin patches
        {
            find: "this.renderArtisanalHack()",
            replacement: {
                match: /createPromise:\(\)=>([^:}]*?),webpackId:"\d+",name:(?!="CollectiblesShop")"[^"]+"/g,
                replace: "$&,_:$1",
                predicate: () => true
            }

        },
        {
            find: "Messages.USER_SETTINGS_WITH_BUILD_OVERRIDE.format",
            replacement: {
                match: /(?<=(\i)\(this,"handleOpenSettingsContextMenu",.{0,100}?openContextMenuLazy.{0,100}?(await Promise\.all[^};]*?\)\)).*?,)(?=\1\(this)/,
                replace: "(async ()=>$2)(),"
            },
            predicate: () => true
        },
        {
            find: "colorPickerFooter:",
            replacement: {
                match: /function (\i).{0,200}colorPickerFooter:/,
                replace: "$self.ColorPicker=$1;$&",
            },
        },
        {
            find: "Messages.ACTIVITY_SETTINGS",
            replacement: {
                match: /\{section:(\i\.\i)\.HEADER,\s*label:(\i)\.\i\.Messages\.APP_SETTINGS\}/,
                replace: "...$self.makeSettingsCategories($1),$&"
            }
        }
    ],

    set ColorPicker(e) {
        ColorPicker = e;
    },

    makeSettingsCategories(SectionTypes: Record<string, unknown>) {
        return [
            {
                section: SectionTypes.CUSTOM,
                label: "Discord Colorways",
                className: "vc-settings-header",
                element: () => <Forms.FormTitle style={{
                    marginBottom: 0,
                    padding: "6px 10px",
                    color: "var(--channels-default)",
                    display: "flex",
                    justifyContent: "space-between"
                }}>
                    Discord Colorways
                    <Forms.FormTitle style={{
                        marginBottom: 0,
                        color: "var(--channels-default)",
                        marginLeft: "auto"
                    }}>v{(Plugins.plugins.DiscordColorways as any).pluginVersion}</Forms.FormTitle>
                </Forms.FormTitle>
            },
            {
                section: "ColorwaysSelector",
                label: "Colorways",
                element: () => <Selector isSettings modalProps={{ onClose: () => new Promise(() => true), transitionState: 1 }} />,
                className: "dc-colorway-selector"
            },
            {
                section: "ColorwaysSettings",
                label: "Settings",
                element: SettingsPage,
                className: "dc-colorway-settings"
            },
            {
                section: "ColorwaysOnDemand",
                label: "On-Demand",
                element: OnDemandWaysPage,
                className: "dc-colorway-ondemand"
            },
            {
                section: "ColorwaysManagement",
                label: "Manage...",
                element: ManageColorwaysPage,
                className: "dc-colorway-management"
            },
            {
                section: SectionTypes.DIVIDER
            }
        ].filter(Boolean);
    },

    ColorwaysButton: () => <ColorwaysButton />,

    async start() {
        addServerListElement(ServerListRenderPosition.In, this.ColorwaysButton);

        enableStyle(style);
        ColorwayCSS.set((await DataStore.get("actveColorway")) || "");

        addAccessory("colorways-btn", props => {
            if (String(props.message.content).match(/colorway:[0-9a-f]{0,100}/)) {
                return <Flex flexDirection="column">
                    {String(props.message.content).match(/colorway:[0-9a-f]{0,100}/g)?.map((colorID: string) => {
                        colorID = colorID.split("colorway:")[1];
                        return <div className="colorwayMessage">
                            <div className="discordColorwayPreviewColorContainer" style={{ width: "56px", height: "56px", marginRight: "16px" }}>
                                {(() => {
                                    if (colorID) {
                                        if (!colorID) {
                                            throw new Error("Please enter a Colorway ID");
                                        } else if (!hexToString(colorID).includes(",")) {
                                            throw new Error("Invalid Colorway ID");
                                        } else {
                                            return hexToString(colorID).split(/,#/).map((color: string) => <div className="discordColorwayPreviewColor" style={{ backgroundColor: `#${colorToHex(color)}` }} />);
                                        }
                                    } else return null;
                                })()}
                            </div>
                            <div className="colorwayMessage-contents">
                                <Forms.FormTitle>Found Colorway ID</Forms.FormTitle>
                                <Flex>
                                    <Button
                                        onClick={() => openModal(modalProps => <CreatorModal
                                            modalProps={modalProps}
                                            colorwayID={colorID}
                                        />)}
                                        size={Button.Sizes.SMALL}
                                        color={Button.Colors.PRIMARY}
                                        look={Button.Looks.FILLED}
                                    >
                                        Add this Colorway...
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            Clipboard.copy(colorID);
                                            Toasts.show({
                                                message: "Copied Colorway ID Successfully",
                                                type: 1,
                                                id: "copy-colorway-id-notify",
                                            });
                                        }}
                                        size={Button.Sizes.SMALL}
                                        color={Button.Colors.PRIMARY}
                                        look={Button.Looks.FILLED}
                                    >
                                        Copy Colorway ID
                                    </Button>
                                </Flex>
                            </div>
                        </div>;
                    })}
                </Flex>;
            } else {
                return null;
            }
        });
    },
    stop() {
        removeServerListElement(ServerListRenderPosition.In, this.ColorwaysButton);
        disableStyle(style);
        ColorwayCSS.remove();
        removeAccessory("colorways-btn");
    },
});
