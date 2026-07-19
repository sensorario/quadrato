import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import repository from "../src/repositories/LocalStorageRepository";

describe("LocalStorageRepository", () => {
    beforeEach(() => {
        window.localStorage.clear();
    });

    it("setAccessToken and onUnauthorized/onAuthenticated are no-ops", () => {
        expect(() => repository.setAccessToken("token")).not.toThrow();
        expect(() => repository.setAccessToken(null)).not.toThrow();
        expect(() => repository.onUnauthorized(() => {})).not.toThrow();
        expect(() => repository.onAuthenticated(() => {})).not.toThrow();
    });

    it("requireAuthentication is always false", () => {
        expect(repository.requireAuthentication()).toBe(false);
    });

    describe("getAllProjects", () => {
        it("returns an empty list when nothing is stored", () => {
            expect(repository.getAllProjects()).toEqual([]);
        });

        it("collects unique project names across all simplanner-tasks* keys", () => {
            localStorage.setItem("simplanner-tasks", JSON.stringify([
                { id: 1, project: "work" },
                { id: 2, project: "home" },
            ]));
            localStorage.setItem("simplanner-tasks-archived", JSON.stringify([
                { id: 3, project: "work" },
                { id: 4 },
            ]));
            localStorage.setItem("some-other-key", JSON.stringify([{ id: 5, project: "ignored" }]));

            expect(repository.getAllProjects().sort()).toEqual(["home", "work"]);
        });

        it("ignores keys whose value is not a JSON array", () => {
            localStorage.setItem("simplanner-tasks", JSON.stringify({ not: "an array" }));

            expect(repository.getAllProjects()).toEqual([]);
        });

        it("skips keys with invalid JSON instead of throwing", () => {
            localStorage.setItem("simplanner-tasks", "not-json");

            expect(() => repository.getAllProjects()).not.toThrow();
            expect(repository.getAllProjects()).toEqual([]);
        });
    });

    describe("getProjectColors / setProjectColor / removeProjectColor", () => {
        it("defaults to an empty object", () => {
            expect(repository.getProjectColors()).toEqual({});
        });

        it("stores and removes a project color", () => {
            repository.setProjectColor("work", "#ff0000");
            expect(repository.getProjectColors()).toEqual({ work: "#ff0000" });

            repository.removeProjectColor("work");
            expect(repository.getProjectColors()).toEqual({});
        });

        it("returns an empty object when stored JSON is invalid", () => {
            localStorage.setItem("simplanner-project-colors", "not-json");
            expect(repository.getProjectColors()).toEqual({});
        });
    });

    describe("getTasks / setTasks", () => {
        it("defaults to an empty array", () => {
            expect(repository.getTasks()).toEqual([]);
        });

        it("round-trips tasks through setTasks", () => {
            repository.setTasks([{ id: 1 }]);
            expect(repository.getTasks()).toEqual([{ id: 1 }]);
        });

        it("returns an empty array when stored JSON is invalid", () => {
            localStorage.setItem("simplanner-tasks", "not-json");
            expect(repository.getTasks()).toEqual([]);
        });
    });

    describe("getTasksFromKey", () => {
        it("defaults to an empty array for a missing key", () => {
            expect(repository.getTasksFromKey("custom-key")).toEqual([]);
        });

        it("returns the parsed array for an existing key", () => {
            localStorage.setItem("custom-key", JSON.stringify([{ id: 9 }]));
            expect(repository.getTasksFromKey("custom-key")).toEqual([{ id: 9 }]);
        });

        it("returns an empty array when stored JSON is invalid", () => {
            localStorage.setItem("custom-key", "not-json");
            expect(repository.getTasksFromKey("custom-key")).toEqual([]);
        });
    });

    describe("setProjectEditable / getProjectEditable", () => {
        it("defaults to false", () => {
            expect(repository.getProjectEditable()).toBe(false);
        });

        it("round-trips true", () => {
            repository.setProjectEditable(true);
            expect(repository.getProjectEditable()).toBe(true);
        });

        it("returns false when stored JSON is invalid", () => {
            localStorage.setItem("simplanner-project-editable", "not-json");
            expect(repository.getProjectEditable()).toBe(false);
        });
    });

    describe("setShowText / getShowText", () => {
        it("defaults to false", () => {
            expect(repository.getShowText()).toBe(false);
        });

        it("round-trips true", () => {
            repository.setShowText(true);
            expect(repository.getShowText()).toBe(true);
        });

        it("returns true when stored JSON is invalid", () => {
            localStorage.setItem("simplanner-show-text", "not-json");
            expect(repository.getShowText()).toBe(true);
        });
    });

    describe("setShowExpired / getShowExpired", () => {
        it("defaults to false", () => {
            expect(repository.getShowExpired()).toBe(false);
        });

        it("round-trips true", () => {
            repository.setShowExpired(true);
            expect(repository.getShowExpired()).toBe(true);
        });

        it("returns false when stored JSON is invalid", () => {
            localStorage.setItem("simplanner-show-expired", "not-json");
            expect(repository.getShowExpired()).toBe(false);
        });
    });

    describe("setIconTheme / getIconTheme", () => {
        it("defaults to 'default'", () => {
            expect(repository.getIconTheme()).toBe("default");
        });

        it("round-trips a theme name", () => {
            repository.setIconTheme("panda");
            expect(repository.getIconTheme()).toBe("panda");
        });
    });

    describe("setDateTimeEnabled / getDateTimeEnabled", () => {
        it("defaults to false", () => {
            expect(repository.getDateTimeEnabled()).toBe(false);
        });

        it("round-trips true", () => {
            repository.setDateTimeEnabled(true);
            expect(repository.getDateTimeEnabled()).toBe(true);
        });

        it("returns false when stored JSON is invalid", () => {
            localStorage.setItem("simplanner-dateTime-enabled", "not-json");
            expect(repository.getDateTimeEnabled()).toBe(false);
        });
    });

    describe("setZenMode / getZenMode", () => {
        it("defaults to false", () => {
            expect(repository.getZenMode()).toBe(false);
        });

        it("round-trips true", () => {
            repository.setZenMode(true);
            expect(repository.getZenMode()).toBe(true);
        });

        it("returns false when stored JSON is invalid", () => {
            localStorage.setItem("simplanner-zen-mode", "not-json");
            expect(repository.getZenMode()).toBe(false);
        });
    });

    describe("setProjectFilter / getProjectFilter", () => {
        it("defaults to null", () => {
            expect(repository.getProjectFilter()).toBeNull();
        });

        it("round-trips a project name", () => {
            repository.setProjectFilter("work");
            expect(repository.getProjectFilter()).toBe("work");
        });

        it("returns null when stored JSON is invalid", () => {
            localStorage.setItem("simplanner-project-filter", "not-json");
            expect(repository.getProjectFilter()).toBeNull();
        });
    });

    describe("setActiveTab / getActiveTab", () => {
        it("defaults to null for an id that was never set", () => {
            expect(repository.getActiveTab("settings")).toBeNull();
        });

        it("stores the active tab per id", () => {
            repository.setActiveTab("settings", 2);
            expect(repository.getActiveTab("settings")).toBe(2);
        });

        it("returns null when stored JSON is invalid", () => {
            localStorage.setItem("simplanner-config-tab-settings", "not-json");
            expect(repository.getActiveTab("settings")).toBeNull();
        });
    });
});
