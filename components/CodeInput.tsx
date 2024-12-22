/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { hljs, useEffect } from "..";

export default function ({ lang = "css", onChange = () => { }, value = "" }: { lang: "css" | "js" | "jsx" | "ts" | "tsx"; onChange?: (value: string) => void, value?: string; }) {
    useEffect(() => {
        document.querySelectorAll(".dc-codeblock").forEach(el => hljs.highlightElement(el));
    }, [value]);

    return <pre>
        <code
            className={`dc-codeblock language-${lang}`}
            contentEditable
            style={{ outline: "none" }}
            spellCheck={false}
            onKeyDown={function (e) {
                if (e.keyCode === 9) { // tab key
                    e.preventDefault(); // this will prevent us from tabbing out of the editor

                    // now insert four non-breaking spaces for the tab key
                    var editor = e.currentTarget as HTMLPreElement;
                    var doc = editor.ownerDocument.defaultView;
                    var sel = doc.getSelection();
                    var range = sel.getRangeAt(0);

                    var tabNode = document.createTextNode("\u00a0\u00a0\u00a0\u00a0");
                    range.insertNode(tabNode);

                    range.setStartAfter(tabNode);
                    range.setEndAfter(tabNode);
                    sel.removeAllRanges();
                    sel.addRange(range);
                }
            }}
            onBlur={e => {
                onChange((e.currentTarget.textContent as string).replaceAll("\u00a0", " "));
            }}>
            {value}
        </code>
    </pre>;
}
