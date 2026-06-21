import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate, useParams } from "react-router-dom";
import MarkdownRenderer from "../components/MarkdownRenderer";
import { getProblem, markRevised } from "../services/dsaService";
import {
    DSA_DIFFICULTIES,
    DSA_STATUSES,
    coerceOption,
    formatDate,
    normalizeApproaches,
    normalizeProblem,
} from "../utils/dsa";

const AdminDsaDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [problem, setProblem] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadProblem = async () => {
        setLoading(true);
        try {
            const result = await getProblem(id);
            const nextProblem = normalizeProblem(result);

            if (!nextProblem?._id && !nextProblem?.id) {
                toast.error("Problem not found");
                navigate("/admin/dsa", { replace: true });
                return;
            }

            setProblem(nextProblem);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProblem();
    }, [id]);

    const handleMarkRevised = async () => {
        await markRevised(id);
        toast.success("Problem marked revised");
        loadProblem();
    };

    if (loading) {
        return <main className="adminPage"><p className="stateText">Loading problem...</p></main>;
    }

    if (!problem) {
        return <main className="adminPage"><p className="stateText">Problem not found.</p></main>;
    }

    const difficulty = coerceOption(problem.difficulty, DSA_DIFFICULTIES, "Easy");
    const status = coerceOption(problem.status, DSA_STATUSES, "Todo");
    const approaches = normalizeApproaches(problem.approaches || problem.approach);

    return (
        <main className="adminPage">
            <header className="adminHeader">
                <div>
                    <p>DSA Problem</p>
                    <h1>{problem.title}</h1>
                </div>
                <div>
                    <Link to="/admin/dsa">Dashboard</Link>
                    <Link to={`/admin/dsa/edit/${id}`}>Edit</Link>
                    <button onClick={handleMarkRevised}>Mark Revised</button>
                </div>
            </header>

            <article className="dsaDetail">
                <section className="dsaDetailMeta adminPanel">
                    <div>
                        <span>Platform</span>
                        <strong>{problem.platform || "Not available"}</strong>
                    </div>
                    <div>
                        <span>Difficulty</span>
                        <strong data-difficulty={difficulty}>{difficulty}</strong>
                    </div>
                    <div>
                        <span>Status</span>
                        <strong data-status={status}>{status}</strong>
                    </div>
                    <div>
                        <span>Updated</span>
                        <strong>{formatDate(problem.updatedAt)}</strong>
                    </div>
                    {problem.problemUrl && (
                        <a href={problem.problemUrl} target="_blank" rel="noreferrer">
                            Open Problem
                        </a>
                    )}
                </section>

                {Array.isArray(problem.tags) && problem.tags.length > 0 && (
                    <div className="tagRow dsaDetailTags">
                        {problem.tags.map((tag) => (
                            <small key={tag}>{tag}</small>
                        ))}
                    </div>
                )}

                <section className="adminPanel dsaReadSection">
                    <h2>Question</h2>
                    <MarkdownRenderer content={problem.question} />
                </section>

                <section className="dsaReadApproaches">
                    <h2>Approaches</h2>
                    {approaches.map((approach, index) => (
                        <article className="adminPanel dsaReadSection" key={index}>
                            <h3>{approach.title || `Approach ${index + 1}`}</h3>
                            <h4>Intuition</h4>
                            <MarkdownRenderer content={approach.intuition} />
                            <h4>Approach</h4>
                            <MarkdownRenderer content={approach.approach} />
                            <h4>Solution</h4>
                            <MarkdownRenderer content={approach.solution} />
                        </article>
                    ))}
                </section>

                <section className="adminPanel dsaReadSection">
                    <h2>Notes</h2>
                    <MarkdownRenderer content={problem.notes} />
                </section>
            </article>
        </main>
    );
};

export default AdminDsaDetail;
