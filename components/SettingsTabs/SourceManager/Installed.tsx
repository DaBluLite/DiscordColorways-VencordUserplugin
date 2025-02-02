/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/* eslint-disable react/jsx-key */

import { Toasts, useEffect, useState } from "../../..";
import { setContext } from "../../../api/Contexts";
import { useContextualState } from "../../../api/Hooks";
import { openModal } from "../../../api/Modals";
import { Clipboard } from "../../../api/Utils";
import { chooseFile, saveFile } from "../../../api/Utils/Fs";
import { defaultColorwaySource } from "../../../constants";
import { Colorway, Preset, SortOptions } from "../../../types";
import ComboTextBox from "../../ComboTextBox";
import { CopyIcon, DeleteIcon, DownloadIcon, ImportIcon, PlusIcon, WirelessIcon } from "../../Icons";
import Modal from "../../Modal";
import NewStoreModal from "../../Modals/NewStoreModal";
import Radio from "../../Radio";
import RightClickContextMenu from "../../RightClickContextMenu";
import Spinner from "../../Spinner";
import StaticOptionsMenu from "../../StaticOptionsMenu";

function OnlineSourceMeta({ source, onComplete, fallback = "loading" }: {
    source: string, onComplete(props: {
        colorways?: Colorway[],
        presets?: Preset[];
    }): string, fallback?: string;
}): React.ReactNode {
    const [data, setData] = useState<{
        colorways?: Colorway[],
        presets?: Preset[];
    }>({ colorways: [], presets: [] });
    const [loaded, setLoaded] = useState(false);
    useEffect(() => {
        (async () => {
            const res: Response = await fetch(source);
            try {
                setData(await res.json());
                setLoaded(true);
            } catch (e) {
                setData({ colorways: [], presets: [] });
                setLoaded(true);
            }
        })();
    }, []);

    return <>{loaded ? onComplete(data) : fallback}</>;
}

