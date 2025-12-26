"use client";

import { useMemo } from "react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

export interface Category {
  name: string;
  emoji: string;
  color: string;
  value: number;
}

interface CircularExpenseChartProps {
  categories: Category[];
  onViewTransactions?: () => void;
  showBalance?: boolean;
  balance?: number;
}

// Função para formatar valor em BRL
function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

// Função para converter graus em radianos
function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

// Função para calcular posição em um círculo
function getPositionOnCircle(
  angle: number,
  radius: number,
  centerX: number,
  centerY: number,
): { x: number; y: number } {
  const rad = toRadians(angle);
  return {
    x: centerX + radius * Math.cos(rad),
    y: centerY + radius * Math.sin(rad),
  };
}

export default function CircularExpenseChart({
  categories,
  onViewTransactions,
  showBalance = false,
  balance = 0,
}: CircularExpenseChartProps) {
  const router = useRouter();

  // Debug: verificar quantas categorias estão chegando
  if (typeof window !== "undefined") {
    console.log(
      "🔵 CircularExpenseChart - Categorias recebidas:",
      categories.length,
    );
    console.table(
      categories.map((c) => ({
        nome: c.name,
        emoji: c.emoji,
        valor: c.value.toFixed(2),
        cor: c.color,
      })),
    );
  }

  const { total, arcs, centerX, centerY, radius, strokeWidth } = useMemo(() => {
    // Se não houver categorias, retornar valores vazios
    if (!categories || categories.length === 0) {
      return {
        total: 0,
        arcs: [],
        centerX: 200,
        centerY: 200,
        radius: 130,
        strokeWidth: 48,
      };
    }

    // Configurações do gráfico
    const size = 400; // Tamanho do SVG
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = 120; // Raio do círculo (ajustado para deixar espaço para emojis)
    const strokeWidth = 40; // Espessura dos arcos
    const gapDegrees = 3; // Espaço entre arcos em graus (aumentado para melhor separação)

    // Filtrar apenas categorias com valor > 0
    const categoriesWithValues = categories.filter((c) => c.value > 0);
    const totalGapAngle = categoriesWithValues.length * gapDegrees;

    // Calcular total
    const total = categoriesWithValues.reduce((sum, cat) => sum + cat.value, 0);

    // Calcular arcos
    let currentAngle = -90; // Começar do topo (-90 graus)

    // Ângulo total disponível para distribuir entre as categorias
    const totalAngleToDistribute = 360 - totalGapAngle;

    // Definir ângulo mínimo para garantir visibilidade (4 graus para categorias muito pequenas)
    const minAngle = 4;

    // Calcular ângulos proporcionalmente
    const angles = categoriesWithValues.map((category) => {
      const percentage = total > 0 ? category.value / total : 0;
      return totalAngleToDistribute * percentage;
    });

    // Verificar se alguma categoria tem ângulo muito pequeno
    const hasVerySmallAngles = angles.some((angle) => angle < minAngle);

    // Se houver categorias muito pequenas, redistribuir o espaço
    if (hasVerySmallAngles && categoriesWithValues.length > 1) {
      const verySmallCount = angles.filter((angle) => angle < minAngle).length;
      const totalMinAngle = verySmallCount * minAngle;
      const remainingAngle = totalAngleToDistribute - totalMinAngle;

      // Redistribuir o espaço restante proporcionalmente entre as categorias maiores
      const largeCategoriesTotal = categoriesWithValues.reduce(
        (sum, cat, idx) => {
          return sum + (angles[idx] >= minAngle ? cat.value : 0);
        },
        0,
      );

      // Recalcular ângulos
      categoriesWithValues.forEach((category, idx) => {
        if (angles[idx] < minAngle) {
          angles[idx] = minAngle;
        } else if (largeCategoriesTotal > 0) {
          const percentage = category.value / largeCategoriesTotal;
          angles[idx] = remainingAngle * percentage;
        }
      });
    }

    const arcs = categoriesWithValues
      .map((category, idx) => {
        const angle = angles[idx];
        const percentage = total > 0 ? category.value / total : 0;

        const startAngle = currentAngle;
        const endAngle = currentAngle + angle;

        // Calcular posição do emoji (no meio do arco, ligeiramente fora)
        const emojiRadius = radius + strokeWidth / 2 + 30; // Posição do emoji (mais afastado para evitar sobreposição)
        const emojiAngle = startAngle + angle / 2; // Meio do arco
        const emojiPos = getPositionOnCircle(
          emojiAngle,
          emojiRadius,
          centerX,
          centerY,
        );

        // Calcular path do arco
        const startRad = toRadians(startAngle);
        const endRad = toRadians(endAngle);
        const largeArcFlag = angle > 180 ? 1 : 0;

        const startX = centerX + radius * Math.cos(startRad);
        const startY = centerY + radius * Math.sin(startRad);
        const endX = centerX + radius * Math.cos(endRad);
        const endY = centerY + radius * Math.sin(endRad);

        // Garantir que os valores são válidos
        if (
          isNaN(startX) ||
          isNaN(startY) ||
          isNaN(endX) ||
          isNaN(endY) ||
          isNaN(radius)
        ) {
          return null;
        }

        const path = `M ${startX.toFixed(2)} ${startY.toFixed(2)} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX.toFixed(2)} ${endY.toFixed(2)}`;

        currentAngle = endAngle + gapDegrees;

        return {
          category,
          path,
          startAngle,
          endAngle,
          angle,
          percentage,
          emojiPos,
          value: category.value,
        };
      })
      .filter((arc): arc is NonNullable<typeof arc> => arc !== null);

    // Debug: verificar quantos arcos foram gerados
    if (typeof window !== "undefined") {
      console.log("🟢 CircularExpenseChart - Arcos gerados:", arcs.length);
      console.log(
        "📊 Total de categorias com valores:",
        categoriesWithValues.length,
      );
      console.log("💰 Total de gastos:", total.toFixed(2));
      if (arcs.length > 0) {
        console.table(
          arcs.map((a) => ({
            nome: a.category.name,
            emoji: a.category.emoji,
            valor: `R$ ${a.value.toFixed(2)}`,
            cor: a.category.color,
            angulo: `${a.angle.toFixed(2)}°`,
            porcentagem: `${(a.percentage * 100).toFixed(2)}%`,
            posX: a.emojiPos.x.toFixed(1),
            posY: a.emojiPos.y.toFixed(1),
          })),
        );
      } else {
        console.warn("⚠️ Nenhum arco foi gerado!");
        console.log("📋 Categorias recebidas:", categories);
      }
    }

    return {
      total,
      arcs,
      centerX,
      centerY,
      radius,
      strokeWidth,
    };
  }, [categories]);

  // Se não houver categorias, mostrar mensagem
  if (!categories || categories.length === 0) {
    return (
      <div className="flex items-center justify-center p-4 sm:p-6">
        <div className="text-center">
          <p className="text-muted-foreground mb-3 text-sm">
            Nenhuma despesa registrada
          </p>
        </div>
      </div>
    );
  }

  // Debug: mostrar informação sobre categorias
  if (typeof window !== "undefined" && arcs.length === 0) {
    console.error("Nenhum arco foi gerado das categorias:", categories);
  }

  const handleViewTransactions = () => {
    if (onViewTransactions) {
      onViewTransactions();
    } else {
      router.push("/transactions");
    }
  };

  return (
    <div className="flex w-full items-center justify-center p-1 sm:p-2 md:p-4">
      <div
        className="relative w-full max-w-full"
        style={{
          aspectRatio: "1 / 1",
          maxWidth: "100%",
          minHeight: "250px",
          maxHeight: "400px",
        }}
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 400 400"
          className="w-full"
          style={{
            display: "block",
            maxWidth: "100%",
            minHeight: "250px",
            maxHeight: "400px",
          }}
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Arcos */}
          {arcs.length > 0 &&
            arcs.map((arc, index) => {
              // Verificar se o path é válido
              if (
                !arc.path ||
                arc.path === "M NaN NaN A NaN NaN 0 0 1 NaN NaN" ||
                arc.path.includes("NaN")
              ) {
                console.warn(
                  `⚠️ Arco ${index} (${arc.category.name}) inválido - Path:`,
                  arc.path,
                );
                return null;
              }

              // Verificar se as posições do emoji são válidas
              if (isNaN(arc.emojiPos.x) || isNaN(arc.emojiPos.y)) {
                console.warn(
                  `⚠️ Posição do emoji inválida para categoria ${arc.category.name}:`,
                  arc.emojiPos,
                );
                return null;
              }

              // Renderizar arco e emoji
              return (
                <g
                  key={`arc-${index}-${arc.category.name}-${arc.category.emoji}`}
                >
                  {/* Arco da categoria */}
                  <path
                    d={arc.path}
                    fill="none"
                    stroke={arc.category.color}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    className="transition-all hover:opacity-90"
                    style={{
                      opacity: 1,
                      display: "block",
                    }}
                  />
                  {/* Círculo branco para o emoji */}
                  <circle
                    cx={arc.emojiPos.x}
                    cy={arc.emojiPos.y}
                    r="22"
                    fill="white"
                    stroke={arc.category.color}
                    strokeWidth="2"
                    className="shadow-sm"
                    style={{
                      opacity: 1,
                      display: "block",
                    }}
                  />
                  {/* Emoji da categoria */}
                  <text
                    x={arc.emojiPos.x}
                    y={arc.emojiPos.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize="24"
                    className="pointer-events-none select-none"
                    style={{
                      opacity: 1,
                      display: "block",
                    }}
                  >
                    {arc.category.emoji}
                  </text>
                </g>
              );
            })}
        </svg>

        {/* Centro do gráfico */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <div className="pointer-events-auto flex flex-col items-center gap-2 text-center">
            <p className="text-muted-foreground text-sm font-medium">
              {showBalance ? "Saldo Total" : "Total"}
            </p>
            <p
              className={`text-2xl font-bold sm:text-3xl ${
                showBalance
                  ? balance >= 0
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                  : "text-foreground"
              }`}
            >
              {showBalance ? formatCurrency(balance) : formatCurrency(total)}
            </p>
            <Button
              onClick={handleViewTransactions}
              className="mt-2 h-auto rounded-md bg-[#065f46] px-4 py-2 text-xs font-medium text-white shadow-sm transition-all hover:bg-[#047857] hover:shadow-md sm:text-sm"
            >
              Ver transações
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
