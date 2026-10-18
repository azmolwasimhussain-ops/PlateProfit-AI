'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { Navbar } from '@/components/layout/Navbar';
import { HomeView } from '@/components/home/HomeView';
import { DashboardView } from '@/components/dashboard/DashboardView';
import { ProfitLeakRadarView } from '@/components/radar/ProfitLeakRadarView';
import { WhatIfView } from '@/components/whatif/WhatIfView';
import { RecipesView } from '@/components/recipes/RecipesView';
import { InventoryView } from '@/components/inventory/InventoryView';
import { InvoiceReaderView } from '@/components/invoices/InvoiceReaderView';
import { ReportsView } from '@/components/reports/ReportsView';
import { SettingsView } from '@/components/settings/SettingsView';

export default function Home() {
  const { activeTab } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-[#080e1a] text-slate-100 selection:bg-emerald-500/30 selection:text-emerald-200">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {activeTab === 'home' && <HomeView />}
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'radar' && <ProfitLeakRadarView />}
        {activeTab === 'whatif' && <WhatIfView />}
        {activeTab === 'recipes' && <RecipesView />}
        {activeTab === 'inventory' && <InventoryView />}
        {activeTab === 'invoices' && <InvoiceReaderView />}
        {activeTab === 'reports' && <ReportsView />}
        {activeTab === 'settings' && <SettingsView />}
      </main>

      <footer className="border-t border-[#15223c] bg-[#070d17] py-6 px-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">PlateProfit AI</span>
            <span>&bull;</span>
            <span>Local-First Profit Intelligence for Food Creators</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-500">
            <span>Zero Remote Telemetry</span>
            <span>&bull;</span>
            <span>Deterministic Math Engine</span>
            <span>&bull;</span>
            <span>Ollama Open-Weight LLMs</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
