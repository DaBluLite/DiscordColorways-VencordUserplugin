/*
 * Vencord, a Discord client mod
 * Copyright (c) 2023 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

export default function ({ className = "", style }: { className?: string, style?: React.CSSProperties; }) {
    return <div className={`dc-spinner ${className}`} role="img" aria-label="Loading" style={style}>
        <div className="dc-spinner-inner">
            <svg className="dc-spinner-svg" viewBox="25 25 50 50" fill="currentColor">
                <circle className="dc-spinner-beam dc-spinner-beam3" cx="50" cy="50" r="20" />
                <circle className="dc-spinner-beam dc-spinner-beam2" cx="50" cy="50" r="20" />
                <circle className="dc-spinner-beam" cx="50" cy="50" r="20" />
            </svg>
        </div>
    </div>;
}