export default function () {
    const [colorwaySourceFiles, setColorwaySourceFiles] = useContextualState("colorwaySourceFiles");
    const [customColorwayStores, setCustomColorwayStores] = useContextualState("customColorways");
    const [searchValue, setSearchValue] = useState<string>("");
    const [sortBy, setSortBy] = useState<SortOptions>(SortOptions.NAME_AZ);
    const [layout, setLayout] = useState<"normal" | "compact">("normal");
    const [showSpinner, setShowSpinner] = useState<boolean>(false);

    async function setOnline(obj: { name: string, url: string; }, action: "add" | "remove") {
        if (action === "add") {
            setColorwaySourceFiles(srcList => [...srcList, obj]);
        }
        if (action === "remove") {
            setColorwaySourceFiles(srcList => srcList.filter(src => src.name !== obj.name && src.url !== obj.url));
        }

        const responses: Response[] = await Promise.all(
            colorwaySourceFiles.map(source =>
                fetch(source.url)
            )
        );

        setContext("colorwayData", await Promise.all(
            responses
                .map((res, i) => ({ response: res, name: colorwaySourceFiles[i].name }))
                .map((res: { response: Response, name: string; }) =>
                    res.response.json().then(dt => ({ colorways: (dt.colorways || []) as Colorway[], presets: (dt.presets || [] as Preset[]), source: res.name, type: "online" })).catch(() => ({ colorways: [] as Colorway[], presets: [] as Preset[], source: res.name, type: "online" }))
                )) as { type: "online" | "offline", source: string, colorways: Colorway[], presets: Preset[]; }[], false);
    }

    const layouts = [{ name: "Normal", id: "normal" }, { name: "Compact", id: "compact" }];

    function setOffline(obj: { name: string, colorways: Colorway[], presets: Preset[]; }, action: "add" | "remove") {
        if (action === "add") {
            setCustomColorwayStores(srcList => [...srcList, obj]);
        }
        if (action === "remove") {
            setCustomColorwayStores(srcList => srcList.filter(src => src.name !== obj.name));
        }
    }

    return <>
        <ComboTextBox
            placeholder="Search for sources..."
            value={searchValue}
            onInput={setSearchValue}
        >
            <Spinner className={`dc-selector-spinner${!showSpinner ? " dc-selector-spinner-hidden" : ""}`} />
            <button
                className="dc-button dc-button-primary"
                style={{ flexShrink: "0" }}
                onClick={() => {
                    openModal(props => <NewStoreModal
                        modalProps={props}
                        onOnline={async ({ name, url }) => setOnline({ name, url }, "add")}
                        onOffline={async ({ name }) => setOffline({ name, presets: [], colorways: [] }, "add")}
                    />);
                }}>
                <PlusIcon width={14} height={14} />
                New...
            </button>
            <StaticOptionsMenu
                menu={<>
                    <button onClick={() => setSortBy(1)} className="dc-contextmenu-item">
                        Name (A-Z)
                        <Radio checked={sortBy === 1} style={{
                            marginLeft: "8px"
                        }} />
                    </button>
                    <button onClick={() => setSortBy(2)} className="dc-contextmenu-item">
                        Name (Z-A)
                        <Radio checked={sortBy === 2} style={{
                            marginLeft: "8px"
                        }} />
                    </button>
                </>}>
                {({ onClick }) => <button
                    onClick={onClick}
                    className="dc-button dc-button-primary"
                >
                    Sort By: {(() => {
                        switch (sortBy) {
                            case 1:
                                return "Name (A-Z)";
                            case 2:
                                return "Name (Z-A)";
                            case 3:
                                return "Source (A-Z)";
                            case 4:
                                return "Source (Z-A)";
                            case 5:
                                return "Source Type (Online First)";
                            case 6:
                                return "Source Type (Offline First)";
                            case 7:
                                return "Color Count (Ascending)";
                            case 8:
                                return "Color Count (Descending)";
                            case 9:
                                return "Most Used";
                            case 10:
                                return "Least Used";
                            default:
                                return "Name (A-Z)";
                        }
                    })()}
                </button>}
            </StaticOptionsMenu>
            <button
                className="dc-button dc-button-primary"
                onClick={() => {
                    if (layout === "normal") return setLayout("compact");
                    else return setLayout("normal");
                }}
            >
                Layout: {layouts.find(l => l.id === layout)?.name}
            </button>
            <button
                className="dc-button dc-button-primary"
                style={{ flexShrink: "0" }}
                onClick={async () => {
                    const file = await chooseFile("application/json");
                    if (!file) return;

                    const reader = new FileReader();
                    reader.onload = () => {
                        try {
                            openModal(props => <NewStoreModal
                                modalProps={props}
                                offlineOnly
                                name={JSON.parse(reader.result as string).name}
                                onOffline={async ({ name }) => {
                                    setOffline({ name, colorways: JSON.parse(reader.result as string).colorways || [], presets: JSON.parse(reader.result as string).presets || [] }, "add");
                                }} />);
                        } catch (err) {
                            console.error("DiscordColorways: " + err);
                        }
                    };
                    reader.readAsText(file);
                }}
            >
                <ImportIcon width={14} height={14} />
                Import Offline...
            </button>
        </ComboTextBox>
        <div className="dc-selector" data-layout={layout}>
            {getComputedStyle(document.body).getPropertyValue("--os-accent-color") ? <div
                className="dc-colorway"
                style={{ cursor: "default" }}
                id="colorwaySource-auto"
            >
                <div className="dc-label-wrapper">
                    <span className="dc-label">OS Accent Color</span>
                    <span className="dc-label dc-subnote dc-note"><div className="dc-badge">Offline • Built-In</div> • Auto Colorway</span>
                </div>
            </div> : <></>}
            {(![
                ...colorwaySourceFiles.map(src => ({ ...src, type: "online" })) as { name: string, url: string, type: "online"; }[],
                ...customColorwayStores.map(src => ({ ...src, type: "offline" })) as { name: string, colorways: Colorway[], type: "offline"; }[]
            ].length && !getComputedStyle(document.body).getPropertyValue("--os-accent-color")) ? <div
                className="dc-colorway"
                id="colorwaySource-missingSource"
                onClick={async () => setOnline({ name: "Project Colorway", url: defaultColorwaySource }, "add")}>
                <WirelessIcon width={30} height={30} style={{ color: "var(--interactive-active)" }} />
                <div className="dc-label-wrapper">
                    <span className="dc-label">It's quite emty in here.</span>
                    <span className="dc-label dc-subnote dc-note">Click here to add the Project Colorway source</span>
                </div>
            </div> : null}
            {[
                ...colorwaySourceFiles.map(src => ({ ...src, type: "online" })) as { name: string, url: string, type: "online"; }[],
                ...customColorwayStores.map(src => ({ ...src, type: "offline" })) as { name: string, colorways: Colorway[], type: "offline"; }[]
            ]
                .filter(src => src.name.toLowerCase().includes(searchValue.toLowerCase()))
                .sort((a, b) => {
                    switch (sortBy) {
                        case SortOptions.NAME_AZ:
                            return a.name.localeCompare(b.name);
                        case SortOptions.NAME_ZA:
                            return b.name.localeCompare(a.name);
                        default:
                            return a.name.localeCompare(b.name);
                    }
                })
                .map((src: ({ name: string; } & ({ colorways?: Colorway[], presets?: Preset[], type: "offline"; } | { type: "online", url: string; })), i: number) => <RightClickContextMenu menu={<>
                    {src.type === "online" ? <><button onClick={() => {
                        Clipboard.copy(src.url as string);
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
                            className="dc-contextmenu-item"
                            onClick={async () => {
                                openModal(props => <NewStoreModal
                                    modalProps={props}
                                    offlineOnly
                                    name={src.name}
                                    onOffline={async ({ name }) => {
                                        const res = await fetch(src.url as string);
                                        const data = await res.json();
                                        setOffline({ name, colorways: data.colorways || [], presets: data.presets || [] }, "add");
                                    }} />);
                            }}
                        >
                            Download...
                            <DownloadIcon width={14} height={14} />
                        </button></> : <button
                            className="dc-contextmenu-item"
                            onClick={async () => {
                                saveFile(new File([JSON.stringify({ "name": src.name, "colorways": [...(src.colorways || []) as Colorway[]], "presets": [...(src.presets || [])] })], `${src.name.replaceAll(" ", "-").toLowerCase()}.colorways.json`, { type: "application/json" }));
                            }}
                        >
                        Export as...
                        <DownloadIcon width={14} height={14} />
                    </button>}
                    <button
                        className="dc-contextmenu-item dc-contextmenu-item-danger"
                        onClick={async () => {
                            openModal(props => <Modal
                                modalProps={props}
                                title="Remove Source"
                                onFinish={async ({ closeModal }) => {
                                    if (src.type === "online") {
                                        setOnline({ name: src.name, url: src.url as string }, "remove");
                                    } else {
                                        setOffline({ name: src.name, colorways: [], presets: [] }, "remove");
                                    }
                                    closeModal();
                                }}
                                confirmMsg="Delete"
                                type="danger"
                            >
                                Are you sure you want to remove this source? This cannot be undone!
                            </Modal>);
                        }}
                    >
                        Remove
                        <DeleteIcon width={14} height={14} />
                    </button>
                </>}>
                    {({ onContextMenu }) => <div
                        className="dc-colorway"
                        style={{ cursor: "default" }}
                        id={"colorwaySource" + src.name}
                        onContextMenu={onContextMenu}>
                        <div className="dc-label-wrapper">
                            <span className="dc-label">{src.name}</span>
                            {src.type === "online" ? <span className="dc-label dc-subnote dc-note">Online • <OnlineSourceMeta source={src.url} onComplete={({ colorways, presets }) => `${(colorways || []).length} colorways • ${(presets || []).length} presets`} /></span> : <span className="dc-label dc-subnote dc-note">Offline • {(src.colorways || []).length} colorways • {(src.presets || []).length} presets</span>}
                        </div>
                        <div style={{ marginRight: "auto" }} />
                        <button
                            className="dc-button dc-button-danger"
                            onClick={async () => {
                                openModal(props => <Modal
                                    modalProps={props}
                                    title="Remove Source"
                                    onFinish={async ({ closeModal }) => {
                                        if (src.type === "online") {
                                            setOnline({ name: src.name, url: src.url as string }, "remove");
                                        } else {
                                            setOffline({ name: src.name, colorways: [], presets: [] }, "remove");
                                        }
                                        closeModal();
                                    }}
                                    confirmMsg="Delete"
                                    type="danger"
                                >
                                    Are you sure you want to remove this source? This cannot be undone!
                                </Modal>);
                            }}
                        >
                            <DeleteIcon width={16} height={16} />
                        </button>
                    </div>}
                </RightClickContextMenu>
                )}
        </div>
    </>;
}
