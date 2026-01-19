import { FormEvent, useEffect, useState } from "react";
import { Rule, RuleConditionType } from "../types";

type Mode = "create" | "edit";

interface Props {
  initialRule: Rule | null;
  mode: Mode;
  onCreate: (rule: Omit<Rule, "id">) => void | Promise<void>;
  onUpdate: (rule: Rule) => void | Promise<void>;
}

function RuleForm({ initialRule, mode, onCreate, onUpdate }: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [conditionType, setConditionType] = useState<RuleConditionType>("expression");
  const [condition, setCondition] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialRule) {
      setName(initialRule.name);
      setDescription(initialRule.description ?? "");
      setIsActive(initialRule.isActive);
      setConditionType(initialRule.conditionType);
      setCondition(initialRule.condition);
    } else {
      setName("");
      setDescription("");
      setIsActive(true);
      setConditionType("expression");
      setCondition("");
    }
    setError(null);
  }, [initialRule]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    if (!condition.trim()) {
      setError("Condition is required");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      if (mode === "create") {
        await onCreate({
          name: name.trim(),
          description: description.trim() || undefined,
          isActive,
          conditionType,
          condition
        });
      } else if (initialRule) {
        await onUpdate({
          ...initialRule,
          name: name.trim(),
          description: description.trim() || undefined,
          isActive,
          conditionType,
          condition
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Save failed";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="form">
      {error && <div className="error">{error}</div>}
      <label className="field">
        <span className="label">Name</span>
        <input
          className="input"
          value={name}
          onChange={event => setName(event.target.value)}
        />
      </label>
      <label className="field">
        <span className="label">Description</span>
        <textarea
          className="textarea"
          rows={3}
          value={description}
          onChange={event => setDescription(event.target.value)}
        />
      </label>
      <label className="field checkbox-field">
        <input
          type="checkbox"
          checked={isActive}
          onChange={event => setIsActive(event.target.checked)}
        />
        <span>Active</span>
      </label>
      <label className="field">
        <span className="label">Condition type</span>
        <select
          className="select"
          value={conditionType}
          onChange={event => setConditionType(event.target.value as RuleConditionType)}
        >
          <option value="expression">Expression</option>
          <option value="json">JSON</option>
        </select>
      </label>
      <label className="field">
        <span className="label">
          {conditionType === "expression" ? "Expression" : "JSON condition"}
        </span>
        <textarea
          className="textarea"
          rows={8}
          value={condition}
          onChange={event => setCondition(event.target.value)}
        />
      </label>
      <div className="form-actions">
        <button type="submit" className="primary" disabled={submitting}>
          {submitting ? "Saving…" : mode === "create" ? "Create" : "Update"}
        </button>
      </div>
    </form>
  );
}

export default RuleForm;

