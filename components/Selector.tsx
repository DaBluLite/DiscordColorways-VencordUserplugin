/*
 * Vencord, a Discord client mod
 * Copyright (c) 2023 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/* eslint-disable arrow-parens */

import * as DataStore from "@api/DataStore";
import { Flex } from "@components/Flex";
import { SettingsTab } from "@components/VencordSettings/shared";
import { ModalContent, ModalFooter, ModalHeader, ModalProps, ModalRoot, openModal } from "@utils/modal";
import { findByPropsLazy } from "@webpack";
import {
    Button,
    ButtonLooks,
    Forms,
    Menu,
    Popout,
    ScrollerThin,
    Select,
    SettingsRouter,
    TextInput,
    Tooltip,
    useEffect,
    useState,
} from "@webpack/common";
import { ReactNode } from "react";

import { ColorwayCSS } from "..";
import { generateCss, getAutoPresets, gradientBase } from "../css";
import { Colorway, ColorwayObject, SourceObject } from "../types";
import { colorToHex } from "../utils";
import AutoColorwaySelector from "./AutoColorwaySelector";
import ColorPickerModal from "./ColorPicker";
import CreatorModal from "./CreatorModal";
import ColorwayInfoModal from "./InfoModal";

const { SelectionCircle } = findByPropsLazy("SelectionCircle");

function SelectorContainer({ children, isSettings, modalProps }: { children: ReactNode, isSettings?: boolean, modalProps: ModalProps; }) {
    if (!isSettings) {
        return <ModalRoot {...modalProps} className="colorwaySelectorModal">
            {children}
        </ModalRoot>;
    } else {
        return <SettingsTab title="Colors">
            <div className="colorwaysSettingsSelector-wrapper">
                {children}
            </div>
        </SettingsTab>;
    }
}

function SelectorHeader({ children, isSettings }: { children: ReactNode, isSettings?: boolean; }) {
    if (!isSettings) {
        return <ModalHeader className="colorwaySelectorModal-header">
            {children}
        </ModalHeader>;
    } else {
        return <Flex style={{ gap: "0" }}>
            {children}
        </Flex>;
    }
}

function SelectorContent({ children, isSettings }: { children: ReactNode, isSettings?: boolean; }) {
    if (!isSettings) {
        return <ModalContent className="colorwaySelectorModalContent">{children}</ModalContent>;
    } else {
        return <>{children}</>;
    }
}

