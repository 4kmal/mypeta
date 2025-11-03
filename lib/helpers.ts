import type { DataCategory } from '@/types';
import { STATE_MAPPING, MAX_CHART_POINTS } from './constants';

export const mapStateName = (stateName: string): string => {
  return STATE_MAPPING[stateName] || stateName;
};

export const formatValue = (value: number, category: DataCategory, language: 'en' | 'ms' = 'en'): string => {
  const casesText = language === 'en' ? 'cases' : 'kes';
  
  switch (category) {
    case 'income_median':
    case 'expenditure':
      return new Intl.NumberFormat('en-MY', {
        style: 'currency',
        currency: 'MYR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value);
    case 'population':
      return new Intl.NumberFormat('en-MY').format(value);
    case 'crime':
      return new Intl.NumberFormat('en-MY').format(value) + ` ${casesText}`;
    case 'water_consumption':
      return new Intl.NumberFormat('en-MY').format(value) + ' L';
    default:
      return value.toString();
  }
};

export const getCategoryLabel = (category: DataCategory, language: 'en' | 'ms' = 'en'): string => {
  const labels: Record<DataCategory, { en: string; ms: string }> = {
    income_median: { en: 'Median Household Income', ms: 'Pendapatan Isi Rumah Median' },
    population: { en: 'Population', ms: 'Populasi' },
    crime: { en: 'Crime Cases', ms: 'Kes Jenayah' },
    water_consumption: { en: 'Water Consumption', ms: 'Penggunaan Air' },
    expenditure: { en: 'Mean Household Expenditure', ms: 'Perbelanjaan Isi Rumah Purata' }
  };
  return labels[category]?.[language] || '';
};

export const getDataValue = (data: any, category: DataCategory): number => {
  if (!data) return 0;
  const valueMap: Record<DataCategory, string> = {
    income_median: 'income_median',
    population: 'population',
    crime: 'crime',
    water_consumption: 'consumption',
    expenditure: 'expenditure_mean'
  };
  return data[valueMap[category]] || 0;
};

export const getLatestData = <T extends { state: string; date: string }>(
  data: T[],
  stateName: string
): T | undefined => {
  return data
    .filter(d => d.state === stateName)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
};

export const limitDataPoints = <T,>(data: T[], maxPoints: number = MAX_CHART_POINTS): T[] => {
  if (data.length <= maxPoints) return data;
  const step = Math.ceil(data.length / maxPoints);
  return data.filter((_, index) => index % step === 0).slice(-maxPoints);
};

export const filterAndSortByState = <T extends { state: string; date: string }>(
  data: T[],
  stateName: string
): T[] => {
  return limitDataPoints(
    data
      .filter(d => d.state === stateName)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  );
};

