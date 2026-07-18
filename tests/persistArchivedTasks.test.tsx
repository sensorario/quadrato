import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { persistArchivedTasks } from "../src/functions/persistArchivedTasks";

describe("persistArchivedTasks", () => {
    beforeEach(() => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({}),
        });
    });

    it("PUTs only the task that just became archived, not the untouched ones", async () => {
        const originalTasks = [
            { id: 1, status: 2, archived: false },
            { id: 2, status: 0, archived: false },
        ];
        const updatedTasks = [
            { id: 1, status: 2, archived: true },
            { id: 2, status: 0, archived: false },
        ];

        await persistArchivedTasks({ originalTasks, updatedTasks, token: "tok" });

        expect(global.fetch).toHaveBeenCalledTimes(1);
        const [url, options] = global.fetch.mock.calls[0];
        expect(url).toBe("https://api.simonegentili.com/quadrato/task/1");
        expect(options.method).toBe("PUT");
        expect(JSON.parse(options.body)).toEqual({ archived: true });
    });

    it("does not send any request when nothing changed", async () => {
        const tasks = [{ id: 1, status: 0, archived: false }];

        await persistArchivedTasks({ originalTasks: tasks, updatedTasks: tasks, token: "tok" });

        expect(global.fetch).not.toHaveBeenCalled();
    });

    it("does not re-PUT a task that was already archived", async () => {
        const tasks = [{ id: 1, status: 2, archived: true }];

        await persistArchivedTasks({ originalTasks: tasks, updatedTasks: tasks, token: "tok" });

        expect(global.fetch).not.toHaveBeenCalled();
    });

    it("POSTs newly created periodic renewal tasks", async () => {
        const originalTasks = [{ id: 1, status: 2, archived: false }];
        const updatedTasks = [
            { id: 1, status: 2, archived: true },
            { id: 2, status: 0, archived: false, title: "renewal" },
        ];

        await persistArchivedTasks({ originalTasks, updatedTasks, token: "tok" });

        expect(global.fetch).toHaveBeenCalledTimes(2);
        const postCall = global.fetch.mock.calls.find(([, options]) => options.method === "POST");
        expect(postCall[0]).toBe("https://api.simonegentili.com/quadrato/task");
        expect(JSON.parse(postCall[1].body)).toEqual(updatedTasks[1]);
    });
});
