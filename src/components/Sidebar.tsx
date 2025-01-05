import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, AlertTriangle, Users, LogOut } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { accidentService } from '../services/api';

export const Sidebar = () => {
  const { user, logout } = useAuthStore();
  const [hasActiveAccident, setHasActiveAccident] = useState(false);

  useEffect(() => {
    const checkAccidents = async () => {
      const accidents = await accidentService.getAccidents();
      setHasActiveAccident(accidents.some(accident => accident.status === 'up'));
    };

    checkAccidents();
    const interval = setInterval(checkAccidents, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-screen w-64 bg-gray-900 text-white p-4 fixed left-0 top-0">
      <div className="mb-8">
        <h1 className="text-xl font-bold">IoT Dashboard</h1>
      </div>
      
      <nav className="space-y-2">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `flex items-center space-x-2 p-2 rounded-lg ${
              isActive ? 'bg-gray-800' : 'hover:bg-gray-800'
            }`
          }
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/accidents"
          className={({ isActive }) =>
            `flex items-center space-x-2 p-2 rounded-lg ${
              isActive ? 'bg-gray-800' : 'hover:bg-gray-800'
            } ${hasActiveAccident ? 'animate-burning' : ''}`
          }
        >
          <AlertTriangle size={20} className={hasActiveAccident ? 'text-red-500' : ''} />
          <span className={hasActiveAccident ? 'font-bold text-red-500' : ''}>
            Accidents
            {hasActiveAccident && (
              <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full animate-pulse">
                !
              </span>
            )}
          </span>
        </NavLink>

        {user?.role === 'admin' && (
          <NavLink
            to="/users"
            className={({ isActive }) =>
              `flex items-center space-x-2 p-2 rounded-lg ${
                isActive ? 'bg-gray-800' : 'hover:bg-gray-800'
              }`
            }
          >
            <Users size={20} />
            <span>User Management</span>
          </NavLink>
        )}
      </nav>

      <button
        onClick={logout}
        className="absolute bottom-4 left-4 flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-800 w-[calc(100%-2rem)]"
      >
        <LogOut size={20} />
        <span>Logout</span>
      </button>
    </div>
  );
};