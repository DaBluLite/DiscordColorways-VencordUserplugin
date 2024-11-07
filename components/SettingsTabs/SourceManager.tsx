/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { DataStore, FluxDispatcher, FluxEvents, openModal, Toasts, useEffect, useState } from "../../";
import { defaultColorwaySource } from "../../constants";
import { contexts, refreshSources, setContext } from "../../contexts";
import { Colorway, SortOptions, StoreItem } from "../../types";
import { chooseFile, Clipboard, saveFile } from "../../utils";
import { updateRemoteSources } from "../../wsClient";
import { CopyIcon, DeleteIcon, DownloadIcon, ImportIcon, PalleteIcon, PlusIcon, WirelessIcon } from "../Icons";
import Modal from "../Modal";
import NewStoreModal from "../Modals/NewStoreModal";
import RightClickContextMenu from "../RightClickContextMenu";
import Selector from "../Selector";
import SourceManagerOptionsMenu from "../SourceManagerOptionsMenu";
import Spinner from "../Spinner";
import TabBar from "../TabBar";

export default function ({
    hasTheme = false
}: {
    hasTheme?: boolean;
}) {
    const [theme, setTheme] = useState(contexts.colorwaysPluginTheme);
    const [active, setActive] = useState("Installed");
    const [colorwaySourceFiles, setColorwaySourceFiles] = useState<{ name: string, url: string; }[]>(contexts.colorwaySourceFiles);
    const [customColorwayStores, setCustomColorwayStores] = useState<{ name: string, colorways: Colorway[]; }[]>(contexts.customColorways);
    const [storeObject, setStoreObject] = useState<StoreItem[]>([]);
    const [searchValue, setSearchValue] = useState<string>("");
    const [searchValuee, setSearchValuee] = useState<string>("");
    const [sortBy, setSortBy] = useState<SortOptions>(SortOptions.NAME_AZ);
    const [layout, setLayout] = useState<"normal" | "compact">("normal");
    const [showSpinner, setShowSpinner] = useState<boolean>(false);

    function setOnline(obj: { name: string, url: string; }, action: "add" | "remove") {
        if (action === "add") {
            const srcList = [...colorwaySourceFiles, obj];
            setColorwaySourceFiles(srcList);
            setContext("colorwaySourceFiles", srcList);
        }
        if (action === "remove") {
            const srcList = colorwaySourceFiles.filter(src => src.name !== obj.name && src.url !== obj.url);
            setColorwaySourceFiles(srcList);
            setContext("colorwaySourceFiles", srcList);
        }
        refreshSources();
        updateRemoteSources();
    }

    function setOffline(obj: { name: string, colorways: Colorway[]; }, action: "add" | "remove") {
        if (action === "add") {
            const srcList = [...customColorwayStores, obj];
            setCustomColorwayStores(srcList);
            setContext("customColorways", srcList);
        }
        if (action === "remove") {
            const srcList = customColorwayStores.filter(src => src.name !== obj.name);
            setCustomColorwayStores(srcList);
            setContext("customColorways", srcList);
        }
        updateRemoteSources();
    }

    useEffect(() => {
        updateRemoteSources();

        (async function () {
            const res: Response = await fetch("https://dablulite.vercel.app/?q=" + encodeURI(searchValue));
            const data = await res.json();
            setStoreObject(data.sources);
        })();

        FluxDispatcher.subscribe("COLORWAYS_UPDATE_THEME" as FluxEvents, ({ theme }) => setTheme(theme));

        return () => {
            FluxDispatcher.unsubscribe("COLORWAYS_UPDATE_THEME" as FluxEvents, ({ theme }) => setTheme(theme));
        };
    }, []);

    return <div className="colorwaysModalTab" data-theme={hasTheme ? theme : "discord"}>
        <TabBar active={active} container={({ children }) => <div className="colorwaysPageHeader">{children}</div>} onChange={setActive} items={[
            {
                name: "Installed",
                component: () => <div className="colorwayInnerTab">
                    <input
                        type="text"
                        className="colorwayTextBox"
                        placeholder="Search for sources..."
                        value={searchValuee}
                        autoFocus
                        onInput={({ currentTarget: { value } }) => setSearchValuee(value)}
                    />
                    <Spinner className={`colorwaySelectorSpinner${!showSpinner ? " colorwaySelectorSpinner-hidden" : ""}`} />
                    <div style={{
                        display: "flex",
                        gap: "8px"
                    }}>
                        <button
                            className="colorwaysPillButton colorwaysPillButton-primary"
                            style={{ flexShrink: "0" }}
                            onClick={() => {
                                openModal(props => <NewStoreModal
                                    modalProps={props}
                                    onOnline={async ({ name, url }) => setOnline({ name, url }, "add")}
                                    onOffline={async ({ name }) => setOffline({ name, colorways: [] }, "add")}
                                />);
                            }}>
                            <PlusIcon width={14} height={14} />
                            New...
                        </button>
                        <SourceManagerOptionsMenu
                            sort={sortBy}
                            layout={layout}
                            onSortChange={newSort => {
                                setSortBy(newSort);
                            }}
                            onLayout={l => {
                                setLayout(l);
                            }}
                        />
                        <button
                            className="colorwaysPillButton colorwaysPillButton-primary"
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
                                                setOffline({ name, colorways: JSON.parse(reader.result as string).colorways }, "add");
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
                    </div>
                    <div className="colorways-selector" data-layout={layout}>
                        {getComputedStyle(document.body).getPropertyValue("--os-accent-color") ? <div
                            className="discordColorway"
                            style={{ cursor: "default" }}
                            id="colorwaySource-auto"
                        >
                            <div className="colorwayLabelContainer">
                                <span className="colorwayLabel">OS Accent Color</span>
                                <span className="colorwayLabel colorwayLabelSubnote colorwaysNote"><div className="colorways-badge">Offline • Built-In</div> • Auto Colorway</span>
                            </div>
                        </div> : <></>}
                        {(![
                            ...colorwaySourceFiles.map(src => ({ ...src, type: "online" })) as { name: string, url: string, type: "online"; }[],
                            ...customColorwayStores.map(src => ({ ...src, type: "offline" })) as { name: string, colorways: Colorway[], type: "offline"; }[]
                        ].length && !getComputedStyle(document.body).getPropertyValue("--os-accent-color")) ? <div
                            className="discordColorway"
                            id="colorwaySource-missingSource"
                            onClick={async () => setOnline({ name: "Project Colorway", url: defaultColorwaySource }, "add")}>
                            <WirelessIcon width={30} height={30} style={{ color: "var(--interactive-active)" }} />
                            <div className="colorwayLabelContainer">
                                <span className="colorwayLabel">It's quite emty in here.</span>
                                <span className="colorwayLabel colorwayLabelSubnote colorwaysNote">Click here to add the Project Colorway source</span>
                            </div>
                        </div> : null}
                        {[
                            ...colorwaySourceFiles.map(src => ({ ...src, type: "online" })) as { name: string, url: string, type: "online"; }[],
                            ...customColorwayStores.map(src => ({ ...src, type: "offline" })) as { name: string, colorways: Colorway[], type: "offline"; }[]
                        ]
                            .filter(src => src.name.toLowerCase().includes(searchValuee.toLowerCase()))
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
                            .map((src: { name: string, url?: string, colorways?: Colorway[], type: "online" | "offline"; }, i: number) => <RightClickContextMenu menu={<>
                                {src.type === "online" ? <><button onClick={() => {
                                    Clipboard.copy(src.url as string);
                                    Toasts.show({
                                        message: "Copied URL Successfully",
                                        type: 1,
                                        id: "copy-url-notify",
                                    });
                                }} className="colorwaysContextMenuItm">
                                    Copy URL
                                    <CopyIcon width={16} height={16} style={{
                                        marginLeft: "8px"
                                    }} />
                                </button>
                                    <button
                                        className="colorwaysContextMenuItm"
                                        onClick={async () => {
                                            openModal(props => <NewStoreModal
                                                modalProps={props}
                                                offlineOnly
                                                name={src.name}
                                                onOffline={async ({ name }) => {
                                                    const res = await fetch(src.url as string);
                                                    const data = await res.json();
                                                    setOffline({ name, colorways: data.colorways }, "add");
                                                }} />);
                                        }}
                                    >
                                        Download...
                                        <DownloadIcon width={14} height={14} />
                                    </button></> : <button
                                        className="colorwaysContextMenuItm"
                                        onClick={async () => {
                                            saveFile(new File([JSON.stringify({ "name": src.name, "colorways": [...src.colorways as Colorway[]] })], `${src.name.replaceAll(" ", "-").toLowerCase()}.colorways.json`, { type: "application/json" }));
                                        }}
                                    >
                                    Export as...
                                    <DownloadIcon width={14} height={14} />
                                </button>}
                                <button
                                    className="colorwaysContextMenuItm colorwaysContextMenuItm-danger"
                                    onClick={async () => {
                                        openModal(props => <Modal
                                            modalProps={props}
                                            title="Remove Source"
                                            onFinish={async ({ closeModal }) => {
                                                if (src.type === "online") {
                                                    setOnline({ name: src.name, url: src.url as string }, "remove");
                                                } else {
                                                    setOffline({ name: src.name, colorways: [] }, "remove");
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
                                    className="discordColorway"
                                    style={{ cursor: "default" }}
                                    id={"colorwaySource" + src.name}
                                    onContextMenu={onContextMenu}>
                                    <div className="colorwayLabelContainer">
                                        <span className="colorwayLabel">{src.name}</span>
                                        {src.type === "online" ? <span className="colorwayLabel colorwayLabelSubnote colorwaysNote"><div className="colorways-badge">Online{src.url as string === defaultColorwaySource ? " • Built-In" : ""}</div> • on {src.url as string}</span> : <span className="colorwayLabel colorwayLabelSubnote colorwaysNote"><div className="colorways-badge">Offline</div> • {(src.colorways as Colorway[]).length} colorways</span>}
                                    </div>
                                    <div style={{ marginRight: "auto" }} />
                                    <button
                                        className="colorwaysPillButton colorwaysPillButton-danger"
                                        onClick={async () => {
                                            openModal(props => <Modal
                                                modalProps={props}
                                                title="Remove Source"
                                                onFinish={async ({ closeModal }) => {
                                                    if (src.type === "online") {
                                                        setOnline({ name: src.name, url: src.url as string }, "remove");
                                                    } else {
                                                        setOffline({ name: src.name, colorways: [] }, "remove");
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
                </div>
            },
            {
                name: "Discover",
                component: () => <div className="colorwayInnerTab">
                    <div style={{ display: "flex", marginBottom: "8px" }}>
                        <input
                            type="text"
                            className="colorwayTextBox"
                            placeholder="Search for sources..."
                            value={searchValue}
                            onChange={e => setSearchValue(e.currentTarget.value)}
                        />
                        <button
                            className="colorwaysPillButton colorwaysPillButton-primary"
                            style={{ marginLeft: "8px", marginTop: "auto", marginBottom: "auto" }}
                            onClick={async function () {
                                const res: Response = await fetch("https://dablulite.vercel.app/");
                                const data = await res.json();
                                setStoreObject(data.sources);
                                setColorwaySourceFiles(await DataStore.get("colorwaySourceFiles") as { name: string, url: string; }[]);
                                setContext("colorwaySourceFiles", await DataStore.get("colorwaySourceFiles") as { name: string, url: string; }[]);
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
                    </div>
                    <div className="colorways-selector">
                        {storeObject.map((item: StoreItem) =>
                            item.name.toLowerCase().includes(searchValue.toLowerCase()) ? <RightClickContextMenu menu={<>
                                <button onClick={() => {
                                    Clipboard.copy(item.url);
                                    Toasts.show({
                                        message: "Copied URL Successfully",
                                        type: 1,
                                        id: "copy-url-notify",
                                    });
                                }} className="colorwaysContextMenuItm">
                                    Copy URL
                                    <CopyIcon width={16} height={16} style={{
                                        marginLeft: "8px"
                                    }} />
                                </button>
                                <button
                                    className="colorwaysContextMenuItm"
                                    onClick={() => {
                                        openModal(props => <Modal
                                            modalProps={props}
                                            title={"Previewing colorways for " + item.name}
                                            onFinish={() => { }}
                                            confirmMsg="Done"
                                        >
                                            <div className="colorwayInnerTab" style={{ flexGrow: "1" }}>
                                                <Selector settings={{ selectorType: "preview", previewSource: item.url }} />
                                            </div>
                                        </Modal>);
                                    }}
                                >
                                    Preview
                                    <PalleteIcon width={16} height={16} style={{
                                        marginLeft: "8px"
                                    }} />
                                </button>
                                <button
                                    className={`colorwaysContextMenuItm${colorwaySourceFiles.map(source => source.name).includes(item.name) ? " colorwaysContextMenuItm-danger" : ""}`}
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
                                    className="discordColorway"
                                    style={{ cursor: "default" }}
                                    id={"colorwaySource" + item.name}
                                    onContextMenu={onContextMenu}>
                                    <div className="colorwayLabelContainer">
                                        <span className="colorwayLabel">{item.name}</span>
                                        <span className="colorwayLabel colorwayLabelSubnote colorwaysNote">{item.description} • by {item.authorGh}</span>
                                    </div>
                                    <div style={{ marginRight: "auto" }} />
                                    <button
                                        className={`colorwaysPillButton ${colorwaySourceFiles.map(source => source.name).includes(item.name) ? "colorwaysPillButton-danger" : "colorwaysPillButton-secondary"}`}
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
                                    <a role="link" className="colorwaysPillButton colorwaysPillButton-secondary" target="_blank" href={"https://github.com/" + item.authorGh}>
                                        <img src="/assets/6a853b4c87fce386cbfef4a2efbacb09.svg" width={16} height={16} alt="GitHub" />
                                    </a>
                                </div>}
                            </RightClickContextMenu> : <></>
                        )}
                    </div>
                </div>
            }
        ]} />
    </div>;
}
