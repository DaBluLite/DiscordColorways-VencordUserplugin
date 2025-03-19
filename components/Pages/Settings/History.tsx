/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { useContextualState } from "../../../api/Hooks";
import { saveFile } from "../../../api/Utils/Fs";
import ComboSearchBox from "../../ComboSearchBox";
import { DownloadIcon } from "../../Icons";

export default function History() {
    const [colorwayUsageMetrics] = useContextualState("colorwayUsageMetrics");
    return <>
        <ComboSearchBox
            page={2}
            placeholder="Search for a Colorway..."

        >
            <button
                className="dc-button dc-button-primary"
                style={{ flexShrink: "0", width: "fit-content" }}
                onClick={async () => {
                    saveFile(new File([JSON.stringify(colorwayUsageMetrics)], "colorways_usage_metrics.json", { type: "application/json" }));
                }}
            >
                <DownloadIcon width={14} height={14} />
                Export usage data
            </button>
        </ComboSearchBox>
        <div className="dc-selector" style={{ gridTemplateColumns: "unset", flexGrow: "1" }}>
            {colorwayUsageMetrics.map((color, i: number) => <div key={i} className="dc-colorway">
                <div className="dc-label-wrapper">
                    <span className="dc-label">{color.id}</span>
                    <span className="dc-label dc-subnote dc-note">in {color.source} • {color.uses} uses</span>
                </div>
            </div>)}
        </div>
    </>;
}
