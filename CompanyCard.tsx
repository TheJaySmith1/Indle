import { motion } from 'motion/react';
import { Company } from '../hooks/useGameState';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface CompanyCardProps {
  company: Company;
  onUpgrade: (id: string) => void;
  onBuyShares: (id: string, percentage: number) => void;
  onSellShares: (id: string, percentage: number) => void;
  formatCurrency: (amount: number) => string;
  canAffordUpgrade: boolean;
}

export const CompanyCard = ({ 
  company, 
  onUpgrade, 
  onBuyShares, 
  onSellShares, 
  formatCurrency, 
  canAffordUpgrade 
}: CompanyCardProps) => {
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
      <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-6 hover:bg-white/15 transition-all duration-300 min-h-[400px] flex flex-col">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-3 min-w-0 flex-1 mr-3">
              <div className="text-3xl flex-shrink-0">{company.icon}</div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-gray-900 text-base leading-tight mb-1 break-words">
                  {company.name}
                </h3>
                <p className="text-sm text-gray-600 break-words">{company.industry}</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-white/20 backdrop-blur-sm text-xs flex-shrink-0">
              Level {company.level}
            </Badge>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6">
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
              <div className="text-xs text-gray-600 uppercase tracking-wide mb-2">Market Value</div>
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
            <span className="text-sm text-gray-600">Ownership</span>
            <span className="text-sm font-semibold text-gray-900">
              {company.sharesOwned.toFixed(1)}%
            </span>
          </div>
          <Progress value={company.sharesOwned} className="h-3 bg-white/20" />
        </div>

        {/* Actions */}
        <div className="mt-auto space-y-4">
          {/* Upgrade */}
          <Button
            onClick={() => onUpgrade(company.id)}
            disabled={!canAffordUpgrade}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg backdrop-blur-sm text-sm min-h-[44px]"
          >
            <TrendingUp className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="break-words">
              Upgrade - {formatCurrency(company.upgradeCost)}
            </span>
          </Button>

          {/* Stock Trading */}
          {sharesBuyable > 0 && (
            <div className="space-y-3">
              <div className="text-xs text-gray-600 text-center">Buy More Shares</div>
              <div className="grid grid-cols-3 gap-2">
                {[5, 10, 20].map(percentage => (
                  <Button
                    key={percentage}
                    onClick={() => onBuyShares(company.id, percentage)}
                    variant="outline"
                    size="sm"
                    className="bg-white/10 border-white/20 hover:bg-white/20 text-gray-900 backdrop-blur-sm text-xs min-h-[36px]"
                    disabled={sharesBuyable < percentage}
                  >
                    Buy {percentage}%
                  </Button>
                ))}
              </div>
            </div>
          )}

          {company.sharesOwned > 0 && (
            <div className="space-y-3">
              <div className="text-xs text-gray-600 text-center">Sell Shares</div>
              <div className="grid grid-cols-3 gap-2">
                {[5, 10, 20].map(percentage => (
                  <Button
                    key={percentage}
                    onClick={() => onSellShares(company.id, percentage)}
                    variant="outline"
                    size="sm"
                    className="bg-red-500/10 border-red-500/20 hover:bg-red-500/20 text-red-700 backdrop-blur-sm text-xs min-w-0 min-h-[36px]"
                    disabled={company.sharesOwned < percentage}
                  >
                    <TrendingDown className="w-3 h-3 mr-1 flex-shrink-0" />
                    <span>{percentage}%</span>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};