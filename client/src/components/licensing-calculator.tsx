import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import FruitfulFooter from "@/components/fruitful-footer";

interface LicensingCalculatorProps {
  onClose: () => void;
}

export default function LicensingCalculator({ onClose }: LicensingCalculatorProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    brandId: "",
    scope: "local",
    geographicDivision: "A",
    durationMonths: 12,
  });

  const { data: brandsData } = useQuery({
    queryKey: ["/api/brands", { limit: 100 }],
    retry: false,
  });

  const calculateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await apiRequest("POST", "/api/calculate-license", data);
      return response.json();
    },
    onSuccess: (data) => {
      console.log("License calculation result:", data);
    },
    onError: (error) => {
      toast({
        title: "Calculation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const generateAgreementMutation = useMutation({
    mutationFn: async () => {
      if (!result || !formData.brandId) {
        throw new Error("No calculation result available");
      }
      
      const response = await apiRequest("POST", "/api/generate-license-agreement", {
        brandId: formData.brandId,
        calculationData: result
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Agreement Generated",
        description: "License agreement generated successfully!",
      });
      
      // Automatically download the agreement
      if (data.downloadUrl) {
        window.open(data.downloadUrl, '_blank');
      }
    },
    onError: (error) => {
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCalculate = () => {
    if (!formData.brandId) {
      toast({
        title: "Validation Error",
        description: "Please select a brand to calculate license cost.",
        variant: "destructive",
      });
      return;
    }

    calculateMutation.mutate(formData);
  };

  const divisions = [
    { id: 'A', name: 'North America' },
    { id: 'B', name: 'Europe' },
    { id: 'C', name: 'Asia-Pacific' },
    { id: 'D', name: 'MENA' },
    { id: 'E', name: 'Sub-Saharan Africa' },
    { id: 'F', name: 'Latin America' },
    { id: 'G', name: 'Interstellar' },
  ];

  const result = calculateMutation.data;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-screen overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>FAA™ Licensing Calculator</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <i className="fas fa-times"></i>
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Brand Selection */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Select Brand™</h4>
              
              <div>
                <Label htmlFor="brand">Brand</Label>
                <Select value={formData.brandId} onValueChange={(value) => setFormData({...formData, brandId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a brand..." />
                  </SelectTrigger>
                  <SelectContent>
                    {brandsData?.brands?.map((brand: any) => (
                      <SelectItem key={brand.id} value={brand.id}>
                        {brand.displayName} - {brand.tier} ({Number(brand.licenseFeeECR).toLocaleString()} ECR)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="division">Geographic Division</Label>
                  <Select value={formData.geographicDivision} onValueChange={(value) => setFormData({...formData, geographicDivision: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {divisions.map((division) => (
                        <SelectItem key={division.id} value={division.id}>
                          Division {division.id} - {division.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="scope">License Scope</Label>
                  <Select value={formData.scope} onValueChange={(value) => setFormData({...formData, scope: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="local">Local</SelectItem>
                      <SelectItem value="regional">Regional</SelectItem>
                      <SelectItem value="global">Global</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="duration">License Duration (months)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.durationMonths}
                  onChange={(e) => setFormData({...formData, durationMonths: Number(e.target.value)})}
                  min="1"
                  max="120"
                />
              </div>

              <Button 
                onClick={handleCalculate} 
                className="w-full" 
                disabled={calculateMutation.isPending}
              >
                {calculateMutation.isPending ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Calculating...
                  </>
                ) : (
                  <>
                    <i className="fas fa-calculator mr-2"></i>
                    Calculate License Cost
                  </>
                )}
              </Button>
            </div>

            {/* Cost Breakdown */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Cost Breakdown</h4>
              
              {result ? (
                <div className="space-y-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Brand</span>
                          <span className="font-semibold">{result.brandName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tier</span>
                          <span className="font-semibold capitalize">{result.tier}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Master License Fee</span>
                          <span className="font-semibold">{Number(result.masterFeeECR).toLocaleString()} ECR</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Monthly Fee ({result.durationMonths} months)</span>
                          <span className="font-semibold">{Number(result.totalMonthlyCostECR).toLocaleString()} ECR</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Royalty Rate</span>
                          <span className="font-semibold">{result.royaltyRate}%</span>
                        </div>
                        <hr className="border-gray-300" />
                        <div className="flex justify-between text-lg font-bold">
                          <span className="text-gray-900">Total Cost</span>
                          <span className="text-blue-600">{Number(result.totalCostECR).toLocaleString()} ECR</span>
                        </div>
                        <div className="text-sm text-gray-600 text-right">
                          ≈ ${Number(result.totalCostUSD).toLocaleString()} USD
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* FAA Systems Integration */}
                  <div>
                    <h5 className="font-medium text-gray-900 mb-3">Included FAA™ Systems</h5>
                    <div className="space-y-2 text-sm">
                      {[
                        'ClaimRoot™ IP Management',
                        'VaultPay™ Payment Processing',
                        'GhostTrace™ Security Layer',
                        'PulseTrade™ Transaction Engine'
                      ].map((system) => (
                        <div key={system} className="flex items-center space-x-2">
                          <i className="fas fa-check text-green-600"></i>
                          <span>{system}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button 
                  className="w-full" 
                  size="lg"
                  onClick={() => generateAgreementMutation.mutate()}
                  disabled={generateAgreementMutation.isPending}
                >
                  {generateAgreementMutation.isPending ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Generating Agreement...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-file-contract mr-2"></i>
                      Generate License Agreement
                    </>
                  )}
                </Button>
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <i className="fas fa-calculator text-gray-300 text-4xl mb-4"></i>
                    <p className="text-gray-500">Select a brand and click calculate to see pricing breakdown</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </CardContent>
        
        {/* Add Fruitful footer at bottom of pricing */}
        <FruitfulFooter />
      </Card>
    </div>
  );
}
