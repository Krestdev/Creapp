import { ChartDataItem, ChartPieDonut } from '@/components/Charts/chart-pie-donut';
import { getRandomColor, XAF } from '@/lib/utils';
import { BonsCommande } from '@/types/types'
import React from 'react'
interface Props {
    data: Array<BonsCommande>;
}

function PieProviderPurchase({data}:Props) {
    const providerMap = new Map<
    number,
    { label: string; value: number; count: number }
  >();
  data
    .filter((x) => x.status === "APPROVED")
    .forEach((order) => {
      const total = order.devi.element
        .filter((o) => o.status === "SELECTED")
        .reduce((t, e) => t + e.priceProposed * e.quantity, 0);
      const existing = providerMap.get(order.provider.id);

      if (existing) {
        existing.value += total;
        existing.count += 1;
      } else {
        providerMap.set(order.provider.id, {
          label: order.provider.name,
          value: total,
          count: 1,
        });
      }
    });
  const providerPieData: Array<ChartDataItem> = Array.from(
    providerMap.entries()
  ).map(([id, data], index) => ({
    id: id,
    value: data.value,
    label: data.count > 1 ? `${data.label} (${data.count})` : data.label,
    color: getRandomColor(index),
    name: `provider_${id}`,
  }));

  return (
    <ChartPieDonut
              data={providerPieData}
              tooltipConfig={{
                valueFormatter: (value) => XAF.format(value),
              }}
            />
  )
}

export default PieProviderPurchase