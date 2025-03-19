/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { useState } from "../../..";
import { Colorway, Preset, SourceActions } from "../../../types";
import TabBar from "../../TabBar";
import Colorways from "./Colorways";
import Presets from "./Presets";
import Themes from "./Themes";

export function get_updateCustomSource(customColorwayData: {
    name: string;
    colorways?: Colorway[];
    presets?: Preset[];
}[], setCustomColorwayData: React.Dispatch<React.SetStateAction<{
    name: string;
    colorways?: Colorway[];
    presets?: Preset[];
}[]>>) {
    return function updateCustomSource(props: { source: string; } & ({ type: SourceActions.AddColorway | SourceActions.RemoveColorway, colorway: Colorway; } | { type: SourceActions.AddPreset | SourceActions.RemovePreset, preset: Preset; })) {
        if (props.type === SourceActions.AddColorway) {
            const srcList = customColorwayData.map(s => {
                if (s.name === props.source) {
                    return { name: s.name, colorways: [...(s.colorways || []), props.colorway], presets: s.presets || [] };
                }
                return s;
            });
            setCustomColorwayData(srcList);
        }
        if (props.type === SourceActions.RemoveColorway) {
            const srcList = customColorwayData.map(s => {
                if (s.name === props.source) {
                    return { name: s.name, colorways: (s.colorways || []).filter(c => c.name !== props.colorway.name), presets: s.presets || [] };
                }
                return s;
            });
            setCustomColorwayData(srcList);
        }
        if (props.type === SourceActions.AddPreset) {
            const srcList = customColorwayData.map(s => {
                if (s.name === props.source) {
                    return { name: s.name, colorways: s.colorways || [], presets: [...(s.presets || []), props.preset] };
                }
                return s;
            });
            setCustomColorwayData(srcList);
        }
        if (props.type === SourceActions.RemovePreset) {
            const srcList = customColorwayData.map(s => {
                if (s.name === props.source) {
                    return { name: s.name, colorways: s.colorways || [], presets: (s.presets || []).filter(p => p.name !== props.preset.name) };
                }
                return s;
            });
            setCustomColorwayData(srcList);
        }
    };
}

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
