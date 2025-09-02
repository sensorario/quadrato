const NewTaskModal = ({ newTaskTitle, setNewTaskTitle, newTaskProject, setNewTaskProject, handleAddTask, setShowPopup, projectEditable }) => {
    const ProjectEditable = () => {
        return <div className="modal-input-wrapper">
            <input
                type="text"
                value={newTaskProject}
                onChange={e => setNewTaskProject(e.target.value)}
                placeholder="Progetto (opzionale)"
                className="modal-input"
                onKeyDown={e => {
                    if (e.key === 'Enter') {
                        handleAddTask();
                    }
                }}
            />
        </div>
    };

    const Description = () => {
        return <div className="modal-input-wrapper">
            <input
                type="text"
                value={newTaskTitle}
                onChange={e => setNewTaskTitle(e.target.value)}
                placeholder="Titolo del task"
                className="modal-input"
                autoFocus
                onFocus={e => e.currentTarget.classList.add('input-focus')}
                onBlur={e => e.currentTarget.classList.remove('input-focus')}
                onKeyDown={e => {
                    if (e.key === 'Enter') {
                        handleAddTask();
                    } else if (e.key === 'Escape') {
                        setShowPopup(false);
                    }
                }}
            />
        </div>
    }

    return <div className="modal-overlay" onClick={() => setShowPopup(false)}>
        <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Nuovo Task</h2>
            <Description />
            {projectEditable && <ProjectEditable />}
        </div>
    </div>;
}


export default NewTaskModal;