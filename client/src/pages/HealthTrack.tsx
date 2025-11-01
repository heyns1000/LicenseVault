import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Activity, Stethoscope, Brain, Pill, TrendingUp } from "lucide-react";
import { Link } from "wouter";

export default function HealthTrack() {
  const { data: healthBrands, isLoading: brandsLoading } = useQuery({
    queryKey: ['/api/healthtrack/brands'],
  });

  const { data: metricsData, isLoading: metricsLoading } = useQuery({
    queryKey: ['/api/healthtrack/metrics'],
  });

  const coreBrands = healthBrands?.brands?.filter((b: any) => b.is_core) || [];
  const subnodes = healthBrands?.brands?.filter((b: any) => !b.is_core) || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Heart className="w-8 h-8 text-red-500" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white" data-testid="heading-healthtrack">
              HealthTrack™
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400" data-testid="text-subtitle">
            HSOMNI Health & Hygiene Sector Integration | 465 Brands Connected
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
            Legacy Integration: Pre-1984 Architecture | VaultMesh™ Enabled
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-white dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">CORE Brands</p>
                <p className="text-3xl font-bold text-blue-600" data-testid="metric-core-brands">
                  {brandsLoading ? "..." : coreBrands.length}
                </p>
              </div>
              <Brain className="w-12 h-12 text-blue-500 opacity-20" />
            </div>
          </Card>

          <Card className="p-6 bg-white dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Subnodes</p>
                <p className="text-3xl font-bold text-green-600" data-testid="metric-subnodes">
                  {brandsLoading ? "..." : subnodes.length}
                </p>
              </div>
              <Activity className="w-12 h-12 text-green-500 opacity-20" />
            </div>
          </Card>

          <Card className="p-6 bg-white dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Health Records</p>
                <p className="text-3xl font-bold text-purple-600" data-testid="metric-records">
                  {metricsLoading ? "..." : metricsData?.metrics?.length || 0}
                </p>
              </div>
              <Stethoscope className="w-12 h-12 text-purple-500 opacity-20" />
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="p-6 bg-white dark:bg-gray-800">
            <div className="flex items-center gap-2 mb-4">
              <Pill className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                CORE Health Brands
              </h2>
            </div>
            
            {brandsLoading ? (
              <div className="text-gray-500">Loading brands...</div>
            ) : (
              <div className="max-h-96 overflow-y-auto space-y-2">
                {coreBrands.slice(0, 30).map((brand: any, idx: number) => (
                  <div 
                    key={brand.id} 
                    className="p-3 bg-blue-50 dark:bg-gray-700 rounded-lg hover:bg-blue-100 dark:hover:bg-gray-600 transition-colors"
                    data-testid={`brand-core-${idx}`}
                  >
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {brand.name}™
                    </p>
                    {brand.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {brand.description}
                      </p>
                    )}
                  </div>
                ))}
                {coreBrands.length > 30 && (
                  <p className="text-sm text-gray-500 text-center pt-2">
                    + {coreBrands.length - 30} more CORE brands
                  </p>
                )}
              </div>
            )}
          </Card>

          <Card className="p-6 bg-white dark:bg-gray-800">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-6 h-6 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Your Health Metrics
              </h2>
            </div>
            
            {metricsLoading ? (
              <div className="text-gray-500">Loading metrics...</div>
            ) : metricsData?.metrics?.length > 0 ? (
              <div className="space-y-3">
                {metricsData.metrics.slice(0, 10).map((metric: any, idx: number) => (
                  <div 
                    key={metric.id}
                    className="p-3 border-l-4 border-green-500 bg-green-50 dark:bg-gray-700"
                    data-testid={`metric-${idx}`}
                  >
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {metric.metric_type}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Value: {metric.value} {metric.unit}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(metric.recorded_at).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  No health metrics recorded yet
                </p>
                <Button data-testid="button-add-metric">
                  Add Your First Metric
                </Button>
              </div>
            )}
          </Card>
        </div>

        <div className="mt-8 text-center">
          <Link href="/dashboard">
            <Button variant="outline" data-testid="button-back-dashboard">
              ← Back to Dashboard
            </Button>
          </Link>
        </div>

        <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>VaultMesh™ Integration:</strong> This module connects to the HSOMNI Health & Hygiene sector 
            with 465 verified brands (93 CORE + 372 specialized subnodes). All health data syncs through 
            FruitfulPlanetChange repository architecture.
          </p>
        </div>
      </div>
    </div>
  );
}
