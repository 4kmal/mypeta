import { createContext, useContext, useState, useCallback, useMemo, useEffect, ReactNode } from 'react';
import type { DataCategory } from '@/types';
import { useDataFetching } from '@/hooks/useDataFetching';
import { mapStateName, getLatestData, filterAndSortByState } from '@/lib/helpers';
import { type ChartType } from '@/lib/constants';

interface DataContextType {
  // State
  activeState: string | null;
  selectedCategory: DataCategory;
  selectedChartType: ChartType;
  
  // Actions
  setActiveState: (state: string | null) => void;
  setSelectedCategory: (category: DataCategory) => void;
  setSelectedChartType: (type: ChartType) => void;
  
  // Computed data
  getStateData: (stateName: string, category: DataCategory) => any;
  chartData: {
    income: any[];
    population: any[];
    crime: any[];
    water: any[];
    expense: any[];
  };
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Map DataCategory to ChartType
const categoryToChartType = (category: DataCategory): ChartType => {
  const mapping: Record<DataCategory, ChartType> = {
    'income_median': 'income',
    'population': 'population',
    'crime': 'crime',
    'water_consumption': 'water',
    'expenditure': 'expense'
  };
  return mapping[category];
};

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [activeState, setActiveState] = useState<string | null>('selangor');
  const [selectedCategory, setSelectedCategory] = useState<DataCategory>('income_median');
  const [selectedChartType, setSelectedChartType] = useState<ChartType>('income');

  // Sync chartType with category whenever category changes
  useEffect(() => {
    const newChartType = categoryToChartType(selectedCategory);
    setSelectedChartType(newChartType);
  }, [selectedCategory]);

  const {
    incomeData,
    populationData,
    crimeData,
    waterConsumptionData,
    householdExpenseData
  } = useDataFetching();

  const getStateData = useCallback((stateName: string, category: DataCategory) => {
    const mappedName = mapStateName(stateName);

    switch (category) {
      case 'income_median':
        return getLatestData(incomeData, mappedName);
      case 'population':
        return getLatestData(populationData, mappedName);
      case 'crime':
        return getLatestData(crimeData, mappedName);
      case 'water_consumption':
        return getLatestData(waterConsumptionData, mappedName);
      case 'expenditure':
        return getLatestData(householdExpenseData, mappedName);
      default:
        return undefined;
    }
  }, [incomeData, populationData, crimeData, waterConsumptionData, householdExpenseData]);

  const chartData = useMemo(() => {
    if (!activeState) return {
      income: [],
      population: [],
      crime: [],
      water: [],
      expense: []
    };

    const mappedName = mapStateName(activeState);

    return {
      income: filterAndSortByState(incomeData, mappedName),
      population: filterAndSortByState(populationData, mappedName),
      crime: filterAndSortByState(crimeData, mappedName),
      water: filterAndSortByState(waterConsumptionData, mappedName),
      expense: filterAndSortByState(householdExpenseData, mappedName)
    };
  }, [activeState, incomeData, populationData, crimeData, waterConsumptionData, householdExpenseData]);

  const value = {
    activeState,
    selectedCategory,
    selectedChartType,
    setActiveState,
    setSelectedCategory,
    setSelectedChartType,
    getStateData,
    chartData
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

