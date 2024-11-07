/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { FluxDispatcher, FluxEvents, openModal, useEffect, useState } from "..";
import { ColorwayCSS } from "../colorwaysAPI";
import { contexts, setContext } from "../contexts";
import { generateCss } from "../css";
import { colorToHex, hexToString } from "../utils";
import { PlusIcon } from "./Icons";
import CreatorModal from "./Modals/SaveColorwayAsModal";

export default function ({ props }) {
    const [theme, setTheme] = useState(contexts.colorwaysPluginTheme);

    useEffect(() => {
        FluxDispatcher.subscribe("COLORWAYS_UPDATE_THEME" as FluxEvents, ({ theme }) => setTheme(theme));

        return () => {
            FluxDispatcher.unsubscribe("COLORWAYS_UPDATE_THEME" as FluxEvents, ({ theme }) => setTheme(theme));
        };
    }, []);

    if (String(props.message.content).match(/colorway:[0-9a-f]{0,100}/)) {
        return <div className="colorwayIDCard" data-theme={theme}>
            {String(props.message.content).match(/colorway:[0-9a-f]{0,100}/g)?.map((colorID: string) => {
                colorID = hexToString(colorID.split("colorway:")[1]);
                return <div
                    className="discordColorway"
                    id="colorway-IDCard"
                    role="button"
                    onClick={() => {
                        if (!colorID.includes(",")) {
                            throw new Error("Invalid Colorway ID");
                        } else {
                            colorID.split("|").forEach((prop: string) => {
                                if (prop.includes(",#")) {
                                    setContext("activeColorwayObject", {
                                        id: colorID.includes("n:") ? colorID.split("n:")[1].split("|")[0] : "Temporary Colorway", sourceType: "temporary", source: null, colors: {
                                            accent: colorToHex(colorID.split("|").filter(string => string.includes(",#"))[0].split(/,#/)[0]),
                                            primary: colorToHex(colorID.split("|").filter(string => string.includes(",#"))[0].split(/,#/)[1]),
                                            secondary: colorToHex(colorID.split("|").filter(string => string.includes(",#"))[0].split(/,#/)[2]),
                                            tertiary: colorToHex(colorID.split("|").filter(string => string.includes(",#"))[0].split(/,#/)[3])
                                        }
                                    });
                                    ColorwayCSS.set(generateCss({
                                        accent: colorToHex(colorID.split("|").filter(string => string.includes(",#"))[0].split(/,#/)[0]),
                                        primary: colorToHex(colorID.split("|").filter(string => string.includes(",#"))[0].split(/,#/)[1]),
                                        secondary: colorToHex(colorID.split("|").filter(string => string.includes(",#"))[0].split(/,#/)[2]),
                                        tertiary: colorToHex(colorID.split("|").filter(string => string.includes(",#"))[0].split(/,#/)[3])
                                    },
                                        true,
                                        true,
                                        32,
                                        colorID.includes("n:") ? colorID.split("n:")[1].split("|")[0] : "Temporary Colorway"
                                    ));
                                }
                            });
                        }
                    }}
                >
                    <div className="discordColorwayPreviewColorContainer">
                        {colorID.split("|").filter(string => string.includes(",#"))[0].split(/,#/).map((color: string) => <div className="discordColorwayPreviewColor" style={{ backgroundColor: `#${colorToHex(color)}` }} />)}
                    </div>
                    <div style={{
                        display: "flex",
                        flexDirection: "column",
                        width: "100%"
                    }}>
                        <span className="colorwayLabel">{colorID.includes("n:") ? colorID.split("n:")[1].split("|")[0] : "Colorway"}</span>
                        <span className="colorwayLabel" style={{ opacity: .5 }}>from Colorway ID</span>
                    </div>
                    <button
                        className="colorwaysPillButton colorwaysPillButton-primary"
                        onClick={async e => {
                            e.stopPropagation();
                            openModal(props => <CreatorModal modalProps={props} colorwayID={colorID} />);
                        }}
                    >
                        <PlusIcon width={20} height={20} />
                    </button>
                </div>;
            })}
        </div>;
    } else {
        return null;
    }
}
