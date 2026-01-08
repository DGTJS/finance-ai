"use client";

import { NumericFormat } from "react-number-format";

type MoneyInputProps = {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
};

/**
 * MoneyInput - Componente de entrada de valores monetários
 *
 * FLUXO CORRETO:
 * 1. Recebe valor em CENTAVOS (ex: "200000" para R$ 2.000,00)
 * 2. Converte para reais para exibição (ex: "2000.00")
 * 3. Usuário digita: "2000" ou "2000,00"
 * 4. NumericFormat retorna "2000" (sem separadores)
 * 5. Multiplica por 100 para converter para centavos: 2000 * 100 = 200000
 * 6. Retorna sempre em CENTAVOS para o componente pai
 * 7. Componente pai salva diretamente no banco como inteiro em centavos
 *
 * EXEMPLOS:
 * - Recebe "10000" (centavos) → Exibe "R$ 100,00" → Usuário digita "100" → Retorna "10000"
 * - Recebe "200000" (centavos) → Exibe "R$ 2.000,00" → Usuário digita "2000" → Retorna "200000"
 */
export function MoneyInput({
  value,
  onValueChange,
  placeholder,
}: MoneyInputProps) {
  // Converter valor de centavos para reais para exibição
  // value sempre vem em centavos (ex: "200000")
  const displayValue = value ? (parseFloat(value) / 100).toFixed(2) : "";

  return (
    <NumericFormat
      value={displayValue}
      onValueChange={(values) => {
        let normalizedValue = values.value;

        // Se o valor está vazio ou zero, passar "0" (0 centavos)
        if (
          !normalizedValue ||
          normalizedValue === "0" ||
          normalizedValue === ""
        ) {
          onValueChange("0");
          return;
        }

        const numValue = parseFloat(normalizedValue) || 0;

        // NumericFormat com decimalScale={2} sempre retorna valores com 2 casas decimais implícitas
        // Exemplo: usuário digita "2000" → NumericFormat retorna "2000" (que significa "2000,00")
        // Precisamos multiplicar por 100 para converter para centavos
        // Exemplo: "2000" → 2000 * 100 = 200000 centavos

        // Multiplicar por 100 para converter reais para centavos
        const centsValue = Math.round(numValue * 100);
        normalizedValue = centsValue.toString();

        // Retornar valor em CENTAVOS (número inteiro como string)
        onValueChange(normalizedValue);
      }}
      thousandSeparator="."
      decimalSeparator=","
      prefix="R$ "
      allowNegative={false}
      decimalScale={2}
      fixedDecimalScale
      className="w-full rounded border px-3 py-2"
      placeholder={placeholder ?? "R$ 0,00"}
    />
  );
}
