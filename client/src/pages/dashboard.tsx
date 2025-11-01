import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Header from "@/components/header";
import Sidebar from "@/components/sidebar";
import BrandCard from "@/components/brand-card";
import LicensingCalculator from "@/components/licensing-calculator";
import { FruitfulPreFooter } from "@/components/fruitful-pre-footer";
import { WelcomeAnimation } from "@/components/welcome-animation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart } from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [showLicenseCalculator, setShowLicenseCalculator] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeComplete, setWelcomeComplete] = useState(false);
  const [brandFilters, setBrandFilters] = useState({
    tier: [] as string[],
    division: [] as string[],
    search: "",
  });

  // Check if user should see welcome animation
  useEffect(() => {
    if (isAuthenticated && user) {
      const userId = (user as any)?.id || (user as any)?.email || 'default';
      const storageKey = `faa_last_welcome_shown_${userId}`;
      const lastWelcomeShown = localStorage.getItem(storageKey);
      const now = Date.now();
      const oneDayMs = 24 * 60 * 60 * 1000;

      // Validate timestamp and check if animation should show
      const lastShownTime = lastWelcomeShown ? parseInt(lastWelcomeShown, 10) : null;
      const isValidTimestamp = lastShownTime && !isNaN(lastShownTime);
      
      if (!isValidTimestamp || now - lastShownTime > oneDayMs) {
        setShowWelcome(true);
        localStorage.setItem(storageKey, now.toString());
      } else {
        setWelcomeComplete(true);
      }
    }
  }, [isAuthenticated, user]);

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
      {/* Welcome Animation */}
      {showWelcome && (
        <WelcomeAnimation 
          userName={(user as any)?.displayName || (user as any)?.email?.split('@')[0]}
          onComplete={() => {
            setShowWelcome(false);
            setWelcomeComplete(true);
          }}
        />
      )}

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
                <motion.div
                  initial={welcomeComplete ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: welcomeComplete ? 0 : 0.1 }}
                  data-testid="metric-card-revenue"
                >
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
                </motion.div>

                <motion.div
                  initial={welcomeComplete ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: welcomeComplete ? 0 : 0.2 }}
                  data-testid="metric-card-licenses"
                >
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
                </motion.div>

                <motion.div
                  initial={welcomeComplete ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: welcomeComplete ? 0 : 0.3 }}
                  data-testid="metric-card-brands"
                >
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
                </motion.div>

                <motion.div
                  initial={welcomeComplete ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: welcomeComplete ? 0 : 0.4 }}
                  data-testid="metric-card-compliance"
                >
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
                </motion.div>
              </>
            )}
          </div>

          {/* Integration Modules */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">HSOMNI Integration Modules</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/healthtrack">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-green-200 hover:border-green-400">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Heart className="w-6 h-6 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1" data-testid="module-healthtrack-title">HealthTrack™</h3>
                        <p className="text-sm text-gray-600 mb-2">Health & Hygiene sector integration</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded">465 Brands</span>
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">VaultMesh™</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Card className="opacity-50">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <i className="fas fa-cogs text-gray-400"></i>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-500 mb-1">More Modules</h3>
                      <p className="text-sm text-gray-400">Coming soon...</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
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
                  <motion.div 
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    initial="hidden"
                    animate="visible"
                    variants={{
                      visible: {
                        transition: {
                          staggerChildren: welcomeComplete ? 0 : 0.08
                        }
                      }
                    }}
                  >
                    {brandsData?.brands?.map((brand: any, index: number) => (
                      <motion.div
                        key={brand.id}
                        variants={{
                          hidden: { opacity: 0, y: 20 },
                          visible: { opacity: 1, y: 0 }
                        }}
                        transition={{ duration: 0.4 }}
                        data-testid={`brand-card-${index}`}
                      >
                        <BrandCard 
                          brand={brand}
                          onCalculateLicense={() => setShowLicenseCalculator(true)}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                  
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

      {/* Fruitful Pre-Footer */}
      <FruitfulPreFooter />

      {/* Licensing Calculator Modal */}
      {showLicenseCalculator && (
        <LicensingCalculator 
          onClose={() => setShowLicenseCalculator(false)}
        />
      )}
    </div>
  );
}
