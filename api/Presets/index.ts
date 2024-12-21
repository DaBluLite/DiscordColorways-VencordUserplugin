/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { PresetConditionFunction } from "../../types";

export const conditionFunctions: Record<PresetConditionFunction, (val1: number, val2: number) => boolean> = {
    equal(val1: number, val2: number) {
        return val1 === val2;
    },
    greaterThan(val1: number, val2: number) {
        return val1 > val2;
    },
    lowerThan(val1: number, val2: number) {
        return val1 < val2;
    }
};
