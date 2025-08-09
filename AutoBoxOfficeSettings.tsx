import { useState } from 'react';
import { motion } from 'motion/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Slider } from './ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { AutoBoxOfficeSettings } from '../hooks/useGameState';
import { 
  Settings, 
  Zap, 
  DollarSign, 
  TrendingUp, 
  Shield, 
  Target,
  Film,
  Tv,
  FileText,
  Shuffle,
  AlertTriangle
} from 'lucide-react';

interface AutoBoxOfficeSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AutoBoxOfficeSettings;
  onUpdateSettings: (newSettings: Partial<AutoBoxOfficeSettings>) => void;
  formatCurrency: (amount: number) => string;
  currentCash: number;
}

export const AutoBoxOfficeSettings = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  formatCurrency,
  currentCash
}: AutoBoxOfficeSettingsProps) => {
  const [localSettings, setLocalSettings] = useState<AutoBoxOfficeSettings>(settings);

  const handleSave = () => {
    onUpdateSettings(localSettings);
    onClose();
  };

  const handleReset = () => {
    const defaultSettings: AutoBoxOfficeSettings = {
      enabled: true,
      minCashReserve: 100000, // $100K
      maxInvestmentPercentage: 0.2, // 20%
      preferredProjectType: 'auto',
      aggressiveness: 'balanced'
    };
    setLocalSettings(defaultSettings);
  };

  const getAggressivenessDescription = (level: string) => {
    switch (level) {
      case 'conservative':
        return 'Lower budgets, focus on documentaries and small films';
      case 'balanced':
        return 'Moderate budgets mixing indies, series, and mid-budget films';
      case 'aggressive':
        return 'Higher budgets targeting blockbusters and prestige series';
      default:
        return '';
    }
  };

  const getProjectTypeIcon = (type: string) => {
    switch (type) {
      case 'movie': return <Film className="w-4 h-4" />;
      case 'series': return <Tv className="w-4 h-4" />;
      case 'documentary': return <FileText className="w-4 h-4" />;
      case 'auto': return <Shuffle className="w-4 h-4" />;
      default: return <Film className="w-4 h-4" />;
    }
  };

  const estimatedBudget = () => {
    const availableCash = Math.max(0, currentCash - localSettings.minCashReserve);
    return availableCash * localSettings.maxInvestmentPercentage;
  };

  const getRecommendedBudgetType = (budget: number) => {
    if (budget >= 10000000) return 'Blockbuster Film';
    if (budget >= 1000000) return 'Independent Film';
    if (budget >= 500000) return 'TV Series';
    if (budget >= 100000) return 'Documentary';
    return 'Insufficient for realistic production';
  };

  const canAffordRealisticProduction = estimatedBudget() >= 100000;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-[95vw] bg-white/10 backdrop-blur-2xl border border-white/30 shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center text-2xl font-semibold text-gray-900">
            <Settings className="w-6 h-6 mr-3" />
            Auto Box Office Settings
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Configure automatic film production settings for your entertainment companies. Control investment amounts, project types, and production strategies with realistic Hollywood budgets.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6">
          {/* Budget Warning */}
          {!canAffordRealisticProduction && (
            <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 backdrop-blur-xl rounded-xl p-4 border border-orange-500/20">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">Insufficient Budget for Realistic Production</h3>
                  <p className="text-sm text-gray-600">
                    Need at least {formatCurrency(100000)} for documentary production. Consider taking a loan or increasing investment percentage.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Master Toggle */}
          <div className="bg-gradient-to-r from-white/15 to-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Zap className="w-6 h-6 text-blue-600" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Auto Production</h3>
                  <p className="text-sm text-gray-600">
                    Automatically start new projects when film companies are idle
                  </p>
                </div>
              </div>
              <Switch
                checked={localSettings.enabled}
                onCheckedChange={(enabled) => setLocalSettings(prev => ({ ...prev, enabled }))}
              />
            </div>
            
            {localSettings.enabled && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 p-4 bg-white/10 rounded-lg"
              >
                <div className="flex items-center space-x-2 text-sm text-green-600">
                  <TrendingUp className="w-4 h-4" />
                  <span>Auto Box Office is active with realistic Hollywood budgets</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Next budget estimate: {formatCurrency(estimatedBudget())} ({getRecommendedBudgetType(estimatedBudget())})
                </div>
              </motion.div>
            )}
          </div>

          {/* Financial Settings */}
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                Financial Controls
              </h3>
              
              <div className="space-y-6">
                {/* Cash Reserve */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    <Shield className="w-4 h-4 inline mr-2" />
                    Minimum Cash Reserve: {formatCurrency(localSettings.minCashReserve)}
                  </label>
                  <Slider
                    value={[localSettings.minCashReserve]}
                    onValueChange={([value]) => setLocalSettings(prev => ({ ...prev, minCashReserve: value }))}
                    min={0}
                    max={1000000} // Increased to $1M for realistic reserves
                    step={10000}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>$0</span>
                    <span>$1M</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    Keep this amount in reserve for operations and emergencies - auto-investment will only use excess cash
                  </p>
                </div>

                {/* Investment Percentage */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    <Target className="w-4 h-4 inline mr-2" />
                    Max Investment per Project: {(localSettings.maxInvestmentPercentage * 100).toFixed(0)}%
                  </label>
                  <Slider
                    value={[localSettings.maxInvestmentPercentage * 100]}
                    onValueChange={([value]) => setLocalSettings(prev => ({ ...prev, maxInvestmentPercentage: value / 100 }))}
                    min={5}
                    max={50} // Reduced max to 50% due to realistic budget requirements
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>5%</span>
                    <span>50%</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    Maximum percentage of available cash to invest in a single project (reduced for realistic budgets)
                  </p>
                </div>
              </div>
            </div>

            {/* Strategy Settings */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Investment Strategy</h3>
              
              <div className="space-y-6">
                {/* Preferred Project Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Preferred Project Type
                  </label>
                  <Select
                    value={localSettings.preferredProjectType}
                    onValueChange={(value: 'movie' | 'series' | 'documentary' | 'auto') => 
                      setLocalSettings(prev => ({ ...prev, preferredProjectType: value }))
                    }
                  >
                    <SelectTrigger className="w-full bg-white/20 border-white/30 backdrop-blur-sm">
                      {getProjectTypeIcon(localSettings.preferredProjectType)}
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">
                        <div className="flex items-center space-x-2">
                          <Shuffle className="w-4 h-4" />
                          <span>Auto-Select (Recommended)</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="movie">
                        <div className="flex items-center space-x-2">
                          <Film className="w-4 h-4" />
                          <span>Feature Films ($1M-300M)</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="series">
                        <div className="flex items-center space-x-2">
                          <Tv className="w-4 h-4" />
                          <span>TV Series ($500K-20M)</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="documentary">
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4" />
                          <span>Documentaries ($100K-5M)</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-600 mt-2">
                    {localSettings.preferredProjectType === 'auto' 
                      ? 'Automatically choose the best project type based on available budget and company experience'
                      : 'Always produce this type of project when auto-investing (budget permitting)'
                    }
                  </p>
                </div>

                {/* Investment Aggressiveness */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Investment Aggressiveness
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['conservative', 'balanced', 'aggressive'] as const).map((level) => (
                      <motion.div
                        key={level}
                        className={`p-4 rounded-lg border cursor-pointer transition-all ${
                          localSettings.aggressiveness === level
                            ? 'bg-blue-500/20 border-blue-500/40'
                            : 'bg-white/10 border-white/20 hover:bg-white/15'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => setLocalSettings(prev => ({ 
                          ...prev, 
                          aggressiveness: level
                        }))}
                      >
                        <div className="text-center">
                          <div className="text-sm font-medium text-gray-900 capitalize mb-1">
                            {level}
                          </div>
                          <div className={`w-full h-2 rounded-full ${
                            level === 'conservative' ? 'bg-green-400' :
                            level === 'balanced' ? 'bg-yellow-400' : 'bg-red-400'
                          } mb-2`} />
                          <div className="text-xs text-gray-600">
                            {level === 'conservative' ? '50%' :
                             level === 'balanced' ? '100%' : '200%'}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-600 mt-3">
                    {getAggressivenessDescription(localSettings.aggressiveness)}
                  </p>
                </div>
              </div>
            </div>

            {/* Realistic Budget Information */}
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl p-6 border border-purple-500/20">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Realistic Budget Guide</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div className="text-center p-3 bg-white/10 rounded-lg">
                  <Film className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                  <div className="font-medium text-gray-900">Feature Films</div>
                  <div className="text-xs text-gray-600 mt-1">
                    Indie: $1M-10M<br/>
                    Mid-Budget: $10M-75M<br/>
                    Blockbuster: $100M+
                  </div>
                </div>
                <div className="text-center p-3 bg-white/10 rounded-lg">
                  <Tv className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                  <div className="font-medium text-gray-900">TV Series</div>
                  <div className="text-xs text-gray-600 mt-1">
                    Cable: $500K-2M<br/>
                    Premium: $5M-10M<br/>
                    Prestige: $15M+
                  </div>
                </div>
                <div className="text-center p-3 bg-white/10 rounded-lg">
                  <FileText className="w-6 h-6 mx-auto mb-2 text-green-600" />
                  <div className="font-medium text-gray-900">Documentaries</div>
                  <div className="text-xs text-gray-600 mt-1">
                    Independent: $100K-500K<br/>
                    Network: $1M-2M<br/>
                    Major: $3M+
                  </div>
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-6 border border-blue-500/20">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Investment Preview</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-white/10 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Current Cash</div>
                  <div className="font-semibold text-gray-900">{formatCurrency(currentCash)}</div>
                </div>
                <div className="text-center p-3 bg-white/10 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Available for Investment</div>
                  <div className="font-semibold text-green-600">
                    {formatCurrency(Math.max(0, currentCash - localSettings.minCashReserve))}
                  </div>
                </div>
                <div className="text-center p-3 bg-white/10 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Next Project Budget</div>
                  <div className={`font-semibold ${canAffordRealisticProduction ? 'text-blue-600' : 'text-red-600'}`}>
                    {formatCurrency(estimatedBudget())}
                  </div>
                </div>
                <div className="text-center p-3 bg-white/10 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Project Type</div>
                  <div className="font-semibold text-gray-900">
                    {getRecommendedBudgetType(estimatedBudget())}
                  </div>
                </div>
              </div>

              {localSettings.enabled && canAffordRealisticProduction && (
                <div className="mt-4 p-3 bg-white/10 rounded-lg">
                  <div className="flex items-center space-x-2 text-sm">
                    <Badge className="bg-green-500 text-white">Ready</Badge>
                    <span className="text-gray-700">
                      Auto-investment will trigger when film companies are idle
                    </span>
                  </div>
                </div>
              )}

              {localSettings.enabled && !canAffordRealisticProduction && (
                <div className="mt-4 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                  <div className="flex items-center space-x-2 text-sm">
                    <Badge className="bg-red-500 text-white">Insufficient Budget</Badge>
                    <span className="text-gray-700">
                      Need more cash or increase investment percentage
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between space-x-4 pt-4 border-t border-white/20">
          <Button
            onClick={handleReset}
            variant="outline"
            className="bg-white/10 border-white/20 hover:bg-white/20"
          >
            Reset to Defaults
          </Button>
          <div className="flex space-x-3">
            <Button
              onClick={onClose}
              variant="outline"
              className="bg-white/10 border-white/20 hover:bg-white/20"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
            >
              Save Settings
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};