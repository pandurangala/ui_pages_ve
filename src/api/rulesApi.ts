import { ExecuteRequest, ExecuteResponse, Rule } from "../types";

const basePath = "/api";

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with status ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export async function getRules(): Promise<Rule[]> {
  const response = await fetch(`${basePath}/rules`);
  return handleResponse<Rule[]>(response);
}

export async function createRule(rule: Omit<Rule, "id">): Promise<Rule> {
  const response = await fetch(`${basePath}/rules`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(rule)
  });
  return handleResponse<Rule>(response);
}

export async function updateRule(rule: Rule): Promise<Rule> {
  const response = await fetch(`${basePath}/rules/${encodeURIComponent(rule.id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(rule)
  });
  return handleResponse<Rule>(response);
}

export async function deleteRule(id: string): Promise<void> {
  const response = await fetch(`${basePath}/rules/${encodeURIComponent(id)}`, {
    method: "DELETE"
  });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with status ${response.status}`);
  }
}

export async function executeRules(request: ExecuteRequest): Promise<ExecuteResponse> {
  const response = await fetch(`${basePath}/rules/execute`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request)
  });
  return handleResponse<ExecuteResponse>(response);
}

