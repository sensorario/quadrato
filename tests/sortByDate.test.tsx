import { describe, it, expect } from "@jest/globals";
import sortByDate from "../src/utils/filterTaskByVisibilityRange";

const task = (id: number, extra: object = {}) => ({ id, title: `Task ${id}`, status: 0, ...extra });

describe("sortByDate", () => {
    it("keeps dated tasks first, in chronological order, ignoring their position", () => {
        const tasks = [
            task(1),
            task(2, { timestamp: 2000, position: 0 }),
            task(3, { timestamp: 1000, position: 5 }),
        ];
        expect(sortByDate(tasks).map(t => t.id)).toEqual([3, 2, 1]);
    });

    it("orders undated tasks by position", () => {
        const tasks = [task(1, { position: 2 }), task(2, { position: 0 }), task(3, { position: 1 })];
        expect(sortByDate(tasks).map(t => t.id)).toEqual([2, 3, 1]);
    });

    it("puts undated tasks without a position after the ordered ones, in their original order", () => {
        const tasks = [task(1), task(2, { position: 0 }), task(3), task(4, { position: null })];
        expect(sortByDate(tasks).map(t => t.id)).toEqual([2, 1, 3, 4]);
    });
});
