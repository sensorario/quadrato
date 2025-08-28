import { STATUS } from "../utils";

export const TaskList = ({ tasks, onTaskClick }) => (
    <ul className="task-list">
        {tasks.map(task => (
            <li
                key={task.id}
                className="task-item"
                onClick={() => onTaskClick(task.id)}
            >
                <strong>{STATUS[task.status]}</strong> - {task.title}
            </li>
        ))}
    </ul>
);

export default TaskList;