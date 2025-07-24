import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface CurrencyConverterProps {
  ecrAmount: string;
  usdAmount: string;
  compact?: boolean;
}

export function CurrencyConverter({ ecrAmount, usdAmount, compact = false }: CurrencyConverterProps) {
  const [displayCurrency, setDisplayCurrency] = useState<'USD' | 'ECR'>('USD');
  const [exchangeRate] = useState(3.4); // ECR to USD rate (Enterprise Credit Rating)

  const formatCurrency = (amount: string, currency: 'USD' | 'ECR') => {
    const numAmount = parseFloat(amount) || 0;
    if (isNaN(numAmount)) {
      return currency === 'USD' ? '$0.00' : '0.00 ECR';
    }
    if (currency === 'USD') {
      return `$${numAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else {
      return `${numAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ECR`;
    }
  };

  const getCurrentAmount = () => {
    const amount = displayCurrency === 'USD' ? usdAmount : ecrAmount;
    return amount || '0';
  };

  const getAlternateAmount = () => {
    const amount = displayCurrency === 'USD' ? ecrAmount : usdAmount;
    return amount || '0';
  };

  if (compact) {
    return (
      <div className="flex items-center space-x-2">
        <div className="text-lg font-bold text-green-600">
          {formatCurrency(getCurrentAmount(), displayCurrency)}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setDisplayCurrency(displayCurrency === 'USD' ? 'ECR' : 'USD')}
          className="text-xs px-2 py-1 h-6"
        >
          ⇄ {displayCurrency === 'USD' ? 'ECR' : 'USD'}
        </Button>
      </div>
    );
  }

  return (
    <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
      <CardContent className="p-4">
        <div className="text-center">
          <div className="text-2xl font-bold mb-2 text-green-600">
            {formatCurrency(getCurrentAmount(), displayCurrency)}
          </div>
          <div className="text-sm text-gray-600 mb-3">
            ≈ {formatCurrency(getAlternateAmount(), displayCurrency === 'USD' ? 'ECR' : 'USD')}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDisplayCurrency(displayCurrency === 'USD' ? 'ECR' : 'USD')}
            className="text-xs"
          >
            Switch to {displayCurrency === 'USD' ? 'ECR' : 'USD'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Global currency context for app-wide currency preference
import { createContext, useContext } from 'react';

interface CurrencyContextType {
  globalCurrency: 'USD' | 'ECR';
  setGlobalCurrency: (currency: 'USD' | 'ECR') => void;
  convertAmount: (ecrAmount: string, targetCurrency: 'USD' | 'ECR') => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [globalCurrency, setGlobalCurrency] = useState<'USD' | 'ECR'>('USD');
  const exchangeRate = 3.4;

  const convertAmount = (ecrAmount: string, targetCurrency: 'USD' | 'ECR') => {
    const ecr = parseFloat(ecrAmount);
    if (targetCurrency === 'USD') {
      return (ecr * exchangeRate).toFixed(2);
    }
    return ecrAmount;
  };

  return (
    <CurrencyContext.Provider value={{ globalCurrency, setGlobalCurrency, convertAmount }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}