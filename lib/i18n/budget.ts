/**
 * Budget bands offered on the contact form.
 *
 * The *key* is what gets stored in `contact_messages.budget`, so the stored value
 * stays language independent; the label is resolved from the dictionary.
 */
export const BUDGET_OPTIONS = [
  { value: "under_50k", labelKey: "budgetUnder50k" },
  { value: "50k_150k", labelKey: "budget50to150k" },
  { value: "150k_500k", labelKey: "budget150to500k" },
  { value: "over_500k", labelKey: "budgetOver500k" },
  { value: "unsure", labelKey: "budgetUnsure" },
] as const;

export type BudgetOption = (typeof BUDGET_OPTIONS)[number];
export type BudgetValue = (typeof BUDGET_OPTIONS)[number]["value"];

export function isBudgetValue(value: string): value is BudgetValue {
  return BUDGET_OPTIONS.some((option) => option.value === value);
}