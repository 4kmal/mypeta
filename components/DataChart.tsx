import { memo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

interface DataChartProps {
  data: any[];
  dataKey: string;
  color: string;
  title: string;
  description: string;
}

const DataChart = memo(({ data, dataKey, color, title, description }: DataChartProps) => (
  <Card className='bg-white dark:bg-[#111114]'>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent>
      <ChartContainer config={{
        [dataKey]: {
          label: title,
          color: color,
        },
      }} className="h-[300px] w-full">
        <BarChart data={data} accessibilityLayer>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="date"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            tickFormatter={(value) => {
              const date = new Date(value);
              return date.getFullYear().toString();
            }}
          />
          <YAxis />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar
            dataKey={dataKey}
            fill={`var(--color-${dataKey})`}
            radius={4}
          />
        </BarChart>
      </ChartContainer>
    </CardContent>
  </Card>
));

DataChart.displayName = 'DataChart';

export default DataChart;

