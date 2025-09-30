"use client";

import { NumericFormat } from "react-number-format";

type MoneyInputProps = {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
};

export function MoneyInput({
  value,
  onValueChange,
  placeholder,
}: MoneyInputProps) {
  return (
    <NumericFormat
      value={value}
      onValueChange={(values) => onValueChange(values.value)}
      thousandSeparator="."
      decimalSeparator=","
      prefix="R$ "
      allowNegative={false}
      decimalScale={2}
      fixedDecimalScale
      className="w-full rounded border px-3 py-2"
      placeholder={placeholder ?? "R$ 0.000,00"}
    />
  );
}
