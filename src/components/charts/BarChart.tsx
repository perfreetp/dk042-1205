import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';

interface BarChartProps {
  data: { name: string; value: number }[];
  height?: number;
  color?: string;
}

export default function BarChart({ data, height = 240, color = '#06b6d4' }: BarChartProps) {
  const option: EChartsOption = useMemo(
    () => ({
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        borderColor: 'rgba(148, 163, 184, 0.2)',
        textStyle: {
          color: '#e2e8f0',
          fontSize: 12,
        },
        axisPointer: {
          type: 'shadow',
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '10%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: data.map((d) => d.name),
        axisLine: {
          lineStyle: { color: 'rgba(148, 163, 184, 0.2)' },
        },
        axisLabel: {
          color: '#64748b',
          fontSize: 11,
          rotate: data.length > 6 ? 30 : 0,
        },
        axisTick: { show: false },
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: '#64748b',
          fontSize: 11,
        },
        splitLine: {
          lineStyle: { color: 'rgba(148, 163, 184, 0.1)' },
        },
      },
      series: [
        {
          type: 'bar',
          data: data.map((d) => d.value),
          barWidth: '50%',
          itemStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: color },
                { offset: 1, color: color + '33' },
              ],
            },
            borderRadius: [4, 4, 0, 0],
          },
          emphasis: {
            itemStyle: {
              color: color,
              shadowBlur: 10,
              shadowColor: color + '40',
            },
          },
        },
      ],
    }),
    [data, color]
  );

  return (
    <ReactECharts
      option={option}
      style={{ height }}
      opts={{ renderer: 'canvas' }}
    />
  );
}
