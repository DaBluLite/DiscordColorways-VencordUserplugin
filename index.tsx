/*
 * Vencord, a Discord client mod
 * Copyright (c) 2023 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

// Plugin Imports
import { addAccessory, removeAccessory } from "@api/MessageAccessories";
import { addServerListElement, removeServerListElement, ServerListRenderPosition } from "@api/ServerList";
import { disableStyle, enableStyle } from "@api/Styles";
import { Devs } from "@utils/constants";
import { getIntlMessage } from "@utils/discord";
import definePlugin from "@utils/types";

// Mod-specific imports
import { ColorwayCSS } from "./colorwaysAPI";
import ColorwayID from "./components/ColorwayID";
import ColorwaysButton from "./components/ColorwaysButton";
import Selector from "./components/Selector";
import SettingsPage from "./components/SettingsTabs/SettingsPage";
import SourceManager from "./components/SettingsTabs/SourceManager";
import { initContexts } from "./contexts";
import { generateCss, getPreset, gradientBase, gradientPresetIds } from "./css";
import defaultsLoader from "./defaultsLoader";
import style from "./style.css?managed";
import discordTheme from "./theme.discord.css?managed";
import { closeWS, connect } from "./wsClient";

export * as DataStore from "@api/DataStore";
export { openModal } from "@utils/modal";
export {
    ContextMenuApi,
    FluxDispatcher,
    FocusLock,
    Forms,
    Popout,
    Toasts,
    useCallback,
    useEffect,
    useMemo,
    useReducer,
    useRef,
    UserStore,
    useState
} from "@webpack/common";
export type { FluxEvents } from "@webpack/types";
export type {
    CSSProperties,
    ReactNode,
} from "react";

export const PluginProps = {
    pluginVersion: "7.0.0",
    clientMod: "Vencord",
    UIVersion: "2.2.0",
    CSSVersion: "1.23"
};

type SectionType = "HEADER" | "DIVIDER" | "CUSTOM";
type SectionTypes = Record<SectionType, SectionType>;

// export const externalPresets: {
//     [key: string]: {
//         name: string;
//         id: string;
//         colors: {
//             accent: string;
//             primary: string;
//             secondary: string;
//             tertiary: string;
//         };
//     };
// } = {};

// for (const plugin of Object.values(Vencord.Plugins.plugins)) {
//     if (((plugin as any).colorwaysPresets as {
//         [key: string]: {
//             name: string;
//             id: string;
//             colors: {
//                 accent: string;
//                 primary: string;
//                 secondary: string;
//                 tertiary: string;
//             };
//         };
//     }) && Vencord.Plugins.isPluginEnabled(plugin.name)) {
//         Object.keys((plugin as any).colorwaysPresets).forEach(key => {
//             if (!externalPresets[key]) externalPresets[key] = (plugin as any).colorwaysPresets[key];
//         });
//     }
// }

export default definePlugin({
    name: "DiscordColorways",
    description:
        "A plugin that offers easy access to simple color schemes/themes for Discord, also known as Colorways",
    authors: [{
        name: "DaBluLite",
        id: 582170007505731594n
    }, Devs.ImLvna],
    dependencies: ["ServerListAPI", "MessageAccessoriesAPI"],
    patches: [
        // Credits to Kyuuhachi for the BetterSettings plugin patches
        {
            find: "this.renderArtisanalHack()",
            replacement: { // Lazy-load contents
                match: /createPromise:\(\)=>([^:}]*?),webpackId:"?\d+"?,name:(?!="CollectiblesShop")"[^"]+"/g,
                replace: "$&,_:$1"
            }
        },
        { // Load menu TOC eagerly
            find: "Messages.USER_SETTINGS_WITH_BUILD_OVERRIDE.format",
            replacement: {
                match: /(\i)\(this,"handleOpenSettingsContextMenu",.{0,100}?null!=\i&&.{0,100}?(await Promise\.all[^};]*?\)\)).*?,(?=\1\(this)/,
                replace: "$&(async ()=>$2)(),"
            }
        },
        {
            find: ".SEARCH_NO_RESULTS&&0===",
            replacement: [
                {
                    match: /(?<=section:(.{0,50})\.DIVIDER\}\))([,;])(?=.{0,200}(\i)\.push.{0,100}label:(\i)\.header)/,
                    replace: (_, sectionTypes, commaOrSemi, elements, element) => `${commaOrSemi} $self.addSettings(${elements}, ${element}, ${sectionTypes}) ${commaOrSemi}`
                },
                {
                    match: /({(?=.+?function (\i).{0,120}(\i)=\i\.useMemo.{0,60}return \i\.useMemo\(\(\)=>\i\(\3).+?function\(\){return )\2(?=})/,
                    replace: (_, rest, settingsHook) => `${rest}$self.wrapSettingsHook(${settingsHook})`
                }
            ]
        },
        {
            find: "#{intl::USER_SETTINGS_ACTIONS_MENU_LABEL}",
            replacement: {
                match: /(?<=function\((\i),\i\)\{)(?=let \i=Object.values\(\i.\i\).*?(\i\.\i)\.open\()/,
                replace: "$2.open($1);return;"
            }
        }
    ],

    makeSettingsCategories(SectionTypes: Record<string, unknown>) {
        return [
            {
                section: SectionTypes.HEADER,
                label: "Discord Colorways",
                className: "vc-settings-header"
            },
            {
                section: "ColorwaysSelector",
                label: "Colorways",
                element: () => <div className="colorwayInnerTab" style={{ height: "100%", padding: 0 }}><Selector /></div>,
                className: "dc-colorway-selector"
            },
            {
                section: "ColorwaysSourceManager",
                label: "Sources",
                element: () => <SourceManager />,
                className: "dc-colorway-sources-manager"
            },
            {
                section: "ColorwaysSettings",
                label: "Settings",
                element: () => <SettingsPage />,
                className: "dc-colorway-settings"
            },
            {
                section: SectionTypes.DIVIDER
            }
        ].filter(Boolean);
    },

    isRightSpot({ header, settings }: { header?: string; settings?: string[]; }) {
        const firstChild = settings?.[0];
        // lowest two elements... sanity backup
        if (firstChild === "LOGOUT" || firstChild === "SOCIAL_LINKS") return true;

        const settingsLocation = "belowNitro";

        if (!header) return;

        try {
            const names = {
                top: getIntlMessage("USER_SETTINGS"),
                aboveNitro: getIntlMessage("BILLING_SETTINGS"),
                belowNitro: getIntlMessage("APP_SETTINGS"),
                aboveActivity: getIntlMessage("ACTIVITY_SETTINGS")
            };

            return header === names[settingsLocation];
        } catch {
            return firstChild === "PREMIUM";
        }
    },

    patchedSettings: new WeakSet(),

    addSettings(elements: any[], element: { header?: string; settings: string[]; }, sectionTypes: SectionTypes) {
        if (this.patchedSettings.has(elements) || !this.isRightSpot(element)) return;

        this.patchedSettings.add(elements);

        elements.push(...this.makeSettingsCategories(sectionTypes));
    },

    wrapSettingsHook(originalHook: (...args: any[]) => Record<string, unknown>[]) {
        return (...args: any[]) => {
            const elements = originalHook(...args);
            if (!this.patchedSettings.has(elements))
                elements.unshift(...this.makeSettingsCategories({
                    HEADER: "HEADER",
                    DIVIDER: "DIVIDER",
                    CUSTOM: "CUSTOM"
                }));

            return elements;
        };
    },

    ColorwaysButton: () => <ColorwaysButton />,

    start() {
        addServerListElement(ServerListRenderPosition.In, this.ColorwaysButton);

        enableStyle(style);
        enableStyle(discordTheme);
        defaultsLoader();
        addAccessory("colorways-btn", props => <ColorwayID props={props} />);

        connect();

        initContexts().then(contexts => {
            if (contexts.activeColorwayObject.id) {
                if (contexts.colorwaysPreset === "default") {
                    ColorwayCSS.set(generateCss(
                        contexts.activeColorwayObject.colors,
                        true,
                        true,
                        undefined,
                        contexts.activeColorwayObject.id
                    ));
                } else {
                    if (gradientPresetIds.includes(contexts.colorwaysPreset)) {
                        const css = Object.keys(contexts.activeColorwayObject).includes("linearGradient")
                            ? gradientBase(contexts.activeColorwayObject.colors, true) + `:root:root {--custom-theme-background: linear-gradient(${contexts.activeColorwayObject.linearGradient})}`
                            : (getPreset(contexts.activeColorwayObject.colors)[contexts.colorwaysPreset].preset as { full: string; }).full;
                        ColorwayCSS.set(css);
                    } else {
                        ColorwayCSS.set(getPreset(contexts.activeColorwayObject.colors)[contexts.colorwaysPreset].preset as string);
                    }
                }
            }
        });
    },
    stop() {
        removeServerListElement(ServerListRenderPosition.In, this.ColorwaysButton);
        disableStyle(style);
        disableStyle(discordTheme);
        ColorwayCSS.remove();
        closeWS();
        removeAccessory("colorways-btn");
    },
});
