import { motion } from 'motion/react';
import { Button } from './ui/button';
import { SaveStatus } from '../hooks/useGameState';
import { Save, CheckCircle, AlertCircle, Loader } from 'lucide-react';

interface StatsHeaderProps {
  cash: number;
  totalNetWorth: number;
  totalIncome: number;
  formatCurrency: (amount: number) => string;
  saveStatus: SaveStatus;
  onOpenSaveManager: () => void;
}

export const StatsHeader = ({ 
  cash, 
  totalNetWorth, 
  totalIncome, 
  formatCurrency,
  saveStatus,
  onOpenSaveManager
}: StatsHeaderProps) => {
  const getSaveIcon = () => {
    switch (saveStatus) {
      case 'saving':
        return <Loader className="w-4 h-4 animate-spin text-blue-600" />;
      case 'saved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Save className="w-4 h-4 text-gray-600" />;
    }
  };

  const getSaveStatusColor = () => {
    switch (saveStatus) {
      case 'saving':
        return 'text-blue-600';
      case 'saved':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <motion.div 
      className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-6xl px-4"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="bg-white/20 backdrop-blur-xl rounded-2xl border border-white/30 shadow-2xl px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 sm:gap-8 flex-1 min-w-0">
            <motion.div 
              className="text-center min-w-0"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-xs text-gray-600 uppercase tracking-wide mb-1">Cash</div>
              <div className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 break-words">
                {formatCurrency(cash)}
              </div>
            </motion.div>
            
            <motion.div 
              className="text-center min-w-0"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-xs text-gray-600 uppercase tracking-wide mb-1">Net Worth</div>
              <div className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 break-words">
                {formatCurrency(totalNetWorth)}
              </div>
            </motion.div>
            
            <motion.div 
              className="text-center min-w-0"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-xs text-gray-600 uppercase tracking-wide mb-1">Income/sec</div>
              <div className="text-sm sm:text-base lg:text-lg font-semibold text-green-600 break-words">
                +{formatCurrency(totalIncome)}
              </div>
            </motion.div>
          </div>

          {/* Save Manager */}
          <div className="ml-4 flex items-center space-x-3">
            {/* Save Status Indicator */}
            <div className="hidden sm:flex items-center space-x-2">
              {getSaveIcon()}
              <span className={`text-xs font-medium ${getSaveStatusColor()}`}>
                {saveStatus === 'saving' && 'Saving...'}
                {saveStatus === 'saved' && 'Saved'}
                {saveStatus === 'error' && 'Error'}
                {saveStatus === 'idle' && 'Auto-save'}
              </span>
            </div>

            {/* Save Manager Button */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={onOpenSaveManager}
                size="sm"
                variant="outline"
                className="bg-white/20 border-white/30 hover:bg-white/30 text-gray-900 backdrop-blur-sm"
              >
                <Save className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Saves</span>
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};