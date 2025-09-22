type HandleAddAnotherModalParams = {
    addAnother: boolean;
    setShowPopup: (show: boolean) => void;
    setAddAnother: (addAnother: boolean) => void;
    setNewTaskTitle: (title: string) => void;
};

export function handleAddAnotherModal({ addAnother, setShowPopup, setAddAnother, setNewTaskTitle }: HandleAddAnotherModalParams) {
    setNewTaskTitle('');
    if (!addAnother) {
        setShowPopup(false);
        setAddAnother(false);
    } else {
        setShowPopup(true);
    }
}