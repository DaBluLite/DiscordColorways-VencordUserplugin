/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { useRef, useState } from "..";
import ComboTextBox from "./ComboTextBox";
import { CloseIcon } from "./Icons";

export default function ({ onChange = () => { } }: { onChange?: React.ChangeEventHandler<HTMLInputElement>; }) {
    const i = useRef(null);
    const [currentName, setCurrentName] = useState<string>("");
    return <ComboTextBox style={{ width: "fit-content" }} readOnly disabled onInput={() => { }} value={currentName} placeholder="Select a file...">
        <input type="file" style={{ display: "none" }} ref={i} onChange={e => {
            var file = e.target.files[0];
            setCurrentName(file.name);
            onChange(e);
        }} />
        <button className="dc-button dc-button-primary" onClick={() => {
            (i.current as unknown as HTMLInputElement).click();
        }}>Browse</button>
        {currentName ? <CloseIcon width={16} height={16} onClick={() => setCurrentName("")} style={{ flex: "0 0 auto", cursor: "pointer", margin: "8px" }} /> : null}
    </ComboTextBox>;
}
