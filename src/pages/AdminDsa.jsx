import { useEffect, useMemo, useState } from "react";
import ReactECharts from "echarts-for-react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { ADMIN_AUTH_KEY } from "../services/apiClient";
import {
    deleteProblem,
    getProblems,
    getStats,
    markRevised,
    searchProblems,
    updateStatus,
} from "../services/dsaService";
import {
    DSA_DIFFICULTIES,
    DSA_STATUSES,
    coerceOption,
    formatDate,
    getProblemId,
    normalizeProblemList,
} from "../utils/dsa";

const statLabels = [
    { key: "total", label: "Total", color: "#805ad5" },
    { key: "solved", label: "Solved", color: "#286f6c" },
    { key: "todo", label: "Todo", color: "#805ad5" },
    { key: "revision", label: "Revision", color: "#292b46" },
    { key: "easy", label: "Easy", color: "#47a37f" },
    { key: "medium", label: "Medium", color: "#a879e6" },
    { key: "hard", label: "Hard", color: "#292b46" },
];

const completionStats = statLabels.filter((item) =>
    ["solved", "todo", "revision"].includes(item.key),
);
const difficultyStats = statLabels.filter((item) =>
    ["easy", "medium", "hard"].includes(item.key),
);

const getStatValue = (stats, item) =>
    Number(stats?.[item.key] ?? stats?.[item.label] ?? stats?.[item.label.toLowerCase()] ?? 0);

const toPercent = (value, total) => {
    if (!total) return 0;
    return Number(((value / total) * 100).toFixed(1));
};

