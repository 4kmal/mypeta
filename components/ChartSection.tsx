import DataChart from './DataChart';
import { CHART_CONFIGS, type ChartType } from '@/lib/constants';
import { states } from '@/data/states';
import { useLanguage } from '@/contexts/LanguageContext';
import { getCategoryLabel } from '@/lib/helpers';

interface ChartSectionProps {
  selectedState: string;
  selectedChartType: ChartType;
  activeColor?: string;
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
  activeColor,
  chartData
}: ChartSectionProps) => {
  const config = CHART_CONFIGS[selectedChartType];
  const selectedStateData = states.find(state => state.id === selectedState);
  const stateName = selectedStateData?.name || selectedState;
  const chartColor = activeColor || config.color;
  const { language } = useLanguage();
  
  const dataMap = {
    income: chartData.income,
    population: chartData.population,
    crime: chartData.crime,
    water: chartData.water,
    expense: chartData.expense
  };

  // Get translated title from config
  const translatedTitle = getCategoryLabel(
    config.dataKey === 'income_median' ? 'income_median' :
    config.dataKey === 'population' ? 'population' :
    config.dataKey === 'crime' ? 'crime' :
    config.dataKey === 'consumption' ? 'water_consumption' :
    'expenditure',
    language
  );

  const trendText = language === 'en' ? 'trend for' : 'trend untuk';
  const description = `${translatedTitle} ${trendText} ${stateName}`;

  return (
    <div className="mt-4 bg-white dark:bg-zinc-900 rounded-3xl shadow-lg p-8">
      {/* Single Chart Display */}
      <div className="max-w-4xl mx-auto">
        <DataChart
          data={dataMap[selectedChartType]}
          dataKey={config.dataKey}
          color={chartColor}
          title={translatedTitle}
          description={description}
        />
      </div>
    </div>
  );
};

export default ChartSection;

