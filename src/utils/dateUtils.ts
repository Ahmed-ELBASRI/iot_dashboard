import { format, formatDistanceStrict } from 'date-fns';

export const formatChartDate = (timestamp: string, period: string) => {
  const date = new Date(timestamp);
  return period === 'today' ? format(date, 'HH:mm') :
         period === 'week' ? format(date, 'MMM dd') :
         period === 'month' ? format(date, 'MMM dd') :
         period === 'year' ? format(date, 'MMM yyyy') :
         format(date, 'yyyy-MM-dd');
};

export const calculateDuration = (startDate?: string, endDate?: string): string => {
  if (!startDate) return '-';
  const end = endDate ? new Date(endDate) : new Date();
  return formatDistanceStrict(new Date(startDate), end);
};