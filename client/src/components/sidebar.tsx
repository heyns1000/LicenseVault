import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  onFiltersChange: (filters: {
    tier: string[];
    division: string[];
    search: string;
  }) => void;
  filters: {
    tier: string[];
    division: string[];
    search: string;
  };
}

export default function Sidebar({ onFiltersChange, filters }: SidebarProps) {
  const [activeTab, setActiveTab] = useState<'catalog' | 'analytics'>('catalog');

  const tiers = [
    { id: 'sovereign', label: 'Sovereign', count: 127, color: 'bg-yellow-500' },
    { id: 'dynastic', label: 'Dynastic', count: 892, color: 'bg-gray-500' },
    { id: 'operational', label: 'Operational', count: 2467, color: 'bg-blue-500' },
    { id: 'market', label: 'Market', count: 1157, color: 'bg-green-500' },
  ];

  const divisions = [
    { id: 'A', label: 'Division A - North America', count: 905 },
    { id: 'B', label: 'Division B - Europe', count: 1029 },
    { id: 'C', label: 'Division C - Asia-Pacific', count: 1474 },
    { id: 'D', label: 'Division D - MENA', count: 383 },
    { id: 'E', label: 'Division E - Sub-Saharan', count: 238 },
    { id: 'F', label: 'Division F - LATAM', count: 430 },
    { id: 'G', label: 'Division G - Interstellar', count: 134 },
  ];

  const handleTierChange = (tierId: string, checked: boolean) => {
    const newTiers = checked 
      ? [...filters.tier, tierId]
      : filters.tier.filter(t => t !== tierId);
    
    onFiltersChange({
      ...filters,
      tier: newTiers,
    });
  };

  const handleDivisionChange = (divisionId: string, checked: boolean) => {
    const newDivisions = checked 
      ? [...filters.division, divisionId]
      : filters.division.filter(d => d !== divisionId);
    
    onFiltersChange({
      ...filters,
      division: newDivisions,
    });
  };

  const handleSearchChange = (search: string) => {
    onFiltersChange({
      ...filters,
      search,
    });
  };

  return (
    <aside className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
      <div className="p-6">
        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
          <button 
            className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'catalog' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-blue-600'
            }`}
            onClick={() => setActiveTab('catalog')}
          >
            <i className="fas fa-th-large mr-2"></i>Catalog
          </button>
          <button 
            className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'analytics' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-blue-600'
            }`}
            onClick={() => setActiveTab('analytics')}
          >
            <i className="fas fa-chart-line mr-2"></i>Analytics
          </button>
        </div>

        {activeTab === 'catalog' && (
          <>
            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search brands..."
                  value={filters.search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10"
                />
                <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              </div>
            </div>

            {/* Tier Filters */}
            <div className="mb-6">
              <h3 className="font-medium text-gray-900 mb-3">Brand Tiers</h3>
              <div className="space-y-2">
                {tiers.map((tier) => (
                  <label key={tier.id} className="flex items-center">
                    <Checkbox
                      checked={filters.tier.includes(tier.id)}
                      onCheckedChange={(checked) => handleTierChange(tier.id, checked as boolean)}
                    />
                    <div className="ml-3 flex items-center">
                      <div className={`w-3 h-3 ${tier.color} rounded-full mr-2`}></div>
                      <span className="text-sm">{tier.label} ({tier.count})</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Geographic Divisions */}
            <div className="mb-6">
              <h3 className="font-medium text-gray-900 mb-3">Geographic Divisions</h3>
              <div className="space-y-2 text-sm">
                {divisions.map((division) => (
                  <label key={division.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Checkbox
                        checked={filters.division.includes(division.id)}
                        onCheckedChange={(checked) => handleDivisionChange(division.id, checked as boolean)}
                      />
                      <span className="ml-2">{division.label}</span>
                    </div>
                    <span className="text-gray-500">{division.count}</span>
                  </label>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Revenue Analytics</h3>
              <div className="space-y-2 text-sm">
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  <i className="fas fa-chart-line mr-2"></i>
                  Revenue Trends
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  <i className="fas fa-pie-chart mr-2"></i>
                  Tier Distribution
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  <i className="fas fa-globe mr-2"></i>
                  Geographic Performance
                </Button>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-3">License Analytics</h3>
              <div className="space-y-2 text-sm">
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  <i className="fas fa-certificate mr-2"></i>
                  Active Licenses
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  <i className="fas fa-clock mr-2"></i>
                  Renewal Pipeline
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  <i className="fas fa-users mr-2"></i>
                  Client Performance
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Systems Integration */}
        <div>
          <h3 className="font-medium text-gray-900 mb-3">FAA™ Systems</h3>
          <div className="space-y-2 text-sm">
            {[
              'ClaimRoot™',
              'VaultPay™', 
              'GhostTrace™',
              'PulseTrade™'
            ].map((system) => (
              <div key={system} className="flex items-center justify-between py-1">
                <span className="text-gray-600">{system}</span>
                <span className="text-green-600 text-xs">●</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
