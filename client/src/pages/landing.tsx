import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-certificate text-white text-2xl"></i>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              FAA™ Brand Licensing
            </h1>
            <p className="text-gray-600">
              African Economic Sovereignty Platform
            </p>
          </div>

          <div className="space-y-4 mb-6">
            <div className="text-left">
              <h3 className="font-medium text-gray-900 mb-2">Operational Enterprise:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li className="flex items-center">
                  <i className="fas fa-check text-green-500 mr-2"></i>
                  13,713 Trademarked Brands™
                </li>
                <li className="flex items-center">
                  <i className="fas fa-check text-green-500 mr-2"></i>
                  FAA™ (7,344) | HSOMNI9000 (6,219) | Seedwave (150)
                </li>
                <li className="flex items-center">
                  <i className="fas fa-check text-green-500 mr-2"></i>
                  Water The Seed Protocol™ - 152% Complete
                </li>
                <li className="flex items-center">
                  <i className="fas fa-check text-green-500 mr-2"></i>
                  9,000+ Domains on Cloudflare R2
                </li>
                <li className="flex items-center">
                  <i className="fas fa-check text-green-500 mr-2"></i>
                  100M+ Files | 20M Contacts | Fully Automated
                </li>
              </ul>
            </div>
          </div>

          <Button 
            onClick={handleLogin}
            className="w-full"
            size="lg"
          >
            <i className="fas fa-sign-in-alt mr-2"></i>
            Sign In to Continue
          </Button>

          <div className="mt-4 text-xs text-gray-500">
            Powered by HSOMNI9000 | Operated by Heyns | $200-400/month
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
