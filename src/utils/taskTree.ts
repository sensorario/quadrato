import { Task } from "../types/commonTypes";
import { STATUS_ENUM } from "../utils";
import sortByDate from "./filterTaskByVisibilityRange";

type Id = Task['id'];

export type TreeRow = { task: Task; depth: number };

// How far the pointer must move sideways, while dragging, to go one level deeper or shallower.
export const INDENT_PX = 24;

const isClosed = (task: Task) => task.status === STATUS_ENUM.DONE || task.status === STATUS_ENUM.SKIPPED;

export const toTime = (timestamp: Task['timestamp']): number | null => {
    if (timestamp === undefined || timestamp === null || timestamp === '') return null;
    if (typeof timestamp === 'number') return timestamp;
    if (/^\d+$/.test(timestamp)) return Number(timestamp);
    const time = new Date(timestamp).getTime();
    return isNaN(time) ? null : time;
};

// Depth-first, siblings in the list's usual order. A subtask whose parent isn't in
// `tasks` (archived, another project, filtered out) is shown as a top-level task.
export const flattenTree = (tasks: Task[]): TreeRow[] => {
    const ids = new Set(tasks.map(t => t.id));
    const children = new Map<Id | null, Task[]>();
    for (const task of tasks) {
        const parent = task.parentId != null && ids.has(task.parentId) ? task.parentId : null;
        children.set(parent, [...(children.get(parent) ?? []), task]);
    }

    const rows: TreeRow[] = [];
    const visited = new Set<Id>();
    const visit = (parent: Id | null, depth: number) => {
        for (const task of sortByDate(children.get(parent) ?? [])) {
            if (visited.has(task.id)) continue;
            visited.add(task.id);
            rows.push({ task, depth });
            visit(task.id, depth + 1);
        }
    };
    visit(null, 0);
    // Tasks caught in a parent cycle are unreachable from the top: keep them visible anyway.
    for (const task of sortByDate(tasks.filter(t => !visited.has(t.id)))) {
        if (visited.has(task.id)) continue;
        visited.add(task.id);
        rows.push({ task, depth: 0 });
        visit(task.id, 1);
    }
    return rows;
};

export const childrenOf = (tasks: Task[], id: Id): Task[] =>
    tasks.filter(t => t.parentId === id && !t.archived);

export const descendantIds = (tasks: Task[], id: Id): Id[] => {
    const result: Id[] = [];
    const queue = [id];
    while (queue.length > 0) {
        const current = queue.shift() as Id;
        for (const child of childrenOf(tasks, current)) {
            if (child.id === id || result.includes(child.id)) continue;
            result.push(child.id);
            queue.push(child.id);
        }
    }
    return result;
};

export const ancestorIds = (tasks: Task[], id: Id): Id[] => {
    const byId = new Map(tasks.map(t => [t.id, t]));
    const result: Id[] = [];
    let parentId = byId.get(id)?.parentId;
    while (parentId != null && byId.has(parentId) && parentId !== id && !result.includes(parentId)) {
        result.push(parentId);
        parentId = byId.get(parentId)?.parentId;
    }
    return result;
};

export const hasOpenDescendants = (tasks: Task[], id: Id): boolean => {
    const ids = new Set(descendantIds(tasks, id));
    return tasks.some(t => ids.has(t.id) && !isClosed(t));
};

// Where the dragged task lands: between `rows[insertIndex - 1]` and `rows[insertIndex]`
// (rows without the dragged subtree), as deep as the sideways movement asks, but never
// deeper than one level under the row above, nor shallower than the row below.
export const projectDrop = (rows: TreeRow[], insertIndex: number, startDepth: number, deltaX: number) => {
    const prev = rows[insertIndex - 1];
    const next = rows[insertIndex];
    const maxDepth = prev ? prev.depth + 1 : 0;
    const minDepth = next ? Math.min(next.depth, maxDepth) : 0;
    const wanted = startDepth + Math.round(deltaX / INDENT_PX);
    const depth = Math.max(minDepth, Math.min(maxDepth, wanted));

    let parentId: Id | null = null;
    if (depth > 0) {
        for (let i = insertIndex - 1; i >= 0; i--) {
            if (rows[i].depth === depth - 1) {
                parentId = rows[i].task.id;
                break;
            }
        }
    }
    return { depth, parentId };
};

// Keeps every ancestor of `ids` consistent with its subtasks, from the deepest up:
// - a parent is completed when all its subtasks are closed, and reopened when one isn't;
// - a parent with a due date is postponed to its latest subtask's due date.
// Parents without a due date keep none.
export const reconcileAncestors = (tasks: Task[], ids: Id[]): Task[] => {
    const chain: Id[] = [];
    for (const id of ids) {
        for (const ancestor of [id, ...ancestorIds(tasks, id)]) {
            if (!chain.includes(ancestor)) chain.push(ancestor);
        }
    }

    const byId = new Map(tasks.map(t => [t.id, t]));
    const depthOf = (id: Id) => ancestorIds(tasks, id).length;
    chain.sort((a, b) => depthOf(b) - depthOf(a));

    for (const id of chain) {
        const task = byId.get(id);
        if (!task) continue;
        const current = [...byId.values()];
        const children = childrenOf(current, id);
        if (children.length === 0) continue;

        let next = task;
        const allClosed = children.every(isClosed);
        if (allClosed && !isClosed(next)) next = { ...next, status: STATUS_ENUM.DONE };
        if (!allClosed && isClosed(next)) next = { ...next, status: STATUS_ENUM.TODO };

        const own = toTime(next.timestamp);
        if (own !== null) {
            const latest = Math.max(...descendantIds(current, id).map(d => toTime(byId.get(d)?.timestamp) ?? -Infinity));
            if (latest > own) next = { ...next, timestamp: latest };
        }

        if (next !== task) byId.set(id, next);
    }

    return tasks.map(t => byId.get(t.id) ?? t);
};
