"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { ChartBar } from "./bar-chart"

interface BarChartTypeProps {
    requestTypeDistributionData: {
        period: string;
        value: number;
    }[];
}

const BarChartType = ({ requestTypeDistributionData }: BarChartTypeProps) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Types de besoins soumis</CardTitle>
                <CardDescription>Répartition par type de besoin (Nombre soumis)</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
                {requestTypeDistributionData.length > 0 ? (
                    <ChartBar
                        data={requestTypeDistributionData}
                        series={[
                            {
                                key: "value",
                                label: " Besoins soumis",
                                color: "var(--primary)",
                                radius: [4, 4, 0, 0],
                            },
                        ]}
                        xAxisKey="period"
                        showGrid={true}
                        showYAxis={true}
                        yAxisFormatter={(value) => value.toLocaleString("fr-FR")}
                        tooltipConfig={{
                            nameFormatter: (name, payload) => ` ${payload?.period}` || " Besoins soumis"
                        }}
                        hideTrend={true}
                        height={250}
                        className="h-[250px] w-full [&>div]:aspect-auto first-letter:uppercase lowercase"
                    />
                ) : (
                    <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                        Aucune donnée disponible
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

export default BarChartType