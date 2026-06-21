export const DSA_DIFFICULTIES = ["Easy", "Medium", "Hard"];
export const DSA_STATUSES = ["todo", "solved", "revision"];

export const emptyApproach = {
    title: "",
    intuition: "",
    approach: "",
    solution: "",
};

export const emptyDsaForm = {
    title: "",
    platform: "",
    problemUrl: "",
    difficulty: "Easy",
    tags: "",
    status: "Todo",
    question: "",
    approaches: [{ ...emptyApproach }],
    notes: "",
};

export const formatDate = (dateValue) => {
    if (!dateValue) return "Not available";

    return new Intl.DateTimeFormat("en", {
        day: "numeric",
        month: "short",
        year: "numeric",
    }).format(new Date(dateValue));
};

export const normalizeProblemList = (problems) => {
    if (Array.isArray(problems)) return problems;
    if (Array.isArray(problems?.data)) return problems.data;
    if (Array.isArray(problems?.problems)) return problems.problems;
    if (Array.isArray(problems?.dsa)) return problems.dsa;
    return [];
};

export const normalizeProblem = (problem) => problem?.problem ?? problem?.data ?? problem ?? {};

export const coerceOption = (value, options, fallback) =>
    options.find((option) => option.toLowerCase() === String(value || "").toLowerCase()) ||
    fallback;

export const tagsToText = (tags) => (Array.isArray(tags) ? tags.join(", ") : "");

export const textToTags = (tags) =>
    tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);

export const normalizeApproaches = (approaches) => {
    if (!Array.isArray(approaches) || approaches.length === 0) return [{ ...emptyApproach }];

    return approaches.map((item) => ({
        title: item.title || item.approachTitle || "",
        intuition: item.intuition || "",
        approach: item.approach || "",
        solution: item.solution || "",
    }));
};

export const getProblemId = (problem) => problem?._id || problem?.id;
