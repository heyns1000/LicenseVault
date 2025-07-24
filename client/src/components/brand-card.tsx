import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface BrandCardProps {
  brand: {
    id: string;
    name: string;
    displayName: string;
    tier: string;
    description?: string;
    category?: string;
    geographicDivision: string;
    licenseFeeECR: string;
    royaltyRate: string;
    iconClass?: string;
    faaSystemsIntegration?: string[];
  };
  onCalculateLicense?: () => void;
}

export default function BrandCard({ brand, onCalculateLicense }: BrandCardProps) {
  const getTierClasses = (tier: string) => {
    switch (tier) {
      case 'sovereign':
        return {
          card: 'border-yellow-500 tier-sovereign',
          badge: 'bg-yellow-600 text-white',
          icon: 'fas fa-crown'
        };
      case 'dynastic':
        return {
          card: 'border-gray-500 tier-dynastic',
          badge: 'bg-gray-600 text-white',
          icon: 'fas fa-chess-king'
        };
      case 'operational':
        return {
          card: 'border-blue-500 tier-operational',
          badge: 'bg-blue-600 text-white',
          icon: 'fas fa-broadcast-tower'
        };
      case 'market':
        return {
          card: 'border-green-500 tier-market',
          badge: 'bg-green-600 text-white',
          icon: 'fas fa-leaf'
        };
      default:
        return {
          card: 'border-gray-300 bg-white text-gray-900',
          badge: 'bg-gray-600 text-white',
          icon: 'fas fa-certificate'
        };
    }
  };

  const getDivisionName = (division: string) => {
    const divisions: Record<string, string> = {
      'A': 'North America',
      'B': 'Europe', 
      'C': 'Asia-Pacific',
      'D': 'MENA',
      'E': 'Sub-Saharan',
      'F': 'LATAM',
      'G': 'Interstellar',
    };
    return divisions[division] || division;
  };

  const tierClasses = getTierClasses(brand.tier);

  return (
    <Card className={`${tierClasses.card} hover:shadow-lg transition-shadow cursor-pointer`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <i className={`${brand.iconClass || tierClasses.icon} text-white text-sm`}></i>
            </div>
            <Badge className={tierClasses.badge}>
              {brand.tier.toUpperCase()}
            </Badge>
          </div>
          <button className="text-white hover:text-opacity-70">
            <i className="fas fa-ellipsis-h"></i>
          </button>
        </div>

        <h4 className="text-xl font-bold mb-2 text-white">{brand.displayName}</h4>
        <p className="text-sm opacity-90 mb-4 text-white">
          {brand.description || brand.category || 'Premium Brand License'}
        </p>

        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
          <div>
            <span className="opacity-80 text-white">License Fee</span>
            <div className="font-bold text-white">
              {Number(brand.licenseFeeECR).toLocaleString()} ECR
            </div>
          </div>
          <div>
            <span className="opacity-80 text-white">Royalty</span>
            <div className="font-bold text-white">{brand.royaltyRate}%</div>
          </div>
        </div>

        <div className="pt-4 border-t border-white border-opacity-20 flex items-center justify-between text-sm">
          <span className="opacity-80 text-white">
            Division {brand.geographicDivision} - {getDivisionName(brand.geographicDivision)}
          </span>
          {brand.faaSystemsIntegration && brand.faaSystemsIntegration.length > 0 && (
            <div className="flex items-center space-x-1 text-white">
              <i className="fas fa-shield-alt"></i>
              <span>{brand.faaSystemsIntegration[0]}</span>
            </div>
          )}
        </div>

        <div className="mt-4 space-y-2">
          <Button 
            variant="secondary" 
            size="sm" 
            className="w-full"
            onClick={() => window.location.href = `/brands/${brand.id}`}
          >
            View Details
          </Button>
          {onCalculateLicense && (
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full bg-white bg-opacity-20 border-white border-opacity-30 text-white hover:bg-white hover:text-gray-900"
              onClick={onCalculateLicense}
            >
              <i className="fas fa-calculator mr-2"></i>
              Calculate License
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
