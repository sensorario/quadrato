import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal } from "./Modal";
import { toPlainText } from "../utils/toPlainText";

// Its own component, not one defined inside App's render: there it would be
// recreated on every keystroke and the input would lose focus.
const RenameProjectModal = ({ project, onSave, onClose }: {
    project: string;
    onSave: (name: string) => void;
    onClose: () => void;
}) => {
    const { t } = useTranslation();
    const [name, setName] = useState(project);
    const cleaned = toPlainText(name).trim();
    const canSave = cleaned !== "" && cleaned !== project;

    const save = () => {
        if (!canSave) return;
        onSave(cleaned);
        onClose();
    };

    return (
        <Modal
            title={t("app.renameProjectTitle", { name: project })}
            onClick={onClose}
            buttons={[
                { label: t("common.cancel"), onClick: onClose },
                // Modal buttons always close it: an unchanged or empty name just closes.
                { label: t("common.save"), onClick: () => { if (canSave) onSave(cleaned); onClose(); } },
            ]}
        >
            <input
                className="modal-input"
                autoFocus
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") save(); }}
                aria-label={t("app.renameProjectLabel")}
            />
        </Modal>
    );
};

export default RenameProjectModal;
