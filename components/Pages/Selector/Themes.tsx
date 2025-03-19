/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { useState } from "../../..";
import { Hooks } from "../../../api";
import { openModal } from "../../../api/Modals";
import { getThemeInfo, UserThemeHeader } from "../../../api/Themes";
import { Fs } from "../../../api/Utils";
import { SortOptions } from "../../../types";
import ColorwayItem from "../../Colorway";
import ComboTextBox from "../../ComboTextBox";
import { DeleteIcon, PalleteIcon, PlusIcon, WirelessIcon } from "../../Icons";
import Modal from "../../Modal";
import Radio from "../../Radio";
import ReloadButton from "../../ReloadButton";
import Spinner from "../../Spinner";
import StaticOptionsMenu from "../../StaticOptionsMenu";
import Switch from "../../Switch";

export default function Themes() {
    const [enabledColorwayThemes, setEnabledColorwayThemes] = Hooks.useContextualState("enabledColorwayThemes");
    const [colorwayThemes, setColorwayThemes] = Hooks.useContextualState("colorwayThemes");
    const [searchValue, setSearchValue] = useState<string>("");
    const [sortBy, setSortBy] = useState<SortOptions>(SortOptions.NAME_AZ);
    const [showSpinner, setShowSpinner] = useState<boolean>(false);

    return <>
        <ComboTextBox
            placeholder="Search for Themes..."
            value={searchValue}
            onInput={setSearchValue}
        >
            <Spinner className={`dc-selector-spinner${!showSpinner ? " dc-selector-spinner-hidden" : ""}`} />
            <ReloadButton setShowSpinner={setShowSpinner} />
            <button
                className="dc-button dc-button-primary"
                onClick={async () => {
                    const file = await Fs.chooseFile("text/css");
                    if (file) {
                        const text = await file.text();
                        if (getThemeInfo(text, file.name)) {
                            setColorwayThemes(cThemes => {
                                return [...cThemes.filter(t => t[0] !== file.name), [file.name, text]];
                            });
                        }
                    }
                }}
            >
                <PlusIcon width={14} height={14} style={{ boxSizing: "content-box" }} />
                Add...
            </button>
            <StaticOptionsMenu
                xPos="right"
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
                            default:
                                return "Name (A-Z)";
                        }
                    })()}
                </button>}
            </StaticOptionsMenu>
        </ComboTextBox>
        <div style={{ maxHeight: "unset" }} className="dc-selector" data-layout="normal">
            {colorwayThemes
                .map(theme => ({ css: theme[1], header: getThemeInfo(theme[1], theme[0]) }))
                .filter(({ header: { name } }) => name.toLowerCase().includes(searchValue.toLowerCase()))
                .flat()
                .sort((a, b) => {
                    switch (sortBy) {
                        case SortOptions.NAME_AZ:
                            return a.header.name.localeCompare(b.header.name);
                        case SortOptions.NAME_ZA:
                            return b.header.name.localeCompare(a.header.name);
                        default:
                            return a.header.name.localeCompare(b.header.name);
                    }
                })
                .map(({ css, header: theme }: { css: string, header: UserThemeHeader; }, i: number) => <ColorwayItem
                    id={"theme-" + theme.name}
                    key={i}
                    prefix={() => <PalleteIcon width={24} height={24} />}
                    menu={<>
                        <button onClick={() => {
                            openModal(props => <Modal
                                modalProps={props}
                                title="Delete Theme"
                                onFinish={async ({ closeModal }) => {
                                    setEnabledColorwayThemes(dcd => {
                                        if (dcd[theme.name]) delete dcd[theme.name];
                                        return dcd;
                                    });
                                    setColorwayThemes(ct => {
                                        return ct.filter(them => them[0] !== theme.fileName);
                                    });
                                    closeModal();
                                }}
                                confirmMsg="Delete"
                                type="danger"
                            >
                                Are you sure you want to delete this theme? This cannot be undone!
                            </Modal>);
                        }} className="dc-contextmenu-item dc-contextmenu-item-danger">
                            Delete Theme...
                            <DeleteIcon width={16} height={16} style={{
                                marginLeft: "8px"
                            }} />
                        </button>
                    </>}
                    suffix={() => <Switch
                        value={enabledColorwayThemes[theme.name] || false}
                        onChange={e => {
                            setEnabledColorwayThemes(dcd => {
                                dcd[theme.name] = e;
                                return dcd;
                            });
                        }} />}
                    descriptions={[`by ${theme.author}`, theme.description]}
                    text={theme.name}
                />)}
            {(!colorwayThemes.length) ? <ColorwayItem
                id="theme-nothemes"
                text="It's quite emty in here."
                descriptions={["Try searching for something else"]}
                prefix={() => <WirelessIcon width={30} height={30} style={{ color: "var(--interactive-active)" }} />}
            /> : null}
        </div>
    </>;
}
