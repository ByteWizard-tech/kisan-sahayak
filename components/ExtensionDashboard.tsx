import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Users, AlertTriangle, Send } from 'lucide-react';
import { OfficerStat } from '../types';
import { Button } from './Button';

// Mock Data
const data: OfficerStat[] = [
  { region: 'North District', farmersActive: 120, alertCount: 5 },
  { region: 'East Valley', farmersActive: 85, alertCount: 12 },
  { region: 'South Plains', farmersActive: 200, alertCount: 2 },
  { region: 'West Hills', farmersActive: 150, alertCount: 8 },
];

export const ExtensionDashboard: React.FC = () => {
  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Extension Dashboard</h1>
          <p className="text-gray-500">Overview of district farming activities</p>
        </div>
        <Button variant="outline" className="text-sm">Download Report</Button>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Farmers</p>
            <p className="text-2xl font-bold">555</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-red-100 text-red-600 rounded-full">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500">High Risk Alerts</p>
            <p className="text-2xl font-bold">27</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-full">
            <Send className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Advisories Sent</p>
            <p className="text-2xl font-bold">1.2k</p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold mb-6">Regional Risk Monitor</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="region" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="alertCount" name="Active Alerts" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.alertCount > 8 ? '#ef4444' : '#22c55e'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-sm text-gray-500 mt-4 text-center">
          Regions with >8 alerts (Red) require immediate field visits.
        </p>
      </div>

      {/* Broadcast Action */}
      <div className="bg-amber-50 p-6 rounded-xl border border-amber-100">
        <h3 className="text-lg font-semibold text-amber-900 mb-2">Emergency Broadcast</h3>
        <p className="text-amber-700 mb-4">Send a mass SMS alert to all farmers in 'East Valley' regarding potential locust activity.</p>
        <div className="flex gap-2">
            <textarea className="w-full p-2 rounded border border-amber-200" rows={2} placeholder="Type alert message..."></textarea>
        </div>
        <div className="mt-2 text-right">
             <Button variant="danger">Send Alert</Button>
        </div>
      </div>
    </div>
  );
};