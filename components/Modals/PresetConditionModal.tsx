/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { useState } from "../..";
import { colorVals, functs } from "../../constants";
import { ColorValue, ModalProps, PresetCondition, PresetConditionFunction } from "../../types";
import CodeInput from "../CodeInput";
import Modal from "../Modal";
import Select from "../Select";

export default function ({ modalProps, onCondition = "", onConditionElse = "", colorValue = "accent-h", is = "equal", than: thanVal = 80, onConditionFinish = () => { } }: { modalProps: ModalProps, onCondition?: string, onConditionElse?: string, colorValue?: ColorValue, is?: PresetConditionFunction, than?: number, onConditionFinish(condition: PresetCondition): void; }) {
    const [conditionFunc, setConditionFunc] = useState<PresetConditionFunction>(is);
    const [colorVal, setColorVal] = useState<ColorValue>(colorValue);
    const [noCSSError, setNoCSSError] = useState(false);
    const [CSS, setCSS] = useState(onCondition);
    const [elseCSS, setElseCSS] = useState(onConditionElse);
    const [than, setThan] = useState(thanVal);

    return <Modal
        modalProps={modalProps}
        title="Editing Condition..."
        type="normal"
        onFinish={({ closeModal }) => {
            if (!CSS) return setNoCSSError(true);
            onConditionFinish({ if: colorVal, is: conditionFunc, than: String(than), onCondition: CSS, onConditionElse: elseCSS });
            closeModal();
        }}
    >
        <span style={{ marginTop: "8px" }} className="dc-field-header">If</span>
        <Select items={colorVals} selected={colorVals.find(({ value }) => value === colorVal) as { name: string, value: ColorValue; }} onChange={(val: ColorValue) => setColorVal(val)} />
        <span style={{ marginTop: "8px" }} className="dc-field-header">Is</span>
        <Select items={functs} selected={functs.find(({ value }) => value === conditionFunc) as { name: string, value: PresetConditionFunction; }} onChange={(val: PresetConditionFunction) => setConditionFunc(val)} />
        <span style={{ marginTop: "8px" }} className="dc-field-header">Than</span>
        <input
            type="number"
            className="dc-textbox"
            style={{ paddingRight: "6px" }}
            placeholder="Enter comparative number"
            value={than}
            autoFocus
            onInput={({ currentTarget: { value } }) => setThan(Number(value))}
        />
        <span style={{ marginTop: "8px" }} className={`dc-field-header${noCSSError ? " dc-field-header-error" : ""}`}>Then{noCSSError ? <span className="dc-field-header-errormsg">
            <span className="dc-field-header-errordiv">-</span>
            Main condition cannot be empty
        </span> : <></>}</span>
        <CodeInput value={CSS} lang="css" onChange={setCSS} />
        <span style={{ marginTop: "8px" }} className="dc-field-header">Else</span>
        <CodeInput value={elseCSS} lang="css" onChange={setElseCSS} />
    </Modal>;
}
