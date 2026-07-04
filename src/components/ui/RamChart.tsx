import React from 'react';
import { Card } from './Card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Legend,
} from 'recharts';
import { Workload, WorkloadMemoryBreakdown, getWorkloadLabel } from '../../types';
import { estimateWorkload } from '../../lib/estimation';

const COLORS = ['#3B82F6', '#06B6D4', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444'];

interface RamChartProps {
  workloads: Workload[];
  breakdowns: WorkloadMemoryBreakdown[];
  totalRAM: number;
}

export const RamChart: React.FC<RamChartProps> = ({ workloads, breakdowns, totalRAM }) => {
  const barData = workloads.map((w, idx) => ({
    name: getWorkloadLabel(w.type),
    totalRAM: breakdowns[idx]?.total || 0,
    baseModelRAM: breakdowns[idx]?.baseModelRAM || 0,
  }));

  const pieData = workloads.map((w, idx) => ({
    name: getWorkloadLabel(w.type),
    value: breakdowns[idx]?.total || 0,
  }));

  const radarData = workloads.map((w, idx) => {
    const b = breakdowns[idx] || { baseModelRAM: 0, activationRAM: 0, optimizerRAM: 0, gradientRAM: 0, dataRAM: 0, overhead: 0, total: 0 };
    return {
      subject: getWorkloadLabel(w.type),
      A: b.baseModelRAM,
      B: b.activationRAM,
      C: b.optimizerRAM,
      D: b.gradientRAM,
      E: b.dataRAM,
      F: b.overhead,
      fullMark: b.total,
    };
  });

  if (workloads.length === 0) return null;

  const tooltipStyle = {
    backgroundColor: '#141922',
    border: '1px solid #1C2333',
    borderRadius: '0.5rem',
    color: '#fff',
  };

  return (
    <Card>
      <h3 className="text-lg font-display font-semibold text-white mb-4">
        RAM Allocation Breakdown
      </h3>

      {/* Stacked Bar Chart */}
      <div className="h-64 mb-8">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={barData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1C2333" />
            <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} />
            <YAxis stroke="#94A3B8" fontSize={12} label={{ value: 'RAM (GB)', angle: -90, position: 'insideLeft' }} />
            <Tooltip contentStyle={tooltipStyle} formatter={(value: number, name: string) => [`${value.toFixed(1)} GB`, name === 'totalRAM' ? 'Total' : 'Base Model']} />
            <Bar dataKey="totalRAM" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Total RAM" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pie Chart */}
      <div className="h-64 mb-8">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
              {pieData.map((_, idx) => (
                <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Radar Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radarData}>
            <PolarGrid stroke="#1C2333" />
            <PolarAngleAxis dataKey="subject" stroke="#94A3B8" fontSize={12} />
            <PolarRadiusAxis angle={30} stroke="#94A3B8" fontSize={12} />
            <Radar name="Model RAM" dataKey="A" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
            <Radar name="Activation" dataKey="B" stroke="#06B6D4" fill="#06B6D4" fillOpacity={0.4} />
            <Radar name="Optimizer" dataKey="C" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.4} />
            <Radar name="Gradients" dataKey="D" stroke="#10B981" fill="#10B981" fillOpacity={0.4} />
            <Radar name="Data" dataKey="E" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.4} />
            <Radar name="Overhead" dataKey="F" stroke="#EF4444" fill="#EF4444" fillOpacity={0.4} />
            <Legend />
            <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`${value.toFixed(1)} GB`]} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};