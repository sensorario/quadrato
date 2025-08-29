import { STATUS } from "../utils";

export const TaskList = ({ tasks, onTaskClick }) => {

    const handler = (task) => {
        let title = task.title;

        // if title contains a link
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const hasLink = urlRegex.test(title);
        if (hasLink) {
            title = title.replace(urlRegex, (url) => {
                return `<a href="${url}" class="task-link" target="_blank" rel="noopener noreferrer">${url}</a>`;
            });
        }

        return <li key={task.id} className="task-item" onClick={() => onTaskClick(task.id)}>
            <strong>{STATUS[task.status]}</strong> - <span dangerouslySetInnerHTML={{ __html: title }} />
        </li>
    };

    return (
        <ul className="task-list">
            {tasks.map(handler)}
        </ul>
    );
}

export default TaskList;