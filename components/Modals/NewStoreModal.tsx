/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { useState } from "../..";
import { DataStore } from "../../api";
import { defaultColorwaySource } from "../../constants";
import { ModalProps } from "../../types";
import Modal from "../Modal";
import Setting from "../Setting";
import Switch from "../Switch";

export default function ({ modalProps, onOnline = () => { }, onOffline, offlineOnly = false, name = "" }: { modalProps: ModalProps, onOnline?(props: { name: string, url: string; }): any, onOffline(props: { name: string; }): any, offlineOnly?: boolean, name?: string; }) {
    const [colorwaySourceName, setColorwaySourceName] = useState<string>(name);
    const [colorwaySourceURL, setColorwaySourceURL] = useState<string>("");
    const [nameError, setNameError] = useState<string>("");
    const [URLError, setURLError] = useState<string>("");
    const [nameReadOnly, setNameReadOnly] = useState<boolean>(false);
    const [isOnline, setIsOnline] = useState<boolean>(false);

    return <Modal
        modalProps={modalProps}
        title="Add a source"
        type="normal"
        onFinish={async ({ closeModal }) => {
            const sourcesArr: { name: string, url: string; }[] = (await DataStore.get("colorwaySourceFiles") as { name: string, url: string; }[]);
            if (!colorwaySourceName) {
                setNameError("Please enter a valid name");
            }
            else if (!offlineOnly && isOnline && !colorwaySourceURL) {
                setURLError("Please enter a valid URL");
            }
            else if (sourcesArr.map(s => s.name).includes(colorwaySourceName)) {
                setNameError("An online source with that name already exists");
            }
            else if (!offlineOnly && isOnline && sourcesArr.map(s => s.url).includes(colorwaySourceURL)) {
                setURLError("An online source with that url already exists");
            } else {
                (isOnline && !offlineOnly) ? onOnline({ name: colorwaySourceName, url: colorwaySourceURL }) : onOffline({ name: colorwaySourceName });
                closeModal();
            }
        }}
    >
        {!offlineOnly ? <Setting divider>
            <Switch
                label="Online"
                id="dc-is-new-source-online"
                value={isOnline}
                onChange={setIsOnline}
            />
            <span className="dc-note">Immutable, and always up-to-date</span>
        </Setting> : null}
        <span className={`dc-field-header${nameError ? " dc-field-header-error" : ""}`} style={{ marginBottom: "4px", width: "100%" }}>
            Name{nameError ? <span className="dc-field-header-errormsg">
                <span className="dc-field-header-errordiv">-</span>
                {nameError}
            </span> : <></>}
        </span>
        <input
            type="text"
            className="dc-textbox"
            placeholder="Enter a valid Name..."
            onInput={e => setColorwaySourceName(e.currentTarget.value)}
            value={colorwaySourceName}
            readOnly={nameReadOnly && isOnline && !offlineOnly}
            disabled={nameReadOnly && isOnline && !offlineOnly}
        />
        {(isOnline && !offlineOnly) ? <>
            <span className={`dc-field-header${URLError ? " dc-field-header-error" : ""}`} style={{ marginBottom: "4px", marginTop: "16px" }}>URL{URLError ? <span className="dc-field-header-errormsg">
                <span className="dc-field-header-errordiv">-</span>
                {URLError}
            </span> : <></>}</span>
            <input
                type="text"
                className="dc-textbox"
                placeholder="Enter a valid URL..."
                onChange={({ currentTarget: { value } }) => {
                    setColorwaySourceURL(value);
                    if (value === defaultColorwaySource) {
                        setNameReadOnly(true);
                        setColorwaySourceName("Project Colorway");
                    } else setNameReadOnly(false);
                }}
                value={colorwaySourceURL}
            />
        </> : null}
    </Modal>;
}
