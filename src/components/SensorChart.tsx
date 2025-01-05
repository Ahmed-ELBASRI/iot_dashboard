import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatChartDate } from '../utils/dateUtils';

interface SensorChartProps {
  data: Array<{ timestamp: string; value: number; min?: number; max?: number }>;
  type: 'temperature' | 'humidity';
  period: string;
  onPeriodChange: (period: string) => void;
  onCustomDateChange: (startDate: string, endDate: string) => void;
}

export const SensorChart: React.FC<SensorChartProps> = ({
  data,
  type,
  period,
  onPeriodChange,
  onCustomDateChange,
}) => {
  const [showCustomDate, setShowCustomDate] = React.useState(false);
  const [startDate, setStartDate] = React.useState('');
  const [endDate, setEndDate] = React.useState('');

  const unit = type === 'temperature' ? '°C' : '%';
  const color = type === 'temperature' ? '#ef4444' : '#3b82f6';

  const renderCustomizedLegend = (props: any) => {
    const { payload } = props;
    return (
      <div className="flex gap-6 justify-center mt-2">
        {payload.map((entry: any, index: number) => (
          <div key={`item-${index}`} className="flex items-center gap-2">
            <svg width="32" height="2" className="mt-1">
              {entry.value.includes('Max') ? (
                <line
                  x1="0"
                  y1="1"
                  x2="32"
                  y2="1"
                  stroke={entry.color}
                  strokeWidth="2"
                  strokeDasharray="6,3"
                />
              ) : entry.value.includes('Min') ? (
                <line
                  x1="0"
                  y1="1"
                  x2="32"
                  y2="1"
                  stroke={entry.color}
                  strokeWidth="2"
                  strokeDasharray="2,2"
                />
              ) : (
                <line
                  x1="0"
                  y1="1"
                  x2="32"
                  y2="1"
                  stroke={entry.color}
                  strokeWidth="2"
                />
              )}
            </svg>
            <span className="text-sm">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-lg rounded-lg">
          <p className="text-sm text-gray-600 mb-2">{formatChartDate(label, period)}</p>
          {payload.map((item: any, index: number) => {
            const name = period === 'today' ? `Current ${type}` :
                        item.dataKey === 'value' ? `Average ${type}` :
                        item.dataKey === 'min' ? `Min ${type}` :
                        `Max ${type}`;
            return (
              <p key={index} className="text-sm" style={{ color: item.color }}>
                {`${name}: ${item.value}${unit}`}
              </p>
            );
          })}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <div className="mb-4 flex items-center gap-4">
        <select
          className="rounded-md border-gray-300 shadow-sm"
          value={period}
          onChange={(e) => {
            if (e.target.value === 'custom') {
              setShowCustomDate(true);
            } else {
              setShowCustomDate(false);
              onPeriodChange(e.target.value);
            }
          }}
        >
          <option value="today">Today</option>
          <option value="week">Last Week</option>
          <option value="month">Last Month</option>
          <option value="year">Last Year</option>
          <option value="custom">Custom Date</option>
        </select>

        {showCustomDate && (
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm"
            />
            <span>to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm"
            />
            <button
              onClick={() => onCustomDateChange(startDate, endDate)}
              className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600"
            >
              Apply
            </button>
          </div>
        )}
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="timestamp"
              tickFormatter={(value) => formatChartDate(value, period)}
            />
            <YAxis
              unit={unit}
              domain={['auto', 'auto']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend content={renderCustomizedLegend} />
            {period == 'today' && (
              <>
                <Line
                  type="monotone"
                  dataKey="value"
                  name={`Current ${type}`}
                  stroke={color}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </>
            )}

            {period !== 'today' && (
              <>
                <Line
                  type="monotone"
                  dataKey="value"
                  name={`Average ${type}`}
                  stroke={color}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="min"
                  name={`Min ${type}`}
                  stroke={color}
                  strokeDasharray="2,2"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="max"
                  name={`Max ${type}`}
                  stroke={color}
                  strokeDasharray="6,3"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </>
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};