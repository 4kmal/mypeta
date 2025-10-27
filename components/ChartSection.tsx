import DataChart from './DataChart';
import { CHART_CONFIGS, type ChartType } from '@/lib/constants';
import { states } from '@/data/states';

interface ChartSectionProps {
  selectedState: string;
  selectedChartType: ChartType;
  chartData: {
    income: any[];
    population: any[];
    crime: any[];
    water: any[];
    expense: any[];
  };
}

const ChartSection = ({
  selectedState,
  selectedChartType,
  chartData
}: ChartSectionProps) => {
  const config = CHART_CONFIGS[selectedChartType];
  const selectedStateData = states.find(state => state.id === selectedState);
  const stateName = selectedStateData?.name || selectedState;
  
  const dataMap = {
    income: chartData.income,
    population: chartData.population,
    crime: chartData.crime,
    water: chartData.water,
    expense: chartData.expense
  };

  return (
    <div className="mt-4 bg-white dark:bg-zinc-800 rounded-3xl shadow-lg p-8">
      {/* Single Chart Display */}
      <div className="max-w-4xl mx-auto">
        <DataChart
          data={dataMap[selectedChartType]}
          dataKey={config.dataKey}
          color={config.color}
          title={config.title}
          description={`${config.title} trend for ${stateName}`}
        />
      </div>
    </div>
  );
};

export default ChartSection;

