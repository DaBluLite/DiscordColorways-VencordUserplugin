/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { useState } from "../../..";
import TabBar from "../../TabBar";
import History from "./History";
import Main from "./Main";

export default function ({ tab = "Settings" }: { tab: string; }) {
    const [active, setActive] = useState(tab);

    return <TabBar
        active={active}
        container={({ children }) => <div className="dc-page-header">{children}</div>}
        items={[
            {
                name: "Settings",
                component: () => <Main />
            },
            {
                name: "History",
                component: () => <History />
            }
        ]}
        onChange={setActive}
    />;
}
