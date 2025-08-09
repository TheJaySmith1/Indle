import { motion } from 'motion/react';
import { RealCompany } from '../hooks/useGameState';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { TrendingUp, TrendingDown, Star } from 'lucide-react';

interface RealCompanyCardProps {
  company: RealCompany;
  onBuyShares: (id: string, percentage: number) => void;
  onSellShares: (id: string, percentage: number) => void;
  formatCurrency: (amount: number) => string;
}

export const RealCompanyCard = ({ 
  company, 
  onBuyShares, 
  onSellShares, 
  formatCurrency
}: RealCompanyCardProps) => {
  const incomePerSecond = company.currentIncome * (company.sharesOwned / 100);
  const sharesBuyable = 100 - company.sharesOwned;
  
  return (
    <motion.div
      className="relative group"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02, y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <div className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-xl rounded-3xl border border-white/30 shadow-2xl p-6 hover:from-white/20 hover:to-white/10 transition-all duration-300 relative overflow-hidden min-h-[450px] flex flex-col">
        {/* Premium Badge */}
        <div className="absolute top-4 right-4 z-10">
          <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-none shadow-lg text-xs">
            <Star className="w-3 h-3 mr-1" />
            Real
          </Badge>
        </div>

        {/* Header */}
        <div className="mb-6 pr-16">
          <div className="flex items-center space-x-4 mb-4">
            <div className="text-3xl flex-shrink-0">{company.logo}</div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-gray-900 text-base leading-tight mb-1 break-words">
                {company.name}
              </h3>
              <p className="text-sm text-gray-600 break-words">
                {company.ticker} • {company.industry}
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">
            {company.description}
          </p>
        </div>

        {/* Stats */}
        <div className="mb-6">
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
              <div className="text-xs text-gray-600 uppercase tracking-wide mb-2">Market Cap</div>
              <div className="font-semibold text-gray-900 text-base break-words">
                {formatCurrency(company.marketValue)}
              </div>
            </div>
            <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
              <div className="text-xs text-gray-600 uppercase tracking-wide mb-2">Your Income/sec</div>
              <div className="font-semibold text-green-600 text-base break-words">
                +{formatCurrency(incomePerSecond)}
              </div>
            </div>
          </div>
        </div>

        {/* Ownership */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-gray-600">Your Ownership</span>
            <span className="text-sm font-semibold text-gray-900">
              {company.sharesOwned.toFixed(2)}%
            </span>
          </div>
          <Progress value={company.sharesOwned} className="h-3 bg-white/20" />
          {company.sharesOwned > 0 && (
            <div className="mt-3 text-xs text-gray-500 break-words">
              Portfolio Value: {formatCurrency(company.marketValue * company.sharesOwned / 100)}
            </div>
          )}
        </div>

        {/* Volatility Indicator */}
        <div className="mb-6">
          <div className="bg-white/10 rounded-xl p-4">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs text-gray-600">Volatility Risk:</span>
              <span className={`text-xs font-medium ${
                company.volatility > 0.06 ? 'text-red-600' : 
                company.volatility > 0.04 ? 'text-yellow-600' : 'text-green-600'
              }`}>
                {company.volatility > 0.06 ? 'High' : 
                 company.volatility > 0.04 ? 'Medium' : 'Low'}
              </span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  company.volatility > 0.06 ? 'bg-red-500' : 
                  company.volatility > 0.04 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(company.volatility * 1000, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-auto space-y-4">
          {/* Buy Shares */}
          {sharesBuyable > 0 && (
            <div className="space-y-3">
              <div className="text-xs text-gray-600 text-center">
                Cost: {formatCurrency(company.marketValue * 0.01)} per 1%
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[1, 5, 10].filter(p => p <= sharesBuyable).map(percentage => (
                  <Button
                    key={percentage}
                    onClick={() => onBuyShares(company.id, percentage)}
                    variant="outline"
                    size="sm"
                    className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border-green-500/20 hover:from-green-500/20 hover:to-blue-500/20 text-gray-900 backdrop-blur-sm text-xs min-h-[36px]"
                  >
                    <TrendingUp className="w-3 h-3 mr-1 flex-shrink-0" />
                    {percentage}%
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Sell Shares */}
          {company.sharesOwned > 0 && (
            <div className="space-y-3">
              <div className="text-xs text-gray-600 text-center">Sell Shares (2% fee)</div>
              <div className="grid grid-cols-3 gap-2">
                {[1, 5, 10].filter(p => p <= company.sharesOwned).map(percentage => (
                  <Button
                    key={percentage}
                    onClick={() => onSellShares(company.id, percentage)}
                    variant="outline"
                    size="sm"
                    className="bg-red-500/10 border-red-500/20 hover:bg-red-500/20 text-red-700 backdrop-blur-sm text-xs min-w-0 min-h-[36px]"
                  >
                    <TrendingDown className="w-3 h-3 mr-1 flex-shrink-0" />
                    <span>{percentage}%</span>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {sharesBuyable === 0 && company.sharesOwned === 0 && (
            <div className="text-center py-4 text-sm text-gray-500">
              No shares available
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};