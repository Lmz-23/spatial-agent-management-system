// Task related types
export var TaskStatus;
(function (TaskStatus) {
    TaskStatus["BACKLOG"] = "backlog";
    TaskStatus["PLANNING"] = "planning";
    TaskStatus["IN_PROGRESS"] = "in_progress";
    TaskStatus["IN_REVIEW"] = "in_review";
    TaskStatus["TESTING"] = "testing";
    TaskStatus["NEEDS_REVISION"] = "needs_revision";
    TaskStatus["BLOCKED"] = "blocked";
    TaskStatus["DONE"] = "done";
    TaskStatus["CANCELLED"] = "cancelled";
})(TaskStatus || (TaskStatus = {}));
export var TaskPriority;
(function (TaskPriority) {
    TaskPriority["LOW"] = "low";
    TaskPriority["MEDIUM"] = "medium";
    TaskPriority["HIGH"] = "high";
    TaskPriority["URGENT"] = "urgent";
})(TaskPriority || (TaskPriority = {}));
//# sourceMappingURL=task.types.js.map