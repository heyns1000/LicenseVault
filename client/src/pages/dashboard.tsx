import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Header from "@/components/header";
import Sidebar from "@/components/sidebar";
import BrandCard from "@/components/brand-card";
import LicensingCalculator from "@/components/licensing-calculator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [showLicenseCalculator, setShowLicenseCalculator] = useState(false);
  const [brandFilters, setBrandFilters] = useState({
    tier: [] as string[],
    division: [] as string[],
    search: "",
  });

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, authLoading, toast]);

  const { data: metrics, isLoading: metricsLoading } = useQuery<{
    totalRevenue: string;
    activeLicenses: number;
    newBrands72h: number;
    complianceRate: string;
    tierDistribution: Record<string, number>;
    revenueHistory: Array<{ date: string; revenue: number }>;
  }>({
    queryKey: ["/api/dashboard/metrics"],
    retry: false,
    enabled: isAuthenticated,
  });

  // Construct query URL with filters
  const buildBrandsQuery = () => {
    const params = new URLSearchParams();
    if (brandFilters.tier?.length) params.append('tier', JSON.stringify(brandFilters.tier));
    if (brandFilters.division?.length) params.append('division', JSON.stringify(brandFilters.division));  
    if (brandFilters.search) params.append('search', brandFilters.search);
    params.append('limit', '50');
    params.append('offset', '0');
    return `/api/brands?${params.toString()}`;
  };

  const { data: brandsData, isLoading: brandsLoading, error: brandsError } = useQuery<{
    brands: Array<{
      id: string;
      name: string;
      displayName: string;
      tier: string;
      description: string;
      category: string;
      geographicDivision: string;
      licenseFeeECR: string;
      licenseFeeUSD: string;
      royaltyRate: string;
      isActive: boolean;
      faaSystemsIntegration: string[];
      iconClass: string;
      metadata: any;
      createdAt: string;
      updatedAt: string;
    }>;
    total: number;
  }>({
    queryKey: ["brands", brandFilters],
    queryFn: () => fetch(buildBrandsQuery()).then(res => res.json()),
    retry: false,
    enabled: isAuthenticated,
  });

  const { data: waterTheSeedStatus } = useQuery<{
    isActive: boolean;
    newBrands72h: number;
    totalBrands: number;
    targetBrands: number;
    progress: number;
    nextSeedwave: string;
    eta: string;
  }>({
    queryKey: ["/api/water-the-seed/status"],
    retry: false,
    enabled: isAuthenticated,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        user={user} 
        waterTheSeedStatus={waterTheSeedStatus}
        onLicenseCalculator={() => setShowLicenseCalculator(true)}
      />
      
      <div className="flex">
        <Sidebar 
          onFiltersChange={setBrandFilters}
          filters={brandFilters}
        />
        
        <main className="flex-1 p-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {metricsLoading ? (
              Array(4).fill(0).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="h-4 w-20 mb-2" />
                    <Skeleton className="h-8 w-32 mb-2" />
                    <Skeleton className="h-4 w-24" />
                  </CardContent>
                </Card>
              ))
            ) : (
              <>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total Revenue</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {metrics?.totalRevenue || "0M ECR"}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <i className="fas fa-dollar-sign text-blue-600"></i>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center text-sm">
                      <span className="text-green-600">+12.5%</span>
                      <span className="text-gray-500 ml-1">vs last month</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Active Licenses</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {metrics?.activeLicenses?.toLocaleString() || "0"}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <i className="fas fa-certificate text-green-600"></i>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center text-sm">
                      <span className="text-green-600">+8.2%</span>
                      <span className="text-gray-500 ml-1">growth rate</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">New Brands (72h)</p>
                        <p className="text-2xl font-bold text-gray-900">
                          +{metrics?.newBrands72h || 0}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <i className="fas fa-seedling text-blue-600"></i>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center text-sm">
                      <span className="text-blue-600">Water The Seed™</span>
                      <span className="text-gray-500 ml-1">protocol active</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Compliance Rate</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {metrics?.complianceRate || "99.7%"}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <i className="fas fa-shield-alt text-yellow-600"></i>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center text-sm">
                      <span className="text-green-600">FAA™ Verified</span>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Brand Catalog */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Featured Brands™</CardTitle>
                <div className="flex items-center space-x-3">
                  <select className="text-sm border border-gray-300 rounded-lg px-3 py-2">
                    <option>Sort by: Tier</option>
                    <option>Sort by: Revenue</option>
                    <option>Sort by: Name</option>
                    <option>Sort by: Region</option>
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {brandsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array(6).fill(0).map((_, i) => (
                    <Card key={i}>
                      <CardContent className="p-6">
                        <Skeleton className="h-6 w-32 mb-4" />
                        <Skeleton className="h-4 w-24 mb-2" />
                        <Skeleton className="h-4 w-40 mb-4" />
                        <div className="grid grid-cols-2 gap-4">
                          <Skeleton className="h-12 w-full" />
                          <Skeleton className="h-12 w-full" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <>
                  {/* Debug info */}
                  {brandsData && (
                    <div className="mb-4 p-4 bg-blue-50 rounded">
                      <p>Total brands available: {brandsData.total}</p>
                      <p>Brands returned: {brandsData.brands?.length || 0}</p>
                      <p>First brand: {brandsData.brands?.[0]?.displayName || 'None'}</p>
                      <p>First brand ID: {brandsData.brands?.[0]?.id || 'No ID'}</p>
                      <p>Brands loading: {brandsLoading ? 'Yes' : 'No'}</p>
                    </div>
                  )}
                  
                  {!brandsData && !brandsLoading && (
                    <div className="mb-4 p-4 bg-red-50 rounded">
                      <p>No brands data received - check API response</p>
                      {brandsError && <p>Error: {String(brandsError)}</p>}
                      <p>Auth status: {isAuthenticated ? 'Authenticated' : 'Not authenticated'}</p>
                      <p>Query key: ["/api/brands"]</p>
                      <p>Loading state: {brandsLoading ? 'Loading' : 'Not loading'}</p>
                    </div>
                  )}
                  
                  {/* Manual fetch test */}
                  <div className="mb-4">
                    <button 
                      onClick={async () => {
                        try {
                          const response = await fetch('/api/brands');
                          console.log('Manual fetch result:', response.status, response.statusText);
                          const data = await response.json();
                          console.log('Manual fetch data:', data);
                        } catch (error) {
                          console.error('Manual fetch error:', error);
                        }
                      }}
                      className="px-4 py-2 bg-blue-500 text-white rounded"
                    >
                      Test Manual Fetch
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {brandsData?.brands?.map((brand: any) => (
                      <BrandCard 
                        key={brand.id} 
                        brand={brand}
                        onCalculateLicense={() => setShowLicenseCalculator(true)}
                      />
                    ))}
                  </div>
                  
                  {brandsData?.brands?.length === 0 && (
                    <div className="text-center py-12">
                      <i className="fas fa-search text-gray-300 text-4xl mb-4"></i>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No brands found</h3>
                      <p className="text-gray-500">Try adjusting your search criteria or filters.</p>
                    </div>
                  )}

                  {brandsData?.total && brandsData?.brands?.length && brandsData.total > brandsData.brands.length && (
                    <div className="mt-8 text-center">
                      <Button variant="outline">
                        Load More Brands™ ({(brandsData.total - brandsData.brands.length).toLocaleString()} remaining)
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </main>
      </div>

      {/* Licensing Calculator Modal */}
      {showLicenseCalculator && (
        <LicensingCalculator 
          onClose={() => setShowLicenseCalculator(false)}
        />
      )}
    </div>
  );
}
