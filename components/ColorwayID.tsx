/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Hooks } from "../api";
import { openModal } from "../api/Modals";
import { colorToHex, hexToString } from "../api/Utils/Colors";
import { nullColorwayObj } from "../constants";
import { ButtonColors } from "../types";
import Colorway from "./Colorway";
import { PlusIcon } from "./Icons";
import CreatorModal from "./Modals/SaveColorwayAsModal";

export default function ({ props }) {
    const theme = Hooks.useTheme();
    const [active, setActive] = Hooks.useContextualState("activeColorwayObject");

    if (String(props.message.content).match(/colorway:[0-9a-f]{0,100}/)) {
        return <div className="dc-cid-wrapper" data-theme={theme}>
            {String(props.message.content).match(/colorway:[0-9a-f]{0,100}/g)?.map((colorID: string) => {
                colorID = hexToString(colorID.split("colorway:")[1]);
                return <Colorway
                    id="colorway-IDCard"
                    role="button"
                    aria-checked={active.sourceType === "temporary" && colorID.includes("n:") && colorID.split("n:")[1].split("|")[0] === active.id}
                    onClick={() => {
                        if (!colorID.includes(",")) {
                            throw new Error("Invalid Colorway ID");
                        } else {
                            if (active.sourceType === "temporary" && colorID.includes("n:") && colorID.split("n:")[1].split("|")[0] === active.id) {
                                setActive(nullColorwayObj);
                            } else {
                                colorID.split("|").forEach((prop: string) => {
                                    if (prop.includes(",#")) {
                                        setActive({
                                            id: colorID.includes("n:") ? colorID.split("n:")[1].split("|")[0] : "Temporary Colorway", sourceType: "temporary", source: null, colors: {
                                                accent: colorToHex(colorID.split("|").filter(string => string.includes(",#"))[0].split(/,#/)[0]),
                                                primary: colorToHex(colorID.split("|").filter(string => string.includes(",#"))[0].split(/,#/)[1]),
                                                secondary: colorToHex(colorID.split("|").filter(string => string.includes(",#"))[0].split(/,#/)[2]),
                                                tertiary: colorToHex(colorID.split("|").filter(string => string.includes(",#"))[0].split(/,#/)[3])
                                            }
                                        });
                                    }
                                });
                            }
                        }
                    }}
                    actions={[
                        {
                            Icon: PlusIcon,
                            type: ButtonColors.PRIMARY,
                            onClick: async e => {
                                e.stopPropagation();
                                openModal(props => <CreatorModal modalProps={props} colorwayID={colorID} />);
                            }
                        }
                    ]}
                    colors={colorID.split("|").filter(string => string.includes(",#"))[0].split(/,#/)}
                    text={colorID.includes("n:") ? colorID.split("n:")[1].split("|")[0] : "Colorway"}
                    descriptions={["from Colorway ID"]}
                />;
            })}
        </div>;
    } else {
        return null;
    }
}