export default function ({
    modalProps,
    isSettings
}: {
    modalProps: ModalProps,
    isSettings?: boolean;
}): JSX.Element | any {
    const [currentColorwayObject, setCurrentColorwayObject] = useState<ColorwayObject>({ id: null, css: null, sourceType: null, source: null });
    const [colorwayData, setColorwayData] = useState<SourceObject[]>([]);
    const [customColorways, setCustomColorways] = useState<SourceObject[]>([]);
    const [searchString, setSearchString] = useState<string>("");
    const [loaderHeight, setLoaderHeight] = useState<string>("2px");
    const [visibility, setVisibility] = useState<string>("all");
    const [showReloadMenu, setShowReloadMenu] = useState(false);

    const filters = [
        {
            name: "All",
            id: "all",
            sources: [...colorwayData, ...customColorways]
        },
        {
            name: "Online",
            id: "online",
            sources: colorwayData
        },
        ...customColorways.map(source => {
            return {
                name: source.source,
                id: source.source.toLowerCase().replaceAll(" ", "-"),
                sources: [source]
            };
        })
    ];

    async function loadUI(force?: boolean) {
        const responses: Response[] = await Promise.all(
            (await DataStore.get("colorwaySourceFiles") as string[]).map((url: string) =>
                fetch(url, force ? { cache: "no-store" } : {})
            )
        );
        const data = await Promise.all(
            responses.map((res: Response) =>
                res.json().then(dt => { return { colorways: dt.colorways as Colorway[], source: res.url, type: "online" }; }).catch(() => { return { colorways: [] as Colorway[], source: res.url, type: "online" }; })
            )) as { type: "online" | "offline", source: string, colorways: Colorway[]; }[];
        setColorwayData([...data]);
        setCurrentColorwayObject(await DataStore.get("activeColorwayObject") as ColorwayObject);

        setCustomColorways((await DataStore.get("customColorways") as { name: string, colorways: Colorway[], id?: string; }[]).map((colorSrc: { name: string, colorways: Colorway[], id?: string; }) => {
            return { type: "offline", source: colorSrc.name, colorways: colorSrc.colorways };
        }));
    }

    async function searchColorways(e: string) {
        if (!e) {
            loadUI();
            return;
        }
        const responses: Response[] = await Promise.all(
            (await DataStore.get("colorwaySourceFiles") as string[]).map((url: string) =>
                fetch(url)
            )
        );
        const data = await Promise.all(
            responses.map((res: Response) =>
                res.json().then(dt => { return { colorways: dt.colorways as Colorway[], source: res.url, type: "online" }; }).catch(() => { return { colorways: [] as Colorway[], source: res.url, type: "online" }; })
            )) as { type: "online" | "offline", source: string, colorways: Colorway[]; }[];

        setColorwayData(data.map((colorSrc: SourceObject) => {
            return { type: "online", source: colorSrc.source, colorways: colorSrc.colorways.filter(colorway => colorway.name.toLowerCase().includes(e.toLowerCase())) };
        }));

        setCustomColorways((await DataStore.get("customColorways") as { name: string, colorways: Colorway[], id?: string; }[]).map((colorSrc: { name: string, colorways: Colorway[], id?: string; }) => {
            const newColorList: Colorway[] = [];
            colorSrc.colorways.find((Colorway: Colorway) => {
                if (Colorway.name.toLowerCase().includes(e.toLowerCase()))
                    newColorList.push(Colorway);
            });
            return { type: "offline", source: colorSrc.name, colorways: newColorList };
        }));
    }

    useEffect(() => {
        if (!searchString) {
            loadUI();
        }
        setLoaderHeight("0px");
    }, [searchString]);

    function ReloadPopout(onClose: () => void) {
        return (
            <Menu.Menu
                navId="dc-reload-menu"
                onClose={onClose}
            >
                <Menu.MenuItem
                    id="dc-force-reload"
                    label="Force Reload"
                    action={() => loadUI(true)}
                />
            </Menu.Menu>
        );
    }

    return (
        <SelectorContainer modalProps={modalProps} isSettings={isSettings}>
            <SelectorHeader isSettings={isSettings}>
                <TextInput
                    className="colorwaySelector-search"
                    placeholder="Search for Colorways..."
                    value={searchString}
                    onChange={(e: string) => [searchColorways, setSearchString].forEach(t => t(e))}
                />
                <Tooltip text="Refresh Colorways...">
                    {({ onMouseEnter, onMouseLeave }) => {
                        return <Popout
                            position="bottom"
                            align="right"
                            animation={Popout.Animation.NONE}
                            shouldShow={showReloadMenu}
                            onRequestClose={() => setShowReloadMenu(false)}
                            renderPopout={() => ReloadPopout(() => setShowReloadMenu(false))}
                        >
                            {(_, { isShown }) => (
                                <Button
                                    innerClassName="colorwaysSettings-iconButtonInner"
                                    size={Button.Sizes.ICON}
                                    color={Button.Colors.PRIMARY}
                                    look={Button.Looks.OUTLINED}
                                    style={{ marginLeft: "8px" }}
                                    id="colorway-refreshcolorway"
                                    onMouseEnter={isShown ? () => { } : onMouseEnter}
                                    onMouseLeave={isShown ? () => { } : onMouseLeave}
                                    onClick={() => {
                                        setLoaderHeight("2px");
                                        loadUI().then(() => setLoaderHeight("0px"));
                                    }}
                                    onContextMenu={() => { onMouseLeave(); setShowReloadMenu(v => !v); }}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        x="0px"
                                        y="0px"
                                        width="20"
                                        height="20"
                                        style={{ padding: "6px", boxSizing: "content-box" }}
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                    >
                                        <rect
                                            y="0"
                                            fill="none"
                                            width="24"
                                            height="24"
                                        />
                                        <path d="M6.351,6.351C7.824,4.871,9.828,4,12,4c4.411,0,8,3.589,8,8h2c0-5.515-4.486-10-10-10 C9.285,2,6.779,3.089,4.938,4.938L3,3v6h6L6.351,6.351z" />
                                        <path d="M17.649,17.649C16.176,19.129,14.173,20,12,20c-4.411,0-8-3.589-8-8H2c0,5.515,4.486,10,10,10 c2.716,0,5.221-1.089,7.062-2.938L21,21v-6h-6L17.649,17.649z" />
                                    </svg>
                                </Button>
                            )}
                        </Popout>;
                    }}
                </Tooltip>
                <Tooltip text="Create Colorway...">
                    {({ onMouseEnter, onMouseLeave }) => <Button
                        innerClassName="colorwaysSettings-iconButtonInner"
                        size={Button.Sizes.ICON}
                        color={Button.Colors.PRIMARY}
                        look={Button.Looks.OUTLINED}
                        style={{ marginLeft: "8px" }}
                        onMouseEnter={onMouseEnter}
                        onMouseLeave={onMouseLeave}
                        onClick={() => openModal((props) => <CreatorModal
                            modalProps={props}
                            loadUIProps={loadUI}
                        />)}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            aria-hidden="true"
                            role="img"
                            width="20"
                            height="20"
                            style={{ padding: "6px", boxSizing: "content-box" }}
                            viewBox="0 0 24 24"
                        >
                            <path
                                fill="currentColor"
                                d="M20 11.1111H12.8889V4H11.1111V11.1111H4V12.8889H11.1111V20H12.8889V12.8889H20V11.1111Z"
                            />
                        </svg>
                    </Button>}
                </Tooltip>
                <Tooltip text="Open Color Stealer">
                    {({ onMouseEnter, onMouseLeave }) => <Button
                        innerClassName="colorwaysSettings-iconButtonInner"
                        size={Button.Sizes.ICON}
                        color={Button.Colors.PRIMARY}
                        look={Button.Looks.OUTLINED}
                        style={{ marginLeft: "8px" }}
                        id="colorway-opencolorstealer"
                        onMouseEnter={onMouseEnter}
                        onMouseLeave={onMouseLeave}
                        onClick={() => openModal((props) => <ColorPickerModal modalProps={props} />)}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" style={{ padding: "6px", boxSizing: "content-box" }} fill="currentColor" viewBox="0 0 16 16">
                            <path d="M12.433 10.07C14.133 10.585 16 11.15 16 8a8 8 0 1 0-8 8c1.996 0 1.826-1.504 1.649-3.08-.124-1.101-.252-2.237.351-2.92.465-.527 1.42-.237 2.433.07zM8 5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm4.5 3a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zM5 6.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm.5 6.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
                        </svg>
                    </Button>}
                </Tooltip>
                {isSettings ? <Select
                    className={"colorwaySelector-sources " + ButtonLooks.OUTLINED + " colorwaySelector-sources_settings"}
                    look={1}
                    popoutClassName="colorwaySelector-sourceSelect"
                    options={filters.map(filter => { return { label: filter.name, value: (filter.id as string) }; })}
                    select={value => setVisibility(value)}
                    isSelected={value => visibility === value}
                    serialize={String}
                    popoutPosition="bottom" /> : <></>}
            </SelectorHeader>
            <SelectorContent isSettings={isSettings}>
                <div className="colorwaysLoader-barContainer"><div className="colorwaysLoader-bar" style={{ height: loaderHeight }} /></div>
                <ScrollerThin style={{ maxHeight: "450px" }} className="ColorwaySelectorWrapper">
                    {getComputedStyle(document.body).getPropertyValue("--os-accent-color") && ["all", "official"].includes(visibility) ? <Tooltip text="Auto">
                        {({ onMouseEnter, onMouseLeave }) => <div
                            className="discordColorway"
                            id="colorway-Auto"
                            onMouseEnter={onMouseEnter}
                            onMouseLeave={onMouseLeave}
                            onClick={async () => {
                                const activeAutoPreset = await DataStore.get("activeAutoPreset");
                                if (currentColorwayObject.id === "Auto") {
                                    DataStore.set("activeColorwayObject", { id: null, css: null, sourceType: null, source: null });
                                    setCurrentColorwayObject({ id: null, css: null, sourceType: null, source: null });
                                    ColorwayCSS.remove();
                                } else {
                                    if (!activeAutoPreset) {
                                        openModal((props: ModalProps) => <AutoColorwaySelector autoColorwayId="" modalProps={props} onChange={autoPresetId => {
                                            const demandedColorway = getAutoPresets(colorToHex(getComputedStyle(document.body).getPropertyValue("--os-accent-color")).slice(0, 6))[autoPresetId].preset();
                                            ColorwayCSS.set(demandedColorway);
                                            DataStore.set("activeColorwayObject", { id: "Auto", css: demandedColorway, sourceType: "online", source: null });
                                            setCurrentColorwayObject({ id: "Auto", css: demandedColorway, sourceType: "online", source: null });
                                        }} />);
                                    } else {
                                        const autoColorway = getAutoPresets(colorToHex(getComputedStyle(document.body).getPropertyValue("--os-accent-color")).slice(0, 6))[activeAutoPreset].preset();
                                        DataStore.set("activeColorwayObject", { id: "Auto", css: autoColorway, sourceType: "online", source: null });
                                        setCurrentColorwayObject({ id: "Auto", css: autoColorway, sourceType: "online", source: null });
                                        ColorwayCSS.set(autoColorway);
                                    }
                                }
                            }}
                        >
                            <div
                                className="colorwayInfoIconContainer"
                                onClick={async (e) => {
                                    e.stopPropagation();
                                    const activeAutoPreset = await DataStore.get("activeAutoPreset");
                                    openModal((props: ModalProps) => <AutoColorwaySelector autoColorwayId={activeAutoPreset} modalProps={props} onChange={autoPresetId => {
                                        if (currentColorwayObject.id === "Auto") {
                                            const demandedColorway = getAutoPresets(colorToHex(getComputedStyle(document.body).getPropertyValue("--os-accent-color")).slice(0, 6))[autoPresetId].preset();
                                            DataStore.set("activeColorwayObject", { id: "Auto", css: demandedColorway, sourceType: "online", source: null });
                                            setCurrentColorwayObject({ id: "Auto", css: demandedColorway, sourceType: "online", source: null });
                                            ColorwayCSS.set(demandedColorway);
                                        }
                                    }} />);
                                }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" style={{ margin: "4px" }} viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M 21.2856,9.6 H 24 v 4.8 H 21.2868 C 20.9976,15.5172 20.52,16.5576 19.878,17.4768 L 21.6,19.2 19.2,21.6 17.478,19.8768 c -0.9216,0.642 -1.9596,1.1208 -3.078,1.4088 V 24 H 9.6 V 21.2856 C 8.4828,20.9976 7.4436,20.5188 6.5232,19.8768 L 4.8,21.6 2.4,19.2 4.1232,17.4768 C 3.4812,16.5588 3.0024,15.5184 2.7144,14.4 H 0 V 9.6 H 2.7144 C 3.0024,8.4816 3.48,7.4424 4.1232,6.5232 L 2.4,4.8 4.8,2.4 6.5232,4.1232 C 7.4424,3.48 8.4816,3.0024 9.6,2.7144 V 0 h 4.8 v 2.7132 c 1.1184,0.2892 2.1564,0.7668 3.078,1.4088 l 1.722,-1.7232 2.4,2.4 -1.7232,1.7244 c 0.642,0.9192 1.1208,1.9596 1.4088,3.0768 z M 12,16.8 c 2.65092,0 4.8,-2.14908 4.8,-4.8 0,-2.650968 -2.14908,-4.8 -4.8,-4.8 -2.650968,0 -4.8,2.149032 -4.8,4.8 0,2.65092 2.149032,4.8 4.8,4.8 z" />
                                </svg>
                            </div>
                            <div className="discordColorwayPreviewColorContainer" style={{ backgroundColor: "var(--os-accent-color)" }} />
                            {currentColorwayObject.id === "Auto" && <SelectionCircle />}
                        </div>}
                    </Tooltip> : <></>}
                    {(!getComputedStyle(document.body).getPropertyValue("--os-accent-color") || !["all", "official"].includes(visibility)) && !filters.filter(filter => filter.id === visibility)[0].sources.map(source => source.colorways).flat().length ? <Forms.FormTitle
                        style={{
                            marginBottom: 0,
                            width: "100%",
                            textAlign: "center"
                        }}
                    >
                        No colorways...
                    </Forms.FormTitle> : <></>}
                    {filters.map(filter => filter.id).includes(visibility) && (
                        filters.filter(filter => filter.id === visibility)[0].sources.map(source => {
                            return source.colorways.map((color: Colorway) => {
                                var colors: Array<string> = color.colors || [
                                    "accent",
                                    "primary",
                                    "secondary",
                                    "tertiary",
                                ];
                                return (
                                    <Tooltip text={color.name}>
                                        {({ onMouseEnter, onMouseLeave }) => {
                                            return (
                                                <div
                                                    className="discordColorway"
                                                    id={"colorway-" + color.name}
                                                    onMouseEnter={onMouseEnter}
                                                    onMouseLeave={onMouseLeave}
                                                    onClick={async () => {
                                                        const [
                                                            onDemandWays,
                                                            onDemandWaysTintedText,
                                                            onDemandWaysDiscordSaturation,
                                                            onDemandWaysOsAccentColor
                                                        ] = await DataStore.getMany([
                                                            "onDemandWays",
                                                            "onDemandWaysTintedText",
                                                            "onDemandWaysDiscordSaturation",
                                                            "onDemandWaysOsAccentColor"
                                                        ]);
                                                        if (currentColorwayObject.id === color.name && currentColorwayObject.source === source.source) {
                                                            DataStore.set("activeColorwayObject", { id: null, css: null, sourceType: null, source: null });
                                                            setCurrentColorwayObject({ id: null, css: null, sourceType: null, source: null });
                                                            ColorwayCSS.remove();
                                                        } else {
                                                            if (onDemandWays) {
                                                                const demandedColorway = !color.isGradient ? generateCss(
                                                                    colorToHex(color.primary),
                                                                    colorToHex(color.secondary),
                                                                    colorToHex(color.tertiary),
                                                                    colorToHex(onDemandWaysOsAccentColor ? getComputedStyle(document.body).getPropertyValue("--os-accent-color") : color.accent).slice(0, 6),
                                                                    onDemandWaysTintedText,
                                                                    onDemandWaysDiscordSaturation
                                                                ) : gradientBase(colorToHex(onDemandWaysOsAccentColor ? getComputedStyle(document.body).getPropertyValue("--os-accent-color") : color.accent), onDemandWaysDiscordSaturation) + `:root:root {--custom-theme-background: linear-gradient(${color.linearGradient})}`;
                                                                ColorwayCSS.set(demandedColorway);
                                                                setCurrentColorwayObject({ id: color.name, css: demandedColorway, sourceType: source.type, source: source.source });
                                                                DataStore.set("activeColorwayObject", { id: color.name, css: demandedColorway, sourceType: source.type, source: source.source });
                                                            } else {
                                                                ColorwayCSS.set(color["dc-import"]);
                                                                setCurrentColorwayObject({ id: color.name, css: color["dc-import"], sourceType: source.type, source: source.source });
                                                                DataStore.set("activeColorwayObject", { id: color.name, css: color["dc-import"], sourceType: source.type, source: source.source });
                                                            }
                                                        }
                                                    }}
                                                >
                                                    <div
                                                        className="colorwayInfoIconContainer"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            openModal((props) => <ColorwayInfoModal
                                                                modalProps={props}
                                                                colorwayProps={color}
                                                                offlineSourceName={source.type === "offline" ? source.source : ""}
                                                                loadUIProps={loadUI}
                                                            />);
                                                        }}
                                                    >
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            width="20"
                                                            height="20"
                                                            fill="currentColor"
                                                            viewBox="0 0 16 16"
                                                        >
                                                            <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
                                                        </svg>
                                                    </div>
                                                    <div className="discordColorwayPreviewColorContainer">
                                                        {!color.isGradient ? colors.map((colorItm) => <div
                                                            className="discordColorwayPreviewColor"
                                                            style={{
                                                                backgroundColor: color[colorItm],
                                                            }}
                                                        />) : <div
                                                            className="discordColorwayPreviewColor"
                                                            style={{
                                                                background: `linear-gradient(${color.linearGradient})`,
                                                            }}
                                                        />}
                                                    </div>
                                                    {(currentColorwayObject.id === color.name && currentColorwayObject.source === source.source) && <SelectionCircle />}
                                                </div>
                                            );
                                        }}
                                    </Tooltip>
                                );
                            });
                        })
                    )}
                </ScrollerThin>
            </SelectorContent>
            {!isSettings ? <ModalFooter>
                <Button
                    size={Button.Sizes.MEDIUM}
                    color={Button.Colors.PRIMARY}
                    look={Button.Looks.OUTLINED}
                    style={{ marginLeft: "8px" }}
                    onClick={() => {
                        SettingsRouter.open("ColorwaysSettings");
                        modalProps.onClose();
                    }}
                >
                    Settings
                </Button>
                <Button
                    size={Button.Sizes.MEDIUM}
                    color={Button.Colors.PRIMARY}
                    look={Button.Looks.OUTLINED}
                    onClick={() => modalProps.onClose()}
                >
                    Close
                </Button>
                <Select
                    className={"colorwaySelector-sources " + ButtonLooks.OUTLINED}
                    look={1}
                    popoutClassName="colorwaySelector-sourceSelect"
                    options={filters.map(filter => { return { label: filter.name, value: (filter.id as string) }; })}
                    select={value => setVisibility(value)}
                    isSelected={value => visibility === value}
                    serialize={String}
                    popoutPosition="top" />
            </ModalFooter> : <></>}
        </SelectorContainer >
    );
}
