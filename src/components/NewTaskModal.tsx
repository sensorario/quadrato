
const NewTaskModal = ({ newTaskTitle, setNewTaskTitle, handleAddTask, setShowPopup }) => (
    <div className="modal-overlay" onClick={() => setShowPopup(false)}>
        <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Nuovo Task</h2>
            <div className="modal-input-wrapper">
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
        </div>
    </div>
);


export default NewTaskModal;