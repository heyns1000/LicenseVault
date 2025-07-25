import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import fruitfulLogo from "@assets/Fruiful_1753374425252.png";

interface HeaderProps {
  user?: any;
  waterTheSeedStatus?: any;
  onLicenseCalculator?: () => void;
}

export default function Header({ user, waterTheSeedStatus, onLicenseCalculator }: HeaderProps) {
  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-10 flex items-center justify-center">
                <img 
                  src={fruitfulLogo} 
                  alt="Fruitful™" 
                  className="h-8 w-auto object-contain"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-blue-600">FAA™ Brand Licensing</h1>
                <p className="text-sm text-gray-500">Enterprise Management System</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            {/* Water The Seed Protocol Status */}
            {waterTheSeedStatus?.isActive && (
              <div className="flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-700">Water The Seed™ Active</span>
              </div>
            )}
            
            {/* Global Stats */}
            <div className="hidden lg:flex items-center space-x-6 text-sm">
              <div className="text-center">
                <div className="font-bold text-lg text-blue-600">
                  {waterTheSeedStatus?.totalBrands?.toLocaleString() || "4,643"}
                </div>
                <div className="text-gray-500">Total Brands™</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg text-green-600">
                  +{waterTheSeedStatus?.newBrands72h || 82}
                </div>
                <div className="text-gray-500">Growth (72h)</div>
              </div>
            </div>

            {/* License Calculator Button */}
            {onLicenseCalculator && (
              <Button onClick={onLicenseCalculator} size="sm">
                <i className="fas fa-calculator mr-2"></i>
                License Calculator
              </Button>
            )}
            
            {/* User Menu */}
            <div className="flex items-center space-x-3">
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                <i className="fas fa-bell"></i>
              </button>
              <div className="flex items-center space-x-2">
                {user?.profileImageUrl && (
                  <img 
                    src={user.profileImageUrl} 
                    alt="User avatar" 
                    className="w-8 h-8 rounded-full object-cover"
                  />
                )}
                <span className="text-sm font-medium">
                  {user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user?.email || 'User'}
                </span>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <i className="fas fa-sign-out-alt"></i>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
