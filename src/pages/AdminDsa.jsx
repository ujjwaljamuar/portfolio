import { useEffect, useMemo, useState } from "react";
import ReactECharts from "echarts-for-react";
import toast from "react-hot-toast";
import { FiExternalLink } from "react-icons/fi";
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
  { key: "Solved", label: "Solved", color: "#286f6c" },
  { key: "Todo", label: "Todo", color: "#805ad5" },
  { key: "Revision", label: "Revision", color: "#292b46" },
  { key: "easy", label: "Easy", color: "#47a37f" },
  { key: "medium", label: "Medium", color: "#d9a21b" },
  { key: "hard", label: "Hard", color: "#d64545" },
];

const difficultyStats = statLabels.filter((item) =>
  ["easy", "medium", "hard"].includes(item.key),
);

const getStatValue = (stats, item) =>
  Number(
    stats?.[item.key] ??
      stats?.[item.label] ??
      stats?.[item.label.toLowerCase()] ??
      0,
  );

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

  const overviewStats = useMemo(() => {
    const solvedOutOfTotal = stats?.solvedOutOfTotal || {};
    const total =
      Number(solvedOutOfTotal.total ?? getStatValue(stats, statLabels[0])) ||
      problems.length;
    const solved = Number(
      solvedOutOfTotal.solved ?? getStatValue(stats, statLabels[1]),
    );
    const todo = getStatValue(stats, statLabels[2]);
    const revision = getStatValue(stats, statLabels[3]);
    const difficultyBreakdown = difficultyStats.map((item) => {
      const apiDifficulty = stats?.byDifficulty?.[item.key] || {};
      const totalForDifficulty = Number(
        apiDifficulty.total ?? getStatValue(stats, item),
      );
      const solvedFallback = problems.filter((problem) => {
        const difficulty = coerceOption(
          problem.difficulty,
          DSA_DIFFICULTIES,
          "",
        );
        const status = coerceOption(problem.status, DSA_STATUSES, "");

        return (
          difficulty.toLowerCase() === item.label.toLowerCase() &&
          status === "Solved"
        );
      }).length;
      const solvedForDifficulty = Number(
        apiDifficulty.solved ?? solvedFallback,
      );

      return {
        ...item,
        total: totalForDifficulty,
        solved: solvedForDifficulty,
        percent: toPercent(totalForDifficulty, total),
      };
    });

    return {
      total,
      solved,
      todo,
      revision,
      solvedPercent: toPercent(solved, total),
      difficultyBreakdown,
    };
  }, [problems, stats]);

  const overviewGaugeOption = useMemo(() => {
    const hasDifficultyData = overviewStats.difficultyBreakdown.some(
      (item) => item.total > 0,
    );
    const data = hasDifficultyData
      ? overviewStats.difficultyBreakdown.map((item) => ({
          name: item.label,
          value: item.total,
          itemStyle: { color: item.color },
        }))
      : [{ name: "No data", value: 1, itemStyle: { color: "#ede8f8" } }];

    return {
      backgroundColor: "transparent",
      tooltip: {
        trigger: "item",
        formatter: ({ name, value }) =>
          `${name}: ${value}<br/>Solved: ${overviewStats.solvedPercent}%`,
      },
      series: [
        {
          name: "Difficulty",
          type: "pie",
          radius: ["72%", "88%"],
          center: ["50%", "50%"],
          avoidLabelOverlap: true,
          silent: !hasDifficultyData,
          label: { show: false },
          labelLine: { show: false },
          itemStyle: {
            borderColor: "#ffffff",
            borderRadius: 10,
            borderWidth: 5,
          },
          data,
        },
      ],
    };
  }, [overviewStats]);

  const filteredProblems = useMemo(
    () =>
      problems.filter((problem) => {
        const difficultyMatch =
          !filters.difficulty ||
          String(problem.difficulty || "").toLowerCase() ===
            filters.difficulty.toLowerCase();
        const statusMatch =
          !filters.status ||
          String(problem.status || "").toLowerCase() ===
            filters.status.toLowerCase();
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
    const nextStatus = coerceOption(status, DSA_STATUSES, "Todo");

    await updateStatus(id, nextStatus);
    toast.success(`Problem marked ${nextStatus}`);
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

      <section className="dsaOverviewCard adminPanel">
        <div className="dsaOverviewSummary">
          <p>Overview</p>
          <strong>{overviewStats.total}</strong>
          <small>Total problems</small>
          <div>
            <span>{overviewStats.solved} Solved</span>
            <span>{overviewStats.todo} Todo</span>
            <span>{overviewStats.revision} Revision</span>
          </div>
        </div>

        <div className="dsaOverviewGauge">
          <ReactECharts
            option={overviewGaugeOption}
            notMerge
            lazyUpdate
            style={{ height: "180px", width: "100%" }}
          />
          <div className="dsaOverviewCenter">
            <strong>
              {overviewStats.solved}
              <span>/{overviewStats.total}</span>
            </strong>
            <p>{overviewStats.solvedPercent}% solved</p>
          </div>
        </div>

        <div className="dsaOverviewDifficulty">
          {overviewStats.difficultyBreakdown.map((item) => (
            <article key={item.key} style={{ "--stat-color": item.color }}>
              <p>{item.label}</p>
              <strong>
                {item.solved}/{item.total}
              </strong>
              <span>{item.percent}% of total</span>
            </article>
          ))}
        </div>
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
              <option key={difficulty} value={difficulty}>
                {difficulty}
              </option>
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
              <option key={status} value={status}>
                {status}
              </option>
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
              <option key={tag} value={tag}>
                {tag}
              </option>
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
                      <td>
                        <div className="problemTitleCell">
                          <span>{problem.title}</span>
                          {problem.problemUrl && (
                            <a
                              href={problem.problemUrl}
                              target="_blank"
                              rel="noreferrer"
                              aria-label={`Open ${problem.title} problem`}
                            >
                              <FiExternalLink />
                              Problem
                            </a>
                          )}
                        </div>
                      </td>
                      <td>{problem.platform || "Not available"}</td>
                      <td>
                        <span data-difficulty={difficulty}>{difficulty}</span>
                      </td>
                      <td>
                        <span data-status={status}>{status}</span>
                      </td>
                      <td>
                        {Array.isArray(problem.tags)
                          ? problem.tags.join(", ")
                          : ""}
                      </td>
                      <td>{formatDate(problem.updatedAt)}</td>
                      <td>
                        <div className="adminActions">
                          <Link to={`/admin/dsa/view/${id}`}>View</Link>
                          <Link to={`/admin/dsa/edit/${id}`}>Edit</Link>
                          <button onClick={() => handleDelete(id)}>
                            Delete
                          </button>
                          <button onClick={() => handleRevision(id)}>
                            Revision
                          </button>
                          <select
                            aria-label={`Change ${problem.title} status`}
                            value={status}
                            onChange={(e) => handleStatus(id, e.target.value)}
                          >
                            {DSA_STATUSES.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
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
