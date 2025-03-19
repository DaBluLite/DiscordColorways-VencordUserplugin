/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { useState } from "../..";
import TabBar from "../TabBar";
import * as $Selector from "./Selector";
import Colorways from "./Selector/Colorways";
import Presets from "./Selector/Presets";
import Themes from "./Selector/Themes";
import * as $Settings from "./Settings";

export const Selector = $Selector;
export const Settings = $Settings;

export default function ({ tab = "Colorways" }: { tab: string; }) {
    const [active, setActive] = useState(tab);
    return <TabBar
        active={active}
        onChange={setActive}
        container={({ children }) => <div className="dc-page-header">{children}</div>}
        items={[
            {
                name: "Colorways",
                component: () => <Colorways />
            },
            {
                name: "Presets",
                component: () => <Presets />
            },
            {
                name: "Themes",
                component: () => <Themes />
            }
        ]}
    />;
}