const AdminDsa = () => {
    const navigate = useNavigate();
    const [problems, setProblems] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState("");
    const [filters, setFilters] = useState({
        difficulty: "",
        status: "",
        tag: "",
    });

    const loadProblems = async () => {
        const result = await getProblems();
        setProblems(normalizeProblemList(result));
    };

    const loadStats = async () => {
        const result = await getStats();
        setStats(result || {});
    };

    const loadDashboard = async () => {
        setLoading(true);
        try {
            await Promise.all([loadProblems(), loadStats()]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDashboard();
    }, []);

    useEffect(() => {
        const search = async () => {
            const query = searchText.trim();

            if (!query) {
                loadProblems();
                return;
            }

            const result = await searchProblems(query);
            setProblems(normalizeProblemList(result));
        };

        const timeout = setTimeout(search, 350);
        return () => clearTimeout(timeout);
    }, [searchText]);

    const logout = () => {
        localStorage.removeItem(ADMIN_AUTH_KEY);
        navigate("/admin/login", { replace: true });
    };

    const tagOptions = useMemo(() => {
        const tagSet = new Set();

        problems.forEach((problem) => {
            if (Array.isArray(problem.tags)) {
                problem.tags.forEach((tag) => tagSet.add(tag));
            }
        });

        return Array.from(tagSet).sort((a, b) => a.localeCompare(b));
    }, [problems]);

    const chartStats = useMemo(() => {
        const total = getStatValue(stats, statLabels[0]) || problems.length;

        return {
            total,
            completion: completionStats.map((item) => {
                const value = getStatValue(stats, item);

                return {
                    ...item,
                    value,
                    percent: toPercent(value, total),
                };
            }),
            difficulty: difficultyStats.map((item) => {
                const value = getStatValue(stats, item);

                return {
                    ...item,
                    value,
                    percent: toPercent(value, total),
                };
            }),
        };
    }, [problems.length, stats]);

    const createGaugeOption = (title, items) => ({
            backgroundColor: "transparent",
            color: items.map((item) => item.color),
            tooltip: {
                trigger: "item",
                formatter: ({ seriesName, value }) => `${seriesName}: ${value}%`,
            },
            graphic: [
                {
                    type: "text",
                    left: "center",
                    top: "42%",
                    style: {
                        text: title,
                        fill: "#16161698",
                        font: "700 15px Roboto",
                        textAlign: "center",
                    },
                },
                {
                    type: "text",
                    left: "center",
                    top: "50%",
                    style: {
                        text: String(chartStats.total),
                        fill: "#161616",
                        font: "900 34px Roboto",
                        textAlign: "center",
                    },
                },
            ],
            series: items.map((item, index) => {
                const radius = 82 - index * 13;

                return {
                    name: item.label,
                    type: "gauge",
                    center: ["50%", "50%"],
                    radius: `${radius}%`,
                    startAngle: 90,
                    endAngle: -270,
                    min: 0,
                    max: 100,
                    pointer: { show: false },
                    progress: {
                        show: true,
                        roundCap: true,
                        width: 9,
                        itemStyle: {
                            color: item.color,
                        },
                    },
                    axisLine: {
                        roundCap: true,
                        lineStyle: {
                            width: 9,
                            color: [[1, "#ede8f8"]],
                        },
                    },
                    axisTick: { show: false },
                    splitLine: { show: false },
                    axisLabel: { show: false },
                    anchor: { show: false },
                    title: { show: false },
                    detail: { show: false },
                    data: [{ value: item.percent }],
                };
            }),
        });

    const completionGaugeOption = useMemo(
        () => createGaugeOption("Completion", chartStats.completion),
        [chartStats],
    );

    const difficultyGaugeOption = useMemo(
        () => createGaugeOption("Difficulty", chartStats.difficulty),
        [chartStats],
    );

    const filteredProblems = useMemo(
        () =>
            problems.filter((problem) => {
                const difficultyMatch =
                    !filters.difficulty ||
                    String(problem.difficulty || "").toLowerCase() === filters.difficulty.toLowerCase();
                const statusMatch =
                    !filters.status ||
                    String(problem.status || "").toLowerCase() === filters.status.toLowerCase();
                const tagMatch =
                    !filters.tag ||
                    (Array.isArray(problem.tags) && problem.tags.includes(filters.tag));

                return difficultyMatch && statusMatch && tagMatch;
            }),
        [filters, problems],
    );

    const updateFilter = (field, value) => {
        setFilters((current) => ({
            ...current,
            [field]: value,
        }));
    };

    const handleDelete = async (id) => {
        const confirmed = window.confirm("Delete this DSA problem?");
        if (!confirmed) return;

        await deleteProblem(id);
        toast.success("Problem deleted");
        loadDashboard();
    };

    const handleStatus = async (id, status) => {
        await updateStatus(id, status);
        toast.success(`Problem marked ${status}`);
        loadDashboard();
    };

    const handleRevision = async (id) => {
        await markRevised(id);
        toast.success("Problem marked for revision");
        loadDashboard();
    };

    return (
        <main className="adminPage dsaDashboardPage">
            <header className="adminHeader">
                <div>
                    <p>Admin</p>
                    <h1>DSA Knowledge Base</h1>
                </div>
                <div>
                    <Link to="/admin/blogs">Blogs</Link>
                    <Link to="/admin/dsa/new">New Problem</Link>
                    <button onClick={logout}>Logout</button>
                </div>
            </header>

            <section className="adminStatsGaugeGrid">
                <article className="adminStatsGauge adminPanel">
                    <header>
                        <p>Progress</p>
                        <strong>{chartStats.total} Total</strong>
                    </header>
                    <div className="statsGaugeChart">
                        <ReactECharts
                            option={completionGaugeOption}
                            notMerge
                            lazyUpdate
                            style={{ height: "250px", width: "100%" }}
                        />
                    </div>
                    <div className="statsGaugeLegend">
                        {chartStats.completion.map((item) => (
                            <article key={item.key}>
                                <span style={{ "--stat-color": item.color }} />
                                <div>
                                    <p>{item.label}</p>
                                    <strong>{item.value}</strong>
                                </div>
                                <em>{item.percent}%</em>
                            </article>
                        ))}
                    </div>
                </article>

                <article className="adminStatsGauge adminPanel">
                    <header>
                        <p>Difficulty</p>
                        <strong>{chartStats.total} Total</strong>
                    </header>
                    <div className="statsGaugeChart">
                        <ReactECharts
                            option={difficultyGaugeOption}
                            notMerge
                            lazyUpdate
                            style={{ height: "250px", width: "100%" }}
                        />
                    </div>
                    <div className="statsGaugeLegend">
                        {chartStats.difficulty.map((item) => (
                            <article key={item.key}>
                                <span style={{ "--stat-color": item.color }} />
                                <div>
                                    <p>{item.label}</p>
                                    <strong>{item.value}</strong>
                                </div>
                                <em>{item.percent}%</em>
                            </article>
                        ))}
                    </div>
                </article>
            </section>

            <section className="adminPanel dsaControls">
                <label>
                    Search
                    <input
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        placeholder="Search by title, platform, or tag"
                    />
                </label>
                <label>
                    Difficulty
                    <select
                        value={filters.difficulty}
                        onChange={(e) => updateFilter("difficulty", e.target.value)}
                    >
                        <option value="">All Difficulties</option>
                        {DSA_DIFFICULTIES.map((difficulty) => (
                            <option key={difficulty} value={difficulty}>{difficulty}</option>
                        ))}
                    </select>
                </label>
                <label>
                    Status
                    <select
                        value={filters.status}
                        onChange={(e) => updateFilter("status", e.target.value)}
                    >
                        <option value="">All Statuses</option>
                        {DSA_STATUSES.map((status) => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </select>
                </label>
                <label>
                    Tag
                    <select
                        value={filters.tag}
                        onChange={(e) => updateFilter("tag", e.target.value)}
                    >
                        <option value="">All Tags</option>
                        {tagOptions.map((tag) => (
                            <option key={tag} value={tag}>{tag}</option>
                        ))}
                    </select>
                </label>
            </section>

            <section className="adminPanel">
                {loading ? (
                    <p className="stateText">Loading problems...</p>
                ) : filteredProblems.length === 0 ? (
                    <p className="stateText">No DSA problems found.</p>
                ) : (
                    <div className="adminTableWrap">
                        <table className="adminTable">
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Platform</th>
                                    <th>Difficulty</th>
                                    <th>Status</th>
                                    <th>Tags</th>
                                    <th>Updated At</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProblems.map((problem) => {
                                    const id = getProblemId(problem);
                                    const difficulty = coerceOption(
                                        problem.difficulty,
                                        DSA_DIFFICULTIES,
                                        problem.difficulty || "Easy",
                                    );
                                    const status = coerceOption(
                                        problem.status,
                                        DSA_STATUSES,
                                        problem.status || "Todo",
                                    );

                                    return (
                                        <tr key={id}>
                                            <td>{problem.title}</td>
                                            <td>{problem.platform || "Not available"}</td>
                                            <td>
                                                <span data-difficulty={difficulty}>
                                                    {difficulty}
                                                </span>
                                            </td>
                                            <td>
                                                <span data-status={status}>{status}</span>
                                            </td>
                                            <td>{Array.isArray(problem.tags) ? problem.tags.join(", ") : ""}</td>
                                            <td>{formatDate(problem.updatedAt)}</td>
                                            <td>
                                                <div className="adminActions">
                                                    <Link to={`/admin/dsa/view/${id}`}>View</Link>
                                                    <Link to={`/admin/dsa/edit/${id}`}>Edit</Link>
                                                    <button onClick={() => handleDelete(id)}>Delete</button>
                                                    <button onClick={() => handleRevision(id)}>Revision</button>
                                                    <select
                                                        aria-label={`Change ${problem.title} status`}
                                                        value={status}
                                                        onChange={(e) => handleStatus(id, e.target.value)}
                                                    >
                                                        {DSA_STATUSES.map((status) => (
                                                            <option key={status} value={status}>{status}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </main>
    );
};

export default AdminDsa;
