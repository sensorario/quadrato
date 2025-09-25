// Common types for Quadrato app

export type Periodicity = { number: string; unit: string };

export type Task = {
    id: number;
    title: string;
    longDescription?: string;
    project?: string;
    timestamp?: string | number;
    status: number;
    archived?: boolean;
    periodicity?: Periodicity;
};

export type HandleAddAnotherModalParams = {
    addAnother: boolean;
    setShowPopup: (show: boolean) => void;
    setAddAnother: (addAnother: boolean) => void;
    setNewTaskTitle: (title: string) => void;
};

export type ModalProps = {
    children: React.ReactNode;
    title: string;
    icon?: React.ReactNode;
    onClick: () => void;
};

export type FooterProps = {
    setShowPopup: (show: boolean) => void;
    setShowCleanConfirm: (show: boolean) => void;
    showText: boolean;
};

export type ConfirmModalProps = {
    setShowCleanConfirm: (val: boolean) => void;
    handleCleanTasks: () => void;
    onClick: () => void;
};

export type HandleEditClickProp = {
    id: number;
    title: string;
    longDescription?: string;
    project?: string;
    timestamp?: string | number;
    periodicity?: Periodicity;
};
