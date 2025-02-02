/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/* eslint-disable react/jsx-key */

import { Toasts, useEffect, useState } from "../../..";
import { useContextualState } from "../../../api/Hooks";
import { openModal } from "../../../api/Modals";
import { Clipboard } from "../../../api/Utils";
import { StoreItem } from "../../../types";
import ComboTextBox from "../../ComboTextBox";
import { CopyIcon, DeleteIcon, DownloadIcon } from "../../Icons";
import Modal from "../../Modal";
import RightClickContextMenu from "../../RightClickContextMenu";

export default function Discover() {
    const [storeObject, setStoreObject] = useState<StoreItem[]>([]);
    const [searchValue, setSearchValue] = useState<string>("");
    const [colorwaySourceFiles, setColorwaySourceFiles] = useContextualState("colorwaySourceFiles");

    function setOnline(obj: { name: string, url: string; }, action: "add" | "remove") {
        if (action === "add") {
            setColorwaySourceFiles(srcList => [...srcList, obj]);
        }
        if (action === "remove") {
            setColorwaySourceFiles(srcList => srcList.filter(src => src.name !== obj.name && src.url !== obj.url));
        }
    }

    useEffect(() => {
        (async function () {
            const res: Response = await fetch("https://dablulite.vercel.app/?q=" + encodeURI(searchValue));
            const data = await res.json();
            setStoreObject(data.sources);
        })();
    }, []);

    return <>
        <ComboTextBox
            placeholder="Search for sources..."
            value={searchValue}
            onInput={setSearchValue}
        >
            <button
                className="dc-button dc-button-primary"
                style={{ marginLeft: "8px", marginTop: "auto", marginBottom: "auto" }}
                onClick={async function () {
                    const res: Response = await fetch("https://dablulite.vercel.app/");
                    const data = await res.json();
                    setStoreObject(data.sources);
                }}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    x="0px"
                    y="0px"
                    width="14"
                    height="14"
                    style={{ boxSizing: "content-box", flexShrink: 0 }}
                    viewBox="0 0 24 24"
                    fill="currentColor"
                >
                    <rect
                        y="0"
                        fill="none"
                        width="24"
                        height="24"
                    />
                    <path
                        d="M6.351,6.351C7.824,4.871,9.828,4,12,4c4.411,0,8,3.589,8,8h2c0-5.515-4.486-10-10-10 C9.285,2,6.779,3.089,4.938,4.938L3,3v6h6L6.351,6.351z"
                    />
                    <path
                        d="M17.649,17.649C16.176,19.129,14.173,20,12,20c-4.411,0-8-3.589-8-8H2c0,5.515,4.486,10,10,10 c2.716,0,5.221-1.089,7.062-2.938L21,21v-6h-6L17.649,17.649z"
                    />
                </svg>
                Refresh
            </button>
        </ComboTextBox>
        <div className="dc-selector">
            {storeObject.map((item: StoreItem) =>
                item.name.toLowerCase().includes(searchValue.toLowerCase()) ? <RightClickContextMenu menu={<>
                    <button onClick={() => {
                        Clipboard.copy(item.url);
                        Toasts.show({
                            message: "Copied URL Successfully",
                            type: 1,
                            id: "copy-url-notify",
                        });
                    }} className="dc-contextmenu-item">
                        Copy URL
                        <CopyIcon width={16} height={16} style={{
                            marginLeft: "8px"
                        }} />
                    </button>
                    <button
                        className={`dc-contextmenu-item${colorwaySourceFiles.map(source => source.name).includes(item.name) ? " dc-contextmenu-item-danger" : ""}`}
                        onClick={async () => {
                            if (colorwaySourceFiles.map(source => source.name).includes(item.name)) {
                                openModal(props => <Modal
                                    modalProps={props}
                                    title="Remove Source"
                                    onFinish={async ({ closeModal }) => {
                                        setOnline({ name: item.name, url: item.url as string }, "remove");
                                        closeModal();
                                    }}
                                    confirmMsg="Delete"
                                    type="danger"
                                >
                                    Are you sure you want to remove this source? This cannot be undone!
                                </Modal>);
                            } else {
                                setOnline({ name: item.name, url: item.url as string }, "add");
                            }
                        }}
                    >
                        {colorwaySourceFiles.map(source => source.name).includes(item.name) ? <>
                            Remove
                            <DeleteIcon width={16} height={16} style={{
                                marginLeft: "8px"
                            }} />
                        </> : <>
                            Add Source
                            <DownloadIcon width={16} height={16} style={{
                                marginLeft: "8px"
                            }} />
                        </>}
                    </button>
                </>}>
                    {({ onContextMenu }) => <div
                        className="dc-colorway"
                        style={{ cursor: "default" }}
                        id={"colorwaySource" + item.name}
                        onContextMenu={onContextMenu}>
                        <div className="dc-label-wrapper">
                            <span className="dc-label">{item.name}</span>
                            <span className="dc-label dc-subnote dc-note">{item.description} • by {item.authorGh}</span>
                        </div>
                        <div style={{ marginRight: "auto" }} />
                        <button
                            className={`dc-button ${colorwaySourceFiles.map(source => source.name).includes(item.name) ? "dc-button-danger" : "dc-button-secondary"}`}
                            onClick={async () => {
                                if (colorwaySourceFiles.map(source => source.name).includes(item.name)) {
                                    openModal(props => <Modal
                                        modalProps={props}
                                        title="Remove Source"
                                        onFinish={async ({ closeModal }) => {
                                            setOnline({ name: item.name, url: item.url as string }, "remove");
                                            closeModal();
                                        }}
                                        confirmMsg="Delete"
                                        type="danger"
                                    >
                                        Are you sure you want to remove this source? This cannot be undone!
                                    </Modal>);
                                } else {
                                    setOnline({ name: item.name, url: item.url as string }, "add");
                                }
                            }}
                        >
                            {colorwaySourceFiles.map(source => source.name).includes(item.name) ? <DeleteIcon width={16} height={16} /> : <DownloadIcon width={16} height={16} />}
                        </button>
                        <a role="link" className="dc-button dc-button-secondary" target="_blank" href={"https://github.com/" + item.authorGh} rel="noreferrer">
                            <img src="/assets/6a853b4c87fce386cbfef4a2efbacb09.svg" width={16} height={16} alt="GitHub" />
                        </a>
                    </div>}
                </RightClickContextMenu> : <></>
            )}
        </div>
    </>;
}
