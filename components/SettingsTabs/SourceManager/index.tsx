/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { useState } from "../../..";
import TabBar from "../../TabBar";
import Discover from "./Discover";
import Installed from "./Installed";

export default function ({ tab = "Installed" }: { tab: string; }) {
    const [active, setActive] = useState(tab);

    return <TabBar active={active} container={({ children }) => <div className="dc-page-header">{children}</div>} onChange={setActive} items={[
        {
            name: "Installed",
            component: () => <Installed />
        },
        {
            name: "Discover",
            component: () => <Discover />
        }
    ]} />;
}
