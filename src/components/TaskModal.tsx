import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal } from "./Modal";
import TabbedContent from "./TabbedContent";
import { Footer } from "./Footer/index";
import Toggle from "./Toggle";
import { getConfigRepository } from "../repositories";
import { handleAddAnotherModal } from "../utils/handleAddAnotherModal";
import { Periodicity } from "../types/commonTypes";

const UNIT_KEYS: Record<string, string> = { minuti: "minutes", giorni: "days", settimane: "weeks", mesi: "months", anni: "years" };
const DEFAULT_PERIODICITY: Periodicity = { number: "", unit: "giorni" };
const QUICK_DAY_OFFSETS = [1, 2, 3, 5, 8, 13, 21];

const formatDateTimeLocal = (value: string | number | "") => {
    if (!value) return "";
    const date = new Date(value);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const parseLocalDateTimeToUTC = (dateTimeString: string): number | "" => {
    if (!dateTimeString) return "";
    return new Date(dateTimeString).getTime();
};

const atUtcMidday = (date: Date) => {
    date.setUTCHours(8, 0, 0, 0);
    return date.getTime();
};

export type TaskModalMode = "create" | "edit";

export type TaskModalInitialValues = {
    title?: string;
    longDescription?: string;
    project?: string;
    timestamp?: string | number;
    periodicity?: Periodicity;
};

export type TaskModalSaveValues = {
    title: string;
    longDescription: string;
    project: string;
    timestamp: string | number | "";
    periodicity: Periodicity | null;
};

type TaskModalProps = {
    mode: TaskModalMode;
    initialValues?: TaskModalInitialValues;
    onSave: (values: TaskModalSaveValues) => void;
    onClose: () => void;
    projectEditable: boolean;
    dateTimeEnabled: boolean;
};

const TaskModal = ({ mode, initialValues, onSave, onClose, projectEditable, dateTimeEnabled }: TaskModalProps) => {
    const { t } = useTranslation();
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const seededProject = initialValues?.project ?? "";

    const [title, setTitle] = useState(initialValues?.title ?? "");
    const [longDescription, setLongDescription] = useState(initialValues?.longDescription ?? "");
    const [project, setProject] = useState(seededProject);
    const [timestamp, setTimestamp] = useState<string | number | "">(initialValues?.timestamp ?? "");
    const [periodicity, setPeriodicity] = useState<Periodicity>(initialValues?.periodicity ?? DEFAULT_PERIODICITY);
    const [addAnother, setAddAnother] = useState(false);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
        }
    }, [longDescription]);

    const handleSave = () => {
        if (title.trim() === "") return;

        onSave({
            title,
            longDescription,
            project,
            timestamp,
            periodicity: periodicity.number ? periodicity : null,
        });

        if (mode === "create") {
            handleAddAnotherModal({
                addAnother,
                setShowPopup: (show) => { if (!show) onClose(); },
                setAddAnother,
                setNewTaskTitle: setTitle,
            });
            setLongDescription("");
            setProject(seededProject);
            setTimestamp("");
            setPeriodicity(DEFAULT_PERIODICITY);
        } else {
            onClose();
        }
    };

    const setQuickDate = (getDate: () => Date) => {
        setTimestamp(atUtcMidday(getDate()));
    };

    return (
        <Modal
            title={t(mode === "create" ? "taskModal.createTitle" : "taskModal.editTitle")}
            onClick={onClose}
            footer={
                <Footer>
                    <button className="modal-close-btn" onClick={onClose}>{t("common.cancel")}</button>
                    <button className="modal-close-btn" onClick={handleSave}>{t("common.save")}</button>
                </Footer>
            }
        >
            <TabbedContent id="taskModal" panels={[
                {
                    title: t("taskModal.whatTab"), content: <>
                        <label className="modal-input-label">{t("taskModal.titleLabel")}</label>
                        <div className="modal-input-wrapper">
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder={t("taskModal.titlePlaceholder")}
                                className="modal-input"
                                autoFocus
                                onFocus={(e) => e.currentTarget.classList.add("input-focus")}
                                onBlur={(e) => e.currentTarget.classList.remove("input-focus")}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") handleSave();
                                }}
                            />
                        </div>
                        <label className="modal-input-label">{t("taskModal.longDescriptionLabel")}</label>
                        <div className="modal-long-description">
                            <textarea
                                ref={textareaRef}
                                value={longDescription}
                                onChange={(e) => setLongDescription(e.target.value)}
                                placeholder={t("taskModal.longDescriptionPlaceholder")}
                                className="modal-input"
                            />
                        </div>
                    </>
                },
                {
                    title: t("taskModal.whenTab"), content: dateTimeEnabled && (
                        <>
                            <label className="modal-input-label">{t("taskModal.periodicityLabel")}</label>
                            <div className="periodo">
                                {t("taskModal.repeatEvery")}
                                <input
                                    type="number"
                                    min="1"
                                    value={periodicity.number}
                                    onChange={(e) => setPeriodicity({ ...periodicity, number: e.target.value })}
                                    className="modal-input periodo-number"
                                />
                                <select
                                    value={periodicity.unit}
                                    onChange={(e) => setPeriodicity({ ...periodicity, unit: e.target.value })}
                                    className="modal-input periodo-unit"
                                >
                                    {Object.entries(UNIT_KEYS).map(([value, key]) => (
                                        <option key={value} value={value}>{t(`taskModal.units.${key}`)}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="modal-hint">{t("taskModal.noDeadlineHint")}</div>
                            <hr />
                            <label className="modal-input-label">{t("taskModal.deadlineLabel")}</label>
                            <div className="modal-input-wrapper">
                                <input
                                    type="datetime-local"
                                    value={formatDateTimeLocal(timestamp)}
                                    onChange={(e) => setTimestamp(parseLocalDateTimeToUTC(e.target.value))}
                                    className="modal-input"
                                />
                            </div>
                            <div className="date-shortcut-row">
                                {QUICK_DAY_OFFSETS.map((days) => (
                                    <button
                                        key={days}
                                        type="button"
                                        className="date-shortcut-btn"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setQuickDate(() => {
                                                const d = new Date();
                                                d.setUTCDate(d.getUTCDate() + days);
                                                return d;
                                            });
                                        }}
                                    >{t("taskModal.inDays", { count: days })}</button>
                                ))}
                            </div>
                            <div className="date-shortcut-row">
                                <button
                                    type="button"
                                    className="date-shortcut-btn"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setQuickDate(() => {
                                            const d = new Date();
                                            d.setUTCDate(d.getUTCDate() + 1);
                                            return d;
                                        });
                                    }}
                                >{t("taskModal.tomorrow")}</button>
                                <button
                                    type="button"
                                    className="date-shortcut-btn"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setQuickDate(() => {
                                            const d = new Date();
                                            const day = d.getUTCDay();
                                            const daysToMonday = ((8 - day) % 7) || 7;
                                            d.setUTCDate(d.getUTCDate() + daysToMonday);
                                            return d;
                                        });
                                    }}
                                >{t("taskModal.nextWeek")}</button>
                                <button
                                    type="button"
                                    className="date-shortcut-btn"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setQuickDate(() => {
                                            const d = new Date();
                                            d.setUTCMonth(d.getUTCMonth() + 1);
                                            d.setUTCDate(1);
                                            while (d.getUTCDay() !== 1) {
                                                d.setUTCDate(d.getUTCDate() + 1);
                                            }
                                            return d;
                                        });
                                    }}
                                >{t("taskModal.nextMonth")}</button>
                            </div>
                        </>
                    )
                },
                {
                    title: t("taskModal.projectTab"), content: projectEditable && (
                        <>
                            <label className="modal-input-label">{t("taskModal.projectLabel")}</label>
                            <div className="modal-input-wrapper">
                                <input
                                    type="text"
                                    value={project}
                                    onChange={(e) => setProject(e.target.value)}
                                    className="modal-input"
                                    placeholder={t("taskModal.projectPlaceholder")}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") handleSave();
                                    }}
                                />
                            </div>
                            <div className="project-suggestion-list">
                                {(() => {
                                    const uniqueProjects = getConfigRepository().getAllFullProjects();
                                    return uniqueProjects.length > 0
                                        ? uniqueProjects.map((p) => (
                                            <div className="project-suggestion-item" key={p.project} onClick={() => setProject(p.project)}>
                                                {p.project}
                                            </div>
                                        ))
                                        : <div className="modal-hint">{t("taskModal.noProjectsFound")}</div>;
                                })()}
                            </div>
                        </>
                    )
                },
            ]} />
            {mode === "create" && (
                <Toggle
                    checked={addAnother}
                    onChange={setAddAnother}
                    label={t("taskModal.addAnotherTask")}
                />
            )}
        </Modal>
    );
};

export default TaskModal;
