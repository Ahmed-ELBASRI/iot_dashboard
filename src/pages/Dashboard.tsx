import React, { useEffect, useState } from 'react';
import { Thermometer, Droplets } from 'lucide-react';
import { sensorService } from '../services/api';
import { SensorChart } from '../components/SensorChart';

export const Dashboard = () => {
  const [currentData, setCurrentData] = useState({ temperature: 0, humidity: 0 });
  const [maxToday, setMaxToday] = useState({ temperature: 0, humidity: 0 });
  const [temperatureData, setTemperatureData] = useState([]);
  const [humidityData, setHumidityData] = useState([]);
  const [temperaturePeriod, setTemperaturePeriod] = useState('today');
  const [humidityPeriod, setHumidityPeriod] = useState('today');

  useEffect(() => {
    const fetchCurrentData = async () => {
      const data = await sensorService.getCurrentData();
      setCurrentData(data.current);
      setMaxToday(data.maxToday);
    };

    fetchCurrentData();
    const interval = setInterval(fetchCurrentData, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    handlePeriodChange('temperature', temperaturePeriod);
  }, [temperaturePeriod]);

  useEffect(() => {
    handlePeriodChange('humidity', humidityPeriod);
  }, [humidityPeriod]);

  const handlePeriodChange = async (type: 'temperature' | 'humidity', period: string) => {
    const data = await sensorService.getHistoricalData(type, period);
    if (type === 'temperature') {
      setTemperatureData(data);
    } else {
      setHumidityData(data);
    }
  };

  const handleCustomDateChange = async (
    type: 'temperature' | 'humidity',
    startDate: string,
    endDate: string
  ) => {
    const data = await sensorService.getHistoricalData(type, 'custom', startDate, endDate);
    if (type === 'temperature') {
      setTemperatureData(data);
      setTemperaturePeriod('custom');
    } else {
      setHumidityData(data);
      setHumidityPeriod('custom');
    }
  };

  return (
    <div className="p-6 ml-64">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Current Temperature</p>
              <p className="text-2xl font-bold">{currentData.temperature}°C</p>
            </div>
            <Thermometer className="text-red-500" size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Current Humidity</p>
              <p className="text-2xl font-bold">{currentData.humidity}%</p>
            </div>
            <Droplets className="text-blue-500" size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Max Temperature Today</p>
              <p className="text-2xl font-bold">{maxToday.temperature}°C</p>
            </div>
            <Thermometer className="text-red-500" size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Max Humidity Today</p>
              <p className="text-2xl font-bold">{maxToday.humidity}%</p>
            </div>
            <Droplets className="text-blue-500" size={24} />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <SensorChart
          data={temperatureData}
          type="temperature"
          period={temperaturePeriod}
          onPeriodChange={(period) => setTemperaturePeriod(period)}
          onCustomDateChange={(start, end) =>
            handleCustomDateChange('temperature', start, end)
          }
        />

        <SensorChart
          data={humidityData}
          type="humidity"
          period={humidityPeriod}
          onPeriodChange={(period) => setHumidityPeriod(period)}
          onCustomDateChange={(start, end) =>
            handleCustomDateChange('humidity', start, end)
          }
        />
      </div>
    </div>
  );
};