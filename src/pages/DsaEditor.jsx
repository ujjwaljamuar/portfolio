import MDEditor from "@uiw/react-md-editor";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { FiPlus, FiTrash2, FiUploadCloud } from "react-icons/fi";
import { Link, useNavigate, useParams } from "react-router-dom";
import { uploadBlogImage } from "../services/blogService";
import {
  createProblem,
  getProblem,
  markRevised,
  updateProblem,
} from "../services/dsaService";
import {
  DSA_DIFFICULTIES,
  DSA_STATUSES,
  coerceOption,
  emptyApproach,
  emptyDsaForm,
  normalizeApproaches,
  normalizeProblem,
  tagsToText,
  textToTags,
} from "../utils/dsa";

const appendMarkdownImage = (content, url) => {
  const imageMarkdown = `\n\n![Uploaded image](${url})`;
  return `${content || ""}${imageMarkdown}`;
};

const problemToForm = (problem) => ({
  title: problem.title || "",
  platform: problem.platform || "",
  problemUrl: problem.problemUrl || problem.url || "",
  difficulty: coerceOption(problem.difficulty, DSA_DIFFICULTIES, "Easy"),
  tags: tagsToText(problem.tags),
  status: coerceOption(problem.status, DSA_STATUSES, "Todo"),
  question: problem.question || "",
  approaches: normalizeApproaches(problem.approaches || problem.approach),
  notes: problem.notes || "",
});

const MarkdownField = ({ label, value, onChange, onUpload, uploading }) => (
  <section className="markdownEditor dsaMarkdownField" data-color-mode="light">
    <div className="markdownFieldHeader">
      <h2>{label}</h2>
      <label className={`imageUploadButton ${uploading ? "disableBtn" : ""}`}>
        <FiUploadCloud />
        <span>{uploading ? "Uploading..." : "Image"}</span>
        <input
          type="file"
          accept="image/*"
          onChange={onUpload}
          disabled={uploading}
        />
      </label>
    </div>
    <MDEditor
      value={value}
      onChange={(nextValue) => onChange(nextValue || "")}
      height={360}
      preview="live"
    />
  </section>
);

const DsaEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [form, setForm] = useState(emptyDsaForm);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState("");

  const title = useMemo(
    () => (isEdit ? "Edit Problem" : "New Problem"),
    [isEdit],
  );

  useEffect(() => {
    if (!isEdit) return;

    const loadProblem = async () => {
      try {
        const result = await getProblem(id);
        const problem = normalizeProblem(result);

        if (!problem?._id && !problem?.id) {
          toast.error("Problem not found");
          navigate("/admin/dsa", { replace: true });
          return;
        }

        setForm(problemToForm(problem));
      } finally {
        setLoading(false);
      }
    };

    loadProblem();
  }, [id, isEdit, navigate]);

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const updateApproach = (index, field, value) => {
    setForm((current) => ({
      ...current,
      approaches: current.approaches.map((approach, currentIndex) =>
        currentIndex === index ? { ...approach, [field]: value } : approach,
      ),
    }));
  };

  const addApproach = () => {
    setForm((current) => ({
      ...current,
      approaches: [...current.approaches, { ...emptyApproach }],
    }));
  };

  const removeApproach = (index) => {
    setForm((current) => ({
      ...current,
      approaches: current.approaches.filter(
        (_, currentIndex) => currentIndex !== index,
      ),
    }));
  };

  const uploadMarkdownImage = async (e, target, approachIndex = null) => {
    const file = e.target.files?.[0];
    e.target.value = "";

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }

    const uploadKey =
      approachIndex === null ? target : `${target}-${approachIndex}`;
    setUploadingField(uploadKey);

    try {
      const url = await uploadBlogImage(file);

      if (!url) {
        toast.error("Upload succeeded, but no image URL was returned");
        return;
      }

      if (approachIndex === null) {
        updateField(target, appendMarkdownImage(form[target], url));
      } else {
        const currentValue = form.approaches[approachIndex]?.[target] || "";
        updateApproach(
          approachIndex,
          target,
          appendMarkdownImage(currentValue, url),
        );
      }

      toast.success("Image inserted");
    } catch {
      // API errors are displayed by the shared response interceptor.
    } finally {
      setUploadingField("");
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (uploadingField) return;

    setSaving(true);

    const payload = {
      title: form.title.trim(),
      platform: form.platform.trim(),
      problemUrl: form.problemUrl.trim(),
      difficulty: form.difficulty,
      tags: textToTags(form.tags),
      status: coerceOption(form.status, DSA_STATUSES, "Todo"),
      question: form.question,
      approaches: form.approaches.map((approach) => ({
        title: approach.title.trim(),
        intuition: approach.intuition,
        approach: approach.approach,
        solution: approach.solution,
      })),
      notes: form.notes,
    };

    try {
      if (isEdit) {
        await updateProblem(id, payload);
        toast.success("Problem updated");
      } else {
        await createProblem(payload);
        toast.success("Problem created");
      }

      navigate("/admin/dsa");
    } finally {
      setSaving(false);
    }
  };

  const handleMarkRevised = async () => {
    if (!isEdit) return;

    await markRevised(id);
    toast.success("Problem marked revised");

    const result = await getProblem(id);
    const problem = normalizeProblem(result);
    setForm(problemToForm(problem));
  };

  if (loading) {
    return (
      <main className="adminPage">
        <p className="stateText">Loading editor...</p>
      </main>
    );
  }

  return (
    <main className="adminPage">
      <header className="adminHeader">
        <div>
          <p>Admin</p>
          <h1>{title}</h1>
        </div>
        <div>
          <Link to="/admin/dsa">Dashboard</Link>
          {isEdit && <button onClick={handleMarkRevised}>Mark Revised</button>}
        </div>
      </header>

      <form className="editorForm" onSubmit={submitHandler}>
        <section className="editorFields dsaEditorFields">
          <label>
            Title
            <input
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              required
            />
          </label>
          <label>
            Platform
            <input
              value={form.platform}
              onChange={(e) => updateField("platform", e.target.value)}
              required
            />
          </label>
          <label>
            Problem URL
            <input
              type="url"
              value={form.problemUrl}
              onChange={(e) => updateField("problemUrl", e.target.value)}
              placeholder="https://..."
            />
          </label>
          <label>
            Difficulty
            <select
              value={form.difficulty}
              onChange={(e) => updateField("difficulty", e.target.value)}
            >
              {DSA_DIFFICULTIES.map((difficulty) => (
                <option key={difficulty} value={difficulty}>
                  {difficulty}
                </option>
              ))}
            </select>
          </label>
          <label>
            Tags
            <input
              value={form.tags}
              onChange={(e) => updateField("tags", e.target.value)}
              placeholder="array, dp, graph"
            />
          </label>
          <label>
            Status
            <select
              value={form.status}
              onChange={(e) => updateField("status", e.target.value)}
            >
              {DSA_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
        </section>

        <MarkdownField
          label="Question"
          value={form.question}
          onChange={(value) => updateField("question", value)}
          onUpload={(e) => uploadMarkdownImage(e, "question")}
          uploading={uploadingField === "question"}
        />

        <section className="approachesSection">
          <div className="sectionTitleRow">
            <h2>Approaches</h2>
            <button type="button" onClick={addApproach}>
              <FiPlus />
              Add Approach
            </button>
          </div>

          {form.approaches.length === 0 && (
            <p className="optionalSectionNote">
              No approaches added. You can save the problem without one.
            </p>
          )}

          {form.approaches.map((approach, index) => (
            <article className="approachItem" key={index}>
              <div className="approachHeader">
                <label>
                  Approach Title
                  <input
                    value={approach.title}
                    onChange={(e) =>
                      updateApproach(index, "title", e.target.value)
                    }
                    placeholder={`Approach ${index + 1}`}
                  />
                </label>
                <button type="button" onClick={() => removeApproach(index)}>
                  <FiTrash2 />
                  Remove Approach
                </button>
              </div>

              <MarkdownField
                label="Intuition"
                value={approach.intuition}
                onChange={(value) => updateApproach(index, "intuition", value)}
                onUpload={(e) => uploadMarkdownImage(e, "intuition", index)}
                uploading={uploadingField === `intuition-${index}`}
              />
              <MarkdownField
                label="Approach"
                value={approach.approach}
                onChange={(value) => updateApproach(index, "approach", value)}
                onUpload={(e) => uploadMarkdownImage(e, "approach", index)}
                uploading={uploadingField === `approach-${index}`}
              />
              <MarkdownField
                label="Solution"
                value={approach.solution}
                onChange={(value) => updateApproach(index, "solution", value)}
                onUpload={(e) => uploadMarkdownImage(e, "solution", index)}
                uploading={uploadingField === `solution-${index}`}
              />
            </article>
          ))}
        </section>

        <MarkdownField
          label="Notes"
          value={form.notes}
          onChange={(value) => updateField("notes", value)}
          onUpload={(e) => uploadMarkdownImage(e, "notes")}
          uploading={uploadingField === "notes"}
        />

        <div className="editorActions">
          <Link to="/admin/dsa">Cancel</Link>
          <button
            disabled={saving || Boolean(uploadingField)}
            className={saving || uploadingField ? "disableBtn" : ""}
          >
            {saving ? "Saving..." : "Save Problem"}
          </button>
        </div>
      </form>
    </main>
  );
};

export default DsaEditor;
