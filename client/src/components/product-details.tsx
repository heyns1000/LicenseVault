import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ProductDetailsProps {
  brand: {
    name: string;
    displayName: string;
    description: string;
    metadata?: any;
  };
}

export function ProductDetails({ brand }: ProductDetailsProps) {
  // Enhanced product data for Fruitful brand
  const getProductData = () => {
    if (brand.name === 'FRUITFUL') {
      return {
        brandPhilosophy: "If you don't like the fruits you are growing, change the seeds...",
        brandColors: ['#4ECDC4', '#FFE66D', '#FF6B6B'],
        brandValues: ['Growth Mindset', 'Natural Development', 'Positive Transformation'],
        targetAudience: 'Individuals and organizations focused on personal and professional growth',
        keyFeatures: [
          'Inspirational Brand Philosophy',
          'Growth-Oriented Messaging',
          'Positive Life Transformation',
          'Mindset Development Tools'
        ],
        brandAssets: [
          {
            type: 'Logo',
            description: 'High-resolution Fruitful™ logo with vibrant colors',
            available: true
          },
          {
            type: 'Thank You Asset',
            description: 'Professional thank you image with brand representative',
            available: true
          }
        ],
        usageGuidelines: [
          'Maintain brand philosophy in all communications',
          'Use approved color palette for consistency',
          'Focus on growth and transformation messaging',
          'Respect trademark usage requirements'
        ]
      };
    }

    if (brand.name === 'LIONS_SEEDWAVE') {
      return {
        brandPhilosophy: "Strategic brand sovereignty through analytical precision",
        specialization: "Advanced Brand Bloodline Sovereignty Analysis",
        targetMarket: "Sovereign-tier enterprises requiring premium strategic consulting",
        brandColors: ['#1E7B3D', '#FFFFFF', '#000000'],
        keyCapabilities: [
          'Brand Bloodline Analysis',
          'Sovereignty Metrics Development',
          'Strategic Market Positioning',
          'Premium Consulting Services'
        ],
        brandAssets: [
          {
            type: 'Logo',
            description: 'Professional Seedwave logo with green circular design',
            available: true
          }
        ]
      };
    }

    if (brand.name === 'WATER_THE_SEED') {
      return {
        brandPhilosophy: "Active Growth Protocol & Brand Development System",
        focus: "Systematic brand development and nurturing",
        keyFeatures: [
          'Growth Analytics Dashboard',
          'Brand Development Tracking',
          'Active Protocol Implementation',
          'Performance Monitoring'
        ]
      };
    }

    // Default metadata display
    return brand.metadata || {};
  };

  const productData = getProductData();

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <i className="fas fa-cube text-blue-600"></i>
          <span>Product Details</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Brand Philosophy */}
          {productData.brandPhilosophy && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Brand Philosophy</h4>
              <p className="text-gray-600 italic">"{productData.brandPhilosophy}"</p>
            </div>
          )}

          {/* Brand Colors */}
          {productData.brandColors && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Brand Colors</h4>
              <div className="flex space-x-2">
                {productData.brandColors.map((color: string, index: number) => (
                  <div key={index} className="flex flex-col items-center">
                    <div 
                      className="w-12 h-12 rounded-lg border shadow-sm"
                      style={{ backgroundColor: color }}
                    ></div>
                    <span className="text-xs text-gray-500 mt-1">{color}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Key Features */}
          {productData.keyFeatures && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Key Features</h4>
              <div className="grid grid-cols-1 gap-2">
                {productData.keyFeatures.map((feature: string, index: number) => (
                  <div key={index} className="flex items-center space-x-2">
                    <i className="fas fa-star text-yellow-500 text-sm"></i>
                    <span className="text-gray-600">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Brand Values */}
          {productData.brandValues && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Brand Values</h4>
              <div className="flex flex-wrap gap-2">
                {productData.brandValues.map((value: string, index: number) => (
                  <Badge key={index} variant="secondary">{value}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Target Audience */}
          {productData.targetAudience && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Target Audience</h4>
              <p className="text-gray-600">{productData.targetAudience}</p>
            </div>
          )}

          {/* Brand Assets */}
          {productData.brandAssets && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Available Brand Assets</h4>
              <div className="space-y-3">
                {productData.brandAssets.map((asset: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">{asset.type}</div>
                      <div className="text-sm text-gray-600">{asset.description}</div>
                    </div>
                    <Badge variant={asset.available ? "default" : "secondary"}>
                      {asset.available ? "Available" : "Pending"}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Usage Guidelines */}
          {productData.usageGuidelines && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Usage Guidelines</h4>
              <div className="space-y-2">
                {productData.usageGuidelines.map((guideline: string, index: number) => (
                  <div key={index} className="flex items-start space-x-2">
                    <i className="fas fa-check-circle text-green-500 text-sm mt-0.5"></i>
                    <span className="text-gray-600 text-sm">{guideline}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}