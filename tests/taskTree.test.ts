import { flattenTree, descendantIds, hasOpenDescendants, projectDrop, reconcileAncestors } from '../src/utils/taskTree';

const task = (id: number, extra: object = {}) => ({ id, title: `T${id}`, status: 0, ...extra });

describe('flattenTree', () => {
    it('puts subtasks right after their parent, one level deeper, at any depth', () => {
        const rows = flattenTree([
            task(1, { position: 0 }),
            task(2, { position: 1 }),
            task(3, { parentId: 1 }),
            task(4, { parentId: 3 }),
        ]);

        expect(rows.map(r => [r.task.id, r.depth])).toEqual([[1, 0], [3, 1], [4, 2], [2, 0]]);
    });

    it('shows a subtask whose parent is not in the list as a top-level task', () => {
        const rows = flattenTree([task(3, { parentId: 99 })]);

        expect(rows).toEqual([{ task: expect.objectContaining({ id: 3 }), depth: 0 }]);
    });

    it('keeps tasks caught in a parent cycle visible', () => {
        const rows = flattenTree([task(1, { parentId: 2 }), task(2, { parentId: 1 })]);

        expect(rows.map(r => r.task.id).sort()).toEqual([1, 2]);
    });
});

describe('descendantIds / hasOpenDescendants', () => {
    const tasks = [task(1), task(2, { parentId: 1, status: 2 }), task(3, { parentId: 2 })];

    it('collects subtasks at every level', () => {
        expect(descendantIds(tasks, 1)).toEqual([2, 3]);
    });

    it('sees an open task deep in the chain', () => {
        expect(hasOpenDescendants(tasks, 1)).toBe(true);
        expect(hasOpenDescendants(tasks.map(t => ({ ...t, status: 2 })), 1)).toBe(false);
    });
});

describe('projectDrop', () => {
    const rows = flattenTree([task(1, { position: 0 }), task(2, { position: 1 }), task(3, { parentId: 2 })]);

    it('stays top-level without sideways movement', () => {
        expect(projectDrop(rows, 1, 0, 0)).toEqual({ depth: 0, parentId: null });
    });

    it('becomes a subtask of the row above when moved slightly to the right', () => {
        expect(projectDrop(rows, 1, 0, 30)).toEqual({ depth: 1, parentId: 1 });
    });

    it('goes at most one level deeper than the row above', () => {
        expect(projectDrop(rows, 3, 0, 200)).toEqual({ depth: 2, parentId: 3 });
    });

    it('comes back up a level when moved to the left', () => {
        expect(projectDrop(rows, 3, 2, -30)).toEqual({ depth: 1, parentId: 2 });
    });
});

describe('reconcileAncestors', () => {
    it('completes a parent when its last open subtask is closed, all the way up', () => {
        const tasks = [task(1), task(2, { parentId: 1 }), task(3, { parentId: 2, status: 2 })];

        const result = reconcileAncestors(tasks, [3]);

        expect(result.map(t => t.status)).toEqual([2, 2, 2]);
    });

    it('reopens a completed parent when a subtask is reopened', () => {
        const tasks = [task(1, { status: 2 }), task(2, { parentId: 1, status: 0 })];

        expect(reconcileAncestors(tasks, [2])[0].status).toBe(0);
    });

    it('postpones a dated parent to its latest subtask, through the chain', () => {
        const sept10 = new Date('2026-09-10T09:00:00Z').getTime();
        const sept11 = new Date('2026-09-11T09:00:00Z').getTime();
        const sept12 = new Date('2026-09-12T09:00:00Z').getTime();
        const tasks = [
            task(1, { timestamp: sept10 }),
            task(2, { parentId: 1, timestamp: sept11 }),
            task(3, { parentId: 2, timestamp: sept12 }),
        ];

        const result = reconcileAncestors(tasks, [3]);

        expect(result.map(t => t.timestamp)).toEqual([sept12, sept12, sept12]);
    });

    it('leaves a parent without a due date undated', () => {
        const tasks = [task(1), task(2, { parentId: 1, timestamp: 1000 })];

        expect(reconcileAncestors(tasks, [2])[0].timestamp).toBeUndefined();
    });

    it('does not touch a parent whose subtasks already fit', () => {
        const tasks = [task(1, { timestamp: 5000 }), task(2, { parentId: 1, timestamp: 1000 })];

        expect(reconcileAncestors(tasks, [2])[0]).toBe(tasks[0]);
    });
});
