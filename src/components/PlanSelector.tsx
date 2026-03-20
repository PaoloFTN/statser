"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type PlanSelectorOption = {
  id: string;
  name: string;
};

interface PlanSelectorProps {
  plans: PlanSelectorOption[];
  value: string | undefined;
  onChange: (id: string) => void;
  placeholder?: string;
  className?: string;
}

export function PlanSelector({
  plans,
  value,
  onChange,
  placeholder = "Seleziona piano",
  className,
}: PlanSelectorProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {plans.map((plan) => (
          <SelectItem key={plan.id} value={plan.id}>
            {plan.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
