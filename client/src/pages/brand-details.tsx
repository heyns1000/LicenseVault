import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/header";
import { FruitfulPreFooter } from "@/components/fruitful-pre-footer";
import { CurrencyConverter } from "@/components/currency-converter";
import { ProductDetails } from "@/components/product-details";
import { CurrencyInfo } from "@/components/currency-info";
import fruitfulLogo from "@assets/Fruiful_1753374425252.png";
import seedwaveLogo from "@assets/Seedwave.png_1753374449890.png";

export default function BrandDetails() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();

  const { data: brand, isLoading } = useQuery<{
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
  }>({
    queryKey: [`/api/brands/${id}`],
    retry: false,
    enabled: isAuthenticated && !!id && id !== '[object Object]',
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="p-6">
          <Skeleton className="h-8 w-64 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Skeleton className="h-64 w-full" />
            </div>
            <div>
              <Skeleton className="h-48 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="p-6">
          <Card>
            <CardContent className="p-12 text-center">
              <i className="fas fa-exclamation-triangle text-yellow-500 text-4xl mb-4"></i>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Brand Not Found</h2>
              <p className="text-gray-600">The requested brand could not be found.</p>
              <Button className="mt-4" onClick={() => window.history.back()}>
                Go Back
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'sovereign': return 'bg-yellow-500 text-white';
      case 'dynastic': return 'bg-gray-500 text-white';
      case 'operational': return 'bg-blue-500 text-white';
      case 'market': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getDivisionName = (division: string) => {
    const divisions: Record<string, string> = {
      'A': 'North America',
      'B': 'Europe',
      'C': 'Asia-Pacific',
      'D': 'MENA',
      'E': 'Sub-Saharan Africa',
      'F': 'Latin America',
      'G': 'Interstellar',
    };
    return divisions[division] || division;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="p-6">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => window.history.back()}>
            <i className="fas fa-arrow-left mr-2"></i>
            Back to Dashboard
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Brand Information */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl mb-2">{brand.displayName}</CardTitle>
                    <div className="flex items-center space-x-2 mb-4">
                      <Badge className={getTierColor(brand.tier)}>
                        {brand.tier?.toUpperCase() || 'UNKNOWN'}
                      </Badge>
                      <Badge variant="outline">
                        Division {brand.geographicDivision} - {getDivisionName(brand.geographicDivision)}
                      </Badge>
                    </div>
                  </div>
                  <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center shadow-sm border">
                    {brand.name === 'FRUITFUL' ? (
                      <img 
                        src={fruitfulLogo} 
                        alt="Fruitful™" 
                        className="h-12 w-auto object-contain"
                      />
                    ) : brand.name === 'LIONS_SEEDWAVE' ? (
                      <img 
                        src={seedwaveLogo} 
                        alt="Seedwave™" 
                        className="h-12 w-auto object-contain"
                      />
                    ) : (
                      <i className={`${brand.iconClass || 'fas fa-certificate'} text-blue-600 text-2xl`}></i>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                    <p className="text-gray-600">{brand.description || 'No description available.'}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Category</h3>
                    <p className="text-gray-600">{brand.category || 'Uncategorized'}</p>
                  </div>

                  {brand.faaSystemsIntegration && brand.faaSystemsIntegration.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">FAA™ Systems Integration</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {brand.faaSystemsIntegration.map((system: string) => (
                          <div key={system} className="flex items-center space-x-2 text-sm">
                            <i className="fas fa-check text-green-500"></i>
                            <span>{system}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Product Details Section */}
                  <ProductDetails brand={brand} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pricing and Licensing */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Licensing Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Currency Converter */}
                  <div className="mb-4">
                    <CurrencyConverter 
                      ecrAmount={brand.licenseFeeECR}
                      usdAmount={brand.licenseFeeUSD}
                    />
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Royalty Rate</span>
                    <span className="font-bold text-purple-600">{brand.royaltyRate}%</span>
                  </div>

                  <div className="pt-4 border-t">
                    <Button className="w-full" size="lg">
                      <i className="fas fa-calculator mr-2"></i>
                      Calculate License Cost
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Currency Information */}
            <CurrencyInfo />

            <Card>
              <CardHeader>
                <CardTitle>Brand Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Status</span>
                    <Badge variant={brand.isActive ? "default" : "secondary"}>
                      {brand.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Created</span>
                    <span className="text-sm text-gray-600">
                      {new Date(brand.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Last Updated</span>
                    <span className="text-sm text-gray-600">
                      {new Date(brand.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Fruitful Pre-Footer */}
      <FruitfulPreFooter />
    </div>
  );
}
