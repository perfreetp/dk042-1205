import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';

interface SystemPieChartProps {
  data: { name: string; value: number; color: string }[];
  height?: number;
}

export default function SystemPieChart({ data, height = 280 }: SystemPieChartProps) {
  const option: EChartsOption = useMemo(
    () => ({
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        borderColor: 'rgba(148, 163, 184, 0.2)',
        textStyle: {
          color: '#e2e8f0',
          fontSize: 12,
        },
        formatter: '{b}: {c} 个 ({d}%)',
      },
      legend: {
        orient: 'vertical',
        right: '5%',
        top: 'center',
        itemWidth: 10,
        itemHeight: 10,
        textStyle: {
          color: '#94a3b8',
          fontSize: 12,
        },
      },
      series: [
        {
          type: 'pie',
          radius: ['45%', '70%'],
          center: ['35%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 4,
            borderColor: '#0f172a',
            borderWidth: 2,
          },
          label: {
            show: false,
          },
          emphasis: {
            label: {
              show: false,
            },
            itemStyle: {
              shadowBlur: 20,
              shadowOffsetX: 0,
              shadowColor: 'rgba(6, 182, 212, 0.3)',
            },
          },
          labelLine: {
            show: false,
          },
          data: data.map((item) => ({
            name: item.name,
            value: item.value,
            itemStyle: { color: item.color },
          })),
        },
      ],
    }),
    [data]
  );

  return (
    <ReactECharts
      option={option}
      style={{ height }}
      opts={{ renderer: 'canvas' }}
    />
  );
}
