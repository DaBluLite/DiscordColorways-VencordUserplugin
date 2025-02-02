/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

// Plugin Imports
import { addServerListElement, removeServerListElement, ServerListRenderPosition } from "@api/ServerList";
import { Devs } from "@utils/constants";
import { getIntlMessage } from "@utils/discord";
import definePlugin from "@utils/types";
export { waitFor as waitForModule } from "@webpack";

import { Discord } from "./api";
import ColorwaysButton from "./components/ColorwaysButton";
// Mod-specific imports
export {
    ContextMenuApi,
    FluxDispatcher,
    FocusLock,
    Forms,
    hljs,
    Popout,
    ThemeStore,
    Toasts,
    useEffect,
    useReducer,
    useRef,
    UserStore,
    useState
} from "@webpack/common";

export const { getThemesList, getThemeData } = VencordNative.themes;

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

    addSettings(elements: any[], element: { header?: string; settings: string[]; }) {
        if (this.patchedSettings.has(elements) || !this.isRightSpot(element)) return;

        this.patchedSettings.add(elements);

        elements.push(...Discord.Settings.sections);
    },

    wrapSettingsHook(originalHook: (...args: any[]) => Record<string, unknown>[]) {
        return (...args: any[]) => {
            const elements = originalHook(...args);
            if (!this.patchedSettings.has(elements))
                elements.unshift(...Discord.Settings.sections);

            return elements;
        };
    },

    start() {
        // DC-Specific
        Discord.start();

        // Vencord-Specific
        addServerListElement(ServerListRenderPosition.Above, () => <ColorwaysButton />);
    },
    stop() {
        removeServerListElement(ServerListRenderPosition.Above, () => <ColorwaysButton />);
        Discord.stop();
    },
});
