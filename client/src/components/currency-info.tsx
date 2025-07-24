import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function CurrencyInfo() {
  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center space-x-2">
          <i className="fas fa-info-circle text-blue-600"></i>
          <span>Currency System</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div>
            <Badge variant="secondary" className="mb-2">ECR - Enterprise Credit Rating</Badge>
            <p className="text-sm text-gray-600">
              ECR is the official currency system for FAA™ Brand Licensing transactions. 
              It provides standardized pricing across all enterprise brand management operations.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 p-3 bg-white rounded-lg border">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">1 ECR</div>
              <div className="text-xs text-gray-500">Enterprise Credit</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">= $3.40</div>
              <div className="text-xs text-gray-500">US Dollars</div>
            </div>
          </div>

          <div className="text-xs text-gray-500">
            Exchange rate updated: Real-time market rates
          </div>
        </div>
      </CardContent>
    </Card>
  );
}