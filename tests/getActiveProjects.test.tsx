import { describe, it, expect } from "@jest/globals";
import { getActiveProjects } from "../src/functions/getActiveProjects";

describe("getActiveProjects", () => {
    it("returns unique project names from non-archived tasks", () => {
        const tasks = [
            { project: "alpha", archived: false },
            { project: "beta", archived: false },
            { project: "alpha", archived: false },
        ];
        expect(getActiveProjects(tasks)).toEqual(["alpha", "beta"]);
    });

    it("excludes projects that only appear on archived tasks", () => {
        const tasks = [
            { project: "alpha", archived: true },
            { project: "beta", archived: false },
        ];
        expect(getActiveProjects(tasks)).toEqual(["beta"]);
    });

    it("still shows a project if at least one of its tasks is not archived", () => {
        const tasks = [
            { project: "alpha", archived: true },
            { project: "alpha", archived: false },
        ];
        expect(getActiveProjects(tasks)).toEqual(["alpha"]);
    });

    it("ignores tasks with no project or a blank/whitespace project", () => {
        const tasks = [
            { project: undefined, archived: false },
            { project: "", archived: false },
            { project: "   ", archived: false },
            { project: "alpha", archived: false },
        ];
        expect(getActiveProjects(tasks)).toEqual(["alpha"]);
    });
});
