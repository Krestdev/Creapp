"use client";

import React, { useMemo } from "react";
import { Bank, CreditTransaction, DebitTransaction, Transaction, TRANSACTION_TYPES } from "@/types/types";
import { ChartBar, type BarChartDataItem, type BarChartSeries } from "@/components/Charts/bar-chart"; // <-- adapte le chemin
import { XAF } from "@/lib/utils"; // si tu as déjà un formateur, sinon on fait fallback

interface Props {
  transactions: Array<DebitTransaction | CreditTransaction>;
  banks: Array<Bank>;
}

const formatCurrency = (value: number) => {
  // Si tu as déjà XAF(value) ou formatXAF(value), garde-le.
  try {
    // @ts-ignore
    if (typeof XAF === "function") return XAF(value);
  } catch {}
  return value.toLocaleString("fr-FR") + " FCFA";
};

function TransactionChart({ transactions, banks }: Props) {
  const chartData = useMemo<BarChartDataItem[]>(() => {
    const base = TRANSACTION_TYPES.map((t) => ({
      period: t.name, // ex: "Crédit"
      // clés dynamiques pour ChartBar
      totalAmount: 0,
      count: 0,
    }));

    const filteredTypes = TRANSACTION_TYPES.filter(t=> t.value !== "TRANSFER");

    const byType = new Map<(typeof filteredTypes)[number]["value"], { totalAmount: number; count: number }>();
    filteredTypes.forEach((t) => byType.set(t.value, { totalAmount: 0, count: 0 }));

    for (const tx of transactions) {
      const agg = byType.get(tx.Type);
      if (!agg) continue;
      agg.totalAmount += Number(tx.amount) || 0;
      agg.count += 1;
    }

    return base.map((row) => {
      const typeValue = filteredTypes.find((t) => t.name === row.period)?.value;
      const agg = typeValue ? byType.get(typeValue) : undefined;

      return {
        ...row,
        totalAmount: agg?.totalAmount ?? 0,
        count: agg?.count ?? 0,
      };
    });
  }, [transactions]);

  const series = useMemo<BarChartSeries[]>(
    () => [
      {
        key: "totalAmount",
        label: "Montant total",
        color: "hsl(var(--primary))",
      },
      // 👉 si tu veux aussi afficher le nombre en 2e barre, décommente :
      // {
      //   key: "count",
      //   label: "Nombre",
      //   color: "hsl(var(--muted-foreground))",
      // },
    ],
    []
  );

  return (
    <div className="p-6 rounded-md border w-full h-full flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h3>{"Transactions par type"}</h3>
        <p className="text-gray-600 text-sm">
          {"Montant total par type (Crédit, Débit)"}
        </p>
      </div>

      {transactions.length > 0 && banks.length > 0 ? (
        <ChartBar
          data={chartData}
          series={series}
          height={40}
          showGrid={false}
          showYAxis={false}
          xAxisKey="period"
          xAxisFormatter={(v) => v}
          yAxisFormatter={(v) => formatCurrency(v)}
          tooltipConfig={{
            labelFormatter: (label) => label,
            valueFormatter: (value, _name, payload) => {
              // payload = la ligne (period, totalAmount, count)
              const count = payload?.count;
              return `${formatCurrency(value)}${typeof count === "number" ? ` • ${count} tx` : ""}`;
            },
          }}
          barSize={44}
          barRadius={[10, 10, 0, 0]}
        />
      ) : null}
    </div>
  );
}

export default TransactionChart;
