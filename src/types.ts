export type RuleConditionType = "expression" | "json";

export interface Rule {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  conditionType: RuleConditionType;
  condition: string;
}

export interface ExecuteRequest {
  payload: unknown;
  ruleIds: string[];
}

export interface ExecuteResultItem {
  ruleId: string;
  ruleName: string;
  passed: boolean;
  message?: string;
}

export interface ExecuteResponse {
  results: ExecuteResultItem[];
}

