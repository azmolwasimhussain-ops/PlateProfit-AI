'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { NavigationTab } from '@/types';
import {
  Home as HomeIcon,
  LayoutDashboard,
  Radar,
  Calculator,
  UtensilsCrossed,
  Package,
  FileScan,
  FileText,
  Settings,
  ShieldCheck,
  Cpu,
  AlertCircle,
} from 'lucide-react';

export function Navbar() {
  const { isDemoMode, toggleDemoMode, activeTab, setActiveTab, ollamaConfig, profitLeaks, dataQualityWarnings } =
    useApp();

  interface NavItem {
    id: NavigationTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
    badgeColor?: string;
  }

  const navItems: NavItem[] = [
    { id: 'home', label: 'Home', icon: HomeIcon },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    {
      id: 'radar',
      label: 'Profit Leak Radar',
      icon: Radar,
      badge: profitLeaks.length > 0 ? profitLeaks.length : undefined,
      badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    },
    { id: 'whatif', label: 'What-If Sandbox', icon: Calculator },
    { id: 'recipes', label: 'Recipe Costing', icon: UtensilsCrossed },
    { id: 'inventory', label: 'Ingredients', icon: Package },
    { id: 'invoices', label: 'Invoice OCR', icon: FileScan },
    { id: 'reports', label: 'Reports & Sales', icon: FileText },
    { id: 'settings', label: 'Settings & AI', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-[#1e3256] bg-[#0b1324]/95 backdrop-blur-md">
      {/* Top utility strip */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 text-xs border-b border-[#15223c]/60">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-medium text-slate-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Local-First Architecture
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400 hidden sm:inline-flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            100% Private: Invoices & Recipes never leave this machine
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Ollama Status Pill */}
          <button
            onClick={() => setActiveTab('settings')}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#15223c] border border-[#1e3256] hover:border-slate-500 transition text-slate-300"
            title="Configure local Ollama in Settings"
          >
            <Cpu className="h-3 w-3 text-cyan-400" />
            <span className="font-mono text-[11px]">
              Ollama:{' '}
              {ollamaConfig.status === 'connected' ? (
                <span className="text-emerald-400 font-semibold">Active ({ollamaConfig.selectedModel})</span>
              ) : ollamaConfig.status === 'checking' ? (
                <span className="text-amber-400">Testing...</span>
              ) : (
                <span className="text-slate-400">Rules Engine (Offline)</span>
              )}
            </span>
          </button>

          {/* Demo Mode Toggle */}
          <div className="flex items-center gap-2 bg-[#15223c] px-2.5 py-1 rounded-full border border-[#1e3256]">
            <span className="text-slate-400 text-[11px] font-medium hidden md:inline">Mode:</span>
            <button
              onClick={toggleDemoMode}
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full transition-all flex items-center gap-1.5 ${
                isDemoMode
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}
            >
              {isDemoMode ? (
                <>
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  DEMO (Artisan Bakery)
                </>
              ) : (
                <>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  LIVE DATA
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main navigation bar */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <button
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-3 text-left group transition cursor-pointer hover:opacity-90"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <UtensilsCrossed className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-white group-hover:text-emerald-300 transition-colors">PlateProfit AI</span>
              <span className="rounded bg-emerald-950/80 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/30">
                v1.0 Local
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">Profit Intelligence for Kitchens & Cafes</p>
          </div>
        </button>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#15223c]/60'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span
                    className={`ml-0.5 rounded-full px-1.5 py-0.2 text-[10px] font-bold border ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Global Data Quality Warning bar if any alerts exist */}
      {dataQualityWarnings.length > 0 && activeTab === 'dashboard' && (
        <div className="bg-amber-950/40 border-t border-amber-900/50 px-4 py-1.5 text-xs text-amber-200 flex items-center justify-between">
          <div className="flex items-center gap-2 mx-auto max-w-7xl w-full">
            <AlertCircle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
            <span className="font-semibold text-amber-400">Data Quality Alert:</span>
            <span className="truncate">{dataQualityWarnings[0]}</span>
            {dataQualityWarnings.length > 1 && (
              <span className="text-amber-300/80">({dataQualityWarnings.length - 1} more)</span>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
