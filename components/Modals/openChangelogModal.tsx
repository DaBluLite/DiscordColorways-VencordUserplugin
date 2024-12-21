/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { useContextualState } from "../../api/Hooks";
import { openModal } from "../../api/Modals";
import changelog from "../../changelog";
import { ModalProps } from "../../types";
import { DiscordIcon } from "../Icons";
import Modal from "../Modal";


function YoutubeEmbed({ src }) {
    return <iframe
        src={src}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
    />;
}

function Video({ src, poster }) {
    if (src.toLowerCase().includes("youtube.com")) return <YoutubeEmbed src={src} />;
    return <video src={src} poster={poster} controls={true} className="bd-changelog-poster" />;
}

function ChangelogModal({
    modalProps,
    title,
    video,
    poster,
    image,
    description,
    changes
}: {
    modalProps: ModalProps,
    title: string,
    video?: string,
    poster?: string,
    image: string,
    description: string,
    changes: {
        title: string,
        type: "fixed" | "progress" | "added" | "improved",
        items: string[];
    }[];
}) {
    const [discordColorwaysData] = useContextualState("discordColorwaysData");
    const Footer = () => <div style={{ display: "flex", marginRight: "auto" }}>
        <a aria-label="Discord" className="dc-footer-social-link" href="https://discord.gg/67VRpSjzxU" rel="noreferrer noopener" target="_blank">
            <DiscordIcon width={16} height={16} />
        </a>
        <div className="dc-footer-note">Join our Discord Server for more updates!</div>
    </div>;

    return <Modal divider={false} style={{ width: "532px" }} title={<div style={{ display: "flex", flexDirection: "column" }}>{title}<span className="dc-modal-header-subtitle">Version {discordColorwaysData.version}</span></div>} type="normal" modalProps={modalProps} onFinish={({ closeModal }) => closeModal()} footer={<Footer />}>
        {video ? <Video src={video} poster={poster} /> : <img src={image} className="bd-changelog-poster" />}
        {description.split("\n").map(d => <p className="dc-changelog-desc">{d}</p>)}
        {changes.map(change => <>
            <h2 className={`dc-changelog-title dc-changelog-title-${change.type}`}><span>{change.title} </span></h2>
            <ul className="dc-changes-list">
                {change.items.map(item => <li className="dc-change">{item}</li>)}
            </ul>
        </>)}
    </Modal>;
}

export default () => openModal(props => <ChangelogModal modalProps={props} title="What's new" image="https://repository-images.githubusercontent.com/788805704/225292b3-b134-4a0f-902d-7ef90143e64f" {...changelog} />);
