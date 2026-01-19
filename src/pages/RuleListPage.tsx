import { useEffect, useMemo, useState } from "react";
import { Rule } from "../types";
import { createRule, deleteRule, getRules, updateRule } from "../api/rulesApi";
import RuleForm from "../ui/RuleForm";

type FormMode = "create" | "edit";

function RuleListPage() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<FormMode>("create");
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);

  const selectedRule = useMemo(
    () => rules.find(r => r.id === selectedRuleId) ?? null,
    [rules, selectedRuleId]
  );

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await getRules();
        if (!cancelled) {
          setRules(data);
        }
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : "Failed to load rules";
          setError(message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleCreate(input: Omit<Rule, "id">) {
    setError(null);
    try {
      const created = await createRule(input);
      setRules(current => [...current, created]);
      setMode("create");
      setSelectedRuleId(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create rule";
      setError(message);
    }
  }

  async function handleUpdate(input: Rule) {
    setError(null);
    try {
      const updated = await updateRule(input);
      setRules(current => current.map(r => (r.id === updated.id ? updated : r)));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update rule";
      setError(message);
    }
  }

  async function handleDelete(id: string) {
    setError(null);
    try {
      await deleteRule(id);
      setRules(current => current.filter(r => r.id !== id));
      if (selectedRuleId === id) {
        setSelectedRuleId(null);
        setMode("create");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete rule";
      setError(message);
    }
  }

  function startCreate() {
    setMode("create");
    setSelectedRuleId(null);
  }

  function startEdit(id: string) {
    setMode("edit");
    setSelectedRuleId(id);
  }

  return (
    <div className="page">
      <div className="page-header">
        <h2>Rules</h2>
        <button type="button" onClick={startCreate} className="primary">
          New rule
        </button>
      </div>
      {loading && <div className="info">Loading rules…</div>}
      {error && <div className="error">{error}</div>}
      <div className="layout">
        <section className="panel panel-list">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Condition type</th>
                <th>Active</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rules.map(rule => (
                <tr key={rule.id}>
                  <td>{rule.name}</td>
                  <td>{rule.conditionType}</td>
                  <td>{rule.isActive ? "Yes" : "No"}</td>
                  <td className="table-actions">
                    <button type="button" onClick={() => startEdit(rule.id)}>
                      Edit
                    </button>
                    <button type="button" onClick={() => handleDelete(rule.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {rules.length === 0 && !loading && (
                <tr>
                  <td colSpan={4} className="muted">
                    No rules defined yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
        <section className="panel panel-form">
          <h3>{mode === "create" ? "Create rule" : "Edit rule"}</h3>
          <RuleForm
            key={selectedRule?.id ?? "new"}
            initialRule={selectedRule}
            mode={mode}
            onCreate={handleCreate}
            onUpdate={handleUpdate}
          />
        </section>
      </div>
    </div>
  );
}

export default RuleListPage;

