"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { paymentQ } from "@/queries/payment";
import { purchaseQ } from "@/queries/purchase-order";
import { quotationQ } from "@/queries/quotation";
import { commandRqstQ } from "@/queries/commandRqstModule";
import {
  getGlobalStatus,
  GLOBAL_STATUS_ORDER,
  findLinkedTicket,
  findLinkedBC,
  findLinkedQuotation,
  findLinkedCommandRequest,
} from "@/lib/status-calculator";
import { RequestModelT } from "@/types/types";

interface ChartGlobalStateProps {
  filteredData: RequestModelT[];
}

export function ChartGlobalState({ filteredData = [] }: ChartGlobalStateProps) {
  // Récupérer les données annexes pour reconstituer l'état global
  const { data: ticketsData, isLoading: loadingTickets } = useQuery({
    queryKey: ["all-tickets-global-state"],
    queryFn: () => paymentQ.getAll(),
    staleTime: 60000,
  });

  const { data: bcsData, isLoading: loadingBCs } = useQuery({
    queryKey: ["all-bcs-global-state"],
    queryFn: () => purchaseQ.getAll(),
    staleTime: 60000,
  });

  const { data: quotationsData, isLoading: loadingQuotations } = useQuery({
    queryKey: ["all-quotations-global-state"],
    queryFn: () => quotationQ.getAll(),
    staleTime: 60000,
  });

  const { data: commandRqstsData, isLoading: loadingCommandRqsts } = useQuery({
    queryKey: ["all-command-rqsts-global-state"],
    queryFn: () => commandRqstQ.getAll(),
    staleTime: 60000,
  });

  const chartData = React.useMemo(() => {
    if (!filteredData.length) return [];

    const ticketsArray = Array.isArray(ticketsData)
      ? ticketsData
      : (ticketsData as any)?.data || [];
    const bcsArray = Array.isArray(bcsData)
      ? bcsData
      : (bcsData as any)?.data || [];
    const quotationsArray = Array.isArray(quotationsData)
      ? quotationsData
      : (quotationsData as any)?.data || [];
    const commandRqstsArray = Array.isArray(commandRqstsData)
      ? commandRqstsData
      : (commandRqstsData as any)?.data || [];

    const counts = new Map<string, number>();
    GLOBAL_STATUS_ORDER.forEach((status) => counts.set(status, 0));

    filteredData.forEach((request) => {
      const ticket = findLinkedTicket(request.id, ticketsArray);
      const bc = findLinkedBC(request.id, bcsArray);
      const quotation = findLinkedQuotation(request.id, quotationsArray);
      const commandRequest = findLinkedCommandRequest(
        request.id,
        commandRqstsArray,
      );
      const status = getGlobalStatus(
        request,
        ticket,
        bc,
        quotation,
        commandRequest,
      );
      counts.set(status!, (counts.get(status!) || 0) + 1);
    });

    return GLOBAL_STATUS_ORDER.map((status) => ({
      status,
      count: counts.get(status) || 0,
    }));
  }, [filteredData, ticketsData, bcsData, quotationsData, commandRqstsData]);

  const isLoading =
    loadingTickets || loadingBCs || loadingQuotations || loadingCommandRqsts;

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Suivi global des besoins</CardTitle>
        <CardDescription>
          Répartition des besoins selon leur état exact dans le circuit de
          validation et de paiement
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-[350px] text-muted-foreground">
            {`Calcul de l'état détaillé en cours...`}
          </div>
        ) : chartData.length > 0 ? (
          <ChartContainer
            config={{
              count: {
                label: "Nombre de besoins",
                color: "hsl(var(--primary))",
              },
            }}
            className="h-[400px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 10, left: 0, bottom: 10 }}
              >
                <CartesianGrid
                  vertical={false}
                  strokeDasharray="4 4"
                  opacity={0.5}
                />
                <XAxis
                  type="category"
                  dataKey="status"
                  tickLine={false}
                  axisLine={false}
                  tick={{
                    fontSize: 10,
                    fill: "var(--foreground)",
                    fontWeight: 500,
                  }}
                  tickFormatter={(val) =>
                    val.length > 15 ? val.substring(0, 15) + "..." : val
                  }
                />
                <YAxis type="number" tickLine={false} axisLine={false} />
                <ChartTooltip
                  cursor={{ fill: "var(--color-border)", opacity: 0.1 }}
                  content={
                    <ChartTooltipContent
                      indicator="dot"
                      formatter={(value) => (
                        <div className="flex items-center gap-2">
                          <div className="h-2.5 w-2.5 shrink-0 rounded-[2px] bg-primary" />
                          <span className="text-muted-foreground">
                            Nombre :
                          </span>
                          <span className="font-medium text-foreground">
                            {value}
                          </span>
                        </div>
                      )}
                    />
                  }
                />
                <Bar
                  dataKey="count"
                  fill="var(--primary)"
                  radius={[4, 4, 0, 0]}
                  barSize={50}
                  animationDuration={1000}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
          <div className="flex items-center justify-center h-[350px] text-muted-foreground">
            Aucun besoin trouvé
          </div>
        )}
      </CardContent>
    </Card>
  );
}
