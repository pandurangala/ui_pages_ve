import { FormEvent, useEffect, useState } from "react";
import { ExecuteResultItem, Rule } from "../types";
import { executeRules, getRules } from "../api/rulesApi";

function ExecuteRulesPage() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [payloadText, setPayloadText] = useState("{\n  \n}");
  const [loadingRules, setLoadingRules] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<ExecuteResultItem[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoadingRules(true);
      setError(null);
      try {
        const data = await getRules();
        if (!cancelled) {
          const active = data.filter(r => r.isActive);
          setRules(active);
          setSelectedIds(active.map(r => r.id));
        }
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : "Failed to load rules";
          setError(message);
        }
      } finally {
        if (!cancelled) {
          setLoadingRules(false);
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  function toggleRule(id: string) {
    setSelectedIds(previous =>
      previous.includes(id) ? previous.filter(x => x !== id) : [...previous, id]
    );
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setResults(null);
    let payload: unknown;
    try {
      payload = JSON.parse(payloadText);
    } catch {
      setError("Payload is not valid JSON");
      return;
    }
    if (selectedIds.length === 0) {
      setError("Select at least one rule to execute");
      return;
    }
    try {
      setExecuting(true);
      const response = await executeRules({ payload, ruleIds: selectedIds });
      setResults(response.results);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Execution failed";
      setError(message);
    } finally {
      setExecuting(false);
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h2>Execute rules</h2>
      </div>
      {loadingRules && <div className="info">Loading rules…</div>}
      {error && <div className="error">{error}</div>}
      <form className="layout" onSubmit={handleSubmit}>
        <section className="panel">
          <h3>Payload</h3>
          <textarea
            className="textarea"
            value={payloadText}
            onChange={event => setPayloadText(event.target.value)}
            rows={16}
          />
        </section>
        <section className="panel">
          <h3>Rules</h3>
          <div className="rule-list">
            {rules.map(rule => (
              <label key={rule.id} className="rule-checkbox">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(rule.id)}
                  onChange={() => toggleRule(rule.id)}
                />
                <span>{rule.name}</span>
              </label>
            ))}
            {rules.length === 0 && !loadingRules && (
              <div className="muted">No active rules available.</div>
            )}
          </div>
          <button
            type="submit"
            className="primary"
            disabled={executing || loadingRules}
          >
            {executing ? "Executing…" : "Execute"}
          </button>
        </section>
      </form>
      {results && (
        <section className="panel panel-results">
          <h3>Results</h3>
          <table className="table">
            <thead>
              <tr>
                <th>Rule</th>
                <th>Passed</th>
                <th>Message</th>
              </tr>
            </thead>
            <tbody>
              {results.map(result => (
                <tr key={result.ruleId}>
                  <td>{result.ruleName}</td>
                  <td>{result.passed ? "Yes" : "No"}</td>
                  <td>{result.message ?? ""}</td>
                </tr>
              ))}
              {results.length === 0 && (
                <tr>
                  <td colSpan={3} className="muted">
                    No results returned.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}

export default ExecuteRulesPage;

