/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { useEffect, useState } from "..";
import { CaretIcon } from "./Icons";

export default function ({ items, selected, onChange }: { items: { name: string, value: string; }[], selected: { name: string, value: string; }, onChange(value: string): void; }) {
    const [open, setOpen] = useState(false);

    function SelectPopout() {
        useEffect(() => {
            window.addEventListener("click", () => setOpen(false));

            return () => {
                window.removeEventListener("click", () => setOpen(false));
            };
        }, []);
        return <div className="dc-select-popout" dir="ltr" role="listbox">
            {items.map((itm, i) => <div className="dc-select-option" role="option" tabIndex={i} aria-selected={itm.value === selected.value} onClick={() => onChange(itm.value)}>
                {itm.name}
                {itm.value === selected.value ? <svg style={{ color: "var(--brand-500)" }} aria-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" fill="white" />
                    <path fill="currentColor" fill-rule="evenodd" d="M12 23a11 11 0 1 0 0-22 11 11 0 0 0 0 22Zm5.7-13.3a1 1 0 0 0-1.4-1.4L10 14.58l-2.3-2.3a1 1 0 0 0-1.4 1.42l3 3a1 1 0 0 0 1.4 0l7-7Z" clip-rule="evenodd" />
                </svg> : null}
            </div>)}
        </div>;
    }

    return <>
        <div className="dc-select" role="button" aria-disabled="false" aria-expanded="true" aria-haspopup="listbox" onClick={e => {
            e.stopPropagation();
            setOpen(!open);
        }}>
            <span className="dc-select-selected">{selected.name}</span>
            <div className="dc-select-caret">
                <CaretIcon width={18} height={18} style={open ? { rotate: "-90deg" } : { rotate: "90deg" }} />
            </div>
            {open ? <SelectPopout /> : null}
        </div>
    </>;
}
