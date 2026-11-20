import { describe, it, expect, jest } from "@jest/globals";
import { archiveCompletedAndSkippedTasks } from "../src/functions/archiveCompletedAndSkippedTasks";
import { STATUS_ENUM } from "../src/utils";

describe("archiveCompletedAndSkippedTasks", () => {
    it("archives tasks with status SKIPPED", () => {
        const tasks = [
            { id: 1, title: "Task 1", status: STATUS_ENUM.SKIPPED },
            { id: 2, title: "Task 2", status: STATUS_ENUM.TODO },
        ];
        const result = archiveCompletedAndSkippedTasks({ tasks });
        expect(result[0].archived).toBe(true);
        expect(result[1].archived).toBeUndefined();
    });

    it("archives tasks with status DONE", () => {
        const tasks = [
            { id: 1, title: "Task 1", status: STATUS_ENUM.DONE },
            { id: 2, title: "Task 2", status: STATUS_ENUM.TODO },
        ];
        const result = archiveCompletedAndSkippedTasks({ tasks });
        expect(result[0].archived).toBe(true);
        expect(result[1].archived).toBeUndefined();
    });

    it("creates new periodic task when DONE", () => {
        const now = Date.now();
        const tasks = [
            {
                id: 1,
                title: "Periodic Task",
                status: STATUS_ENUM.DONE,
                timestamp: now,
                periodicity: { number: "1", unit: "giorni" },
            },
        ];
        const result = archiveCompletedAndSkippedTasks({ tasks });
        // Should have two tasks: one archived, one new TODO
        expect(result.length).toBe(2);
        expect(result[0].archived).toBe(true);
        expect(result[1].status).toBe(STATUS_ENUM.TODO);
        expect(result[1].archived).toBe(false);
        expect(result[1].timestamp).not.toBe(now);
    });

    it("moves a renewed task's deadline one period and never has it to be done after it, like the API", () => {
        jest.useFakeTimers().setSystemTime(new Date(2026, 8, 26, 10, 0));
        try {
            const bill = (deadline: string) => [{
                id: 1,
                title: "Bolletta",
                status: STATUS_ENUM.DONE,
                timestamp: new Date(2026, 8, 3, 9, 0).getTime(),
                periodicity: { number: "1", unit: "mesi" },
                deadline,
                rolledOver: 2,
            }];

            // Paid on the 26th: due again on 26 October, but the bill is due on 4 October.
            const [archived, late] = archiveCompletedAndSkippedTasks({ tasks: bill("2026-09-04") });
            expect(late.deadline).toBe("2026-10-04");
            expect(late.timestamp).toBe(new Date(2026, 9, 4, 10, 0).getTime());
            expect(late.rolledOver).toBe(0);
            expect(archived.deadline).toBe("2026-09-04");
            expect(archived.rolledOver).toBe(2);

            const [, early] = archiveCompletedAndSkippedTasks({ tasks: bill("2026-09-30") });
            expect(early.deadline).toBe("2026-10-30");
            expect(early.timestamp).toBe(new Date(2026, 9, 26, 10, 0).getTime());
        } finally {
            jest.useRealTimers();
        }
    });

    it("does not archive TODO tasks", () => {
        const tasks = [
            { id: 1, title: "Task 1", status: STATUS_ENUM.TODO },
        ];
        const result = archiveCompletedAndSkippedTasks({ tasks });
        expect(result[0].archived).toBeUndefined();
    });

    it("archiving a repeatable but DONE task", () => {
        const now = Date.now();
        const tasks = [
            {
                id: 1,
                title: "Repeatable Task",
                status: STATUS_ENUM.DONE,
                timestamp: now,
                periodicity: { number: "30", unit: "minuti" },
            },
        ];
        const result = archiveCompletedAndSkippedTasks({ tasks });
        expect(result.length).toBe(2);


        // estrarre il timestamp di entrambi i task
        const archivedTask = result.find(t => t.archived);
        const newTask = result.find(t => !t.archived);

        // assicurarsi che il nuovo task abbia il timestamp corretto
        expect(archivedTask).toBeDefined();
        expect(newTask).toBeDefined();
        expect(archivedTask?.archived).toBe(true);
        expect(newTask?.status).toBe(STATUS_ENUM.TODO);
        expect(newTask?.archived).toBe(false);
        expect(newTask?.timestamp).toBeGreaterThan(now);

        // assicurarsi che il nuovo task abbia il timestamp corretto
        const expectedTimestamp = new Date(now);
        expectedTimestamp.setMinutes(expectedTimestamp.getMinutes() + 30);
        expect(newTask?.timestamp).toBeCloseTo(expectedTimestamp.getTime(), -2); // entro 100ms
    });

    it("archiving a repeatable but DONE task, going backwards", () => {
        // va indietro di 10 giorni e poi avanti di 30 minuti
        const now = Date.now() - 10 * 24 * 60 * 60 * 1000;
        const tasks = [
            {
                id: 1,
                title: "Repeatable Task",
                status: STATUS_ENUM.DONE,
                timestamp: now,
                periodicity: { number: "30", unit: "minuti" },
            },
        ];
        const result = archiveCompletedAndSkippedTasks({ tasks });
        expect(result.length).toBe(2);


        // estrarre il timestamp di entrambi i task
        const archivedTask = result.find(t => t.archived);
        const newTask = result.find(t => !t.archived);

        // assicurarsi che il nuovo task abbia il timestamp corretto
        expect(archivedTask).toBeDefined();
        expect(newTask).toBeDefined();
        expect(archivedTask?.archived).toBe(true);
        expect(newTask?.status).toBe(STATUS_ENUM.TODO);
        expect(newTask?.archived).toBe(false);
        expect(newTask?.timestamp).toBeGreaterThan(now);

        // assicurarsi che il nuovo task abbia il timestamp corretto
        const expectedTimestamp = new Date();
        expectedTimestamp.setMinutes(expectedTimestamp.getMinutes() + 30);
        expect(newTask?.timestamp).toBeCloseTo(expectedTimestamp.getTime(), -2); // entro 100ms
    });
});

