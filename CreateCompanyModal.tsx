import { useState } from 'react';
import { motion } from 'motion/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Industry } from '../hooks/useGameState';
import { Plus, Building } from 'lucide-react';

interface CreateCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  industries: Industry[];
  onCreateCompany: (industryId: string, companyName: string) => boolean;
  formatCurrency: (amount: number) => string;
  currentCash: number;
}

export const CreateCompanyModal = ({
  isOpen,
  onClose,
  industries,
  onCreateCompany,
  formatCurrency,
  currentCash
}: CreateCompanyModalProps) => {
  const [selectedIndustry, setSelectedIndustry] = useState<Industry | null>(null);
  const [companyName, setCompanyName] = useState('');

  const handleCreate = () => {
    if (selectedIndustry && companyName.trim()) {
      const success = onCreateCompany(selectedIndustry.id, companyName.trim());
      if (success) {
        setSelectedIndustry(null);
        setCompanyName('');
        onClose();
      }
    }
  };

  const canAffordIndustry = (industry: Industry) => currentCash >= industry.baseCost;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[95vw] bg-white/10 backdrop-blur-2xl border border-white/30 shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center text-2xl font-semibold text-gray-900">
            <Building className="w-6 h-6 mr-3" />
            Create New Company
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Choose an industry and give your company a name to start building your business empire. Each industry has different costs and income potential.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="space-y-6">
            {/* Industry Selection */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Your Industry</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {industries.map((industry) => (
                  <motion.div
                    key={industry.id}
                    className={`p-6 rounded-xl border cursor-pointer transition-all ${
                      selectedIndustry?.id === industry.id
                        ? 'bg-blue-500/20 border-blue-500/40'
                        : canAffordIndustry(industry)
                        ? 'bg-white/10 border-white/20 hover:bg-white/15'
                        : 'bg-gray-500/10 border-gray-500/20 opacity-50'
                    }`}
                    whileHover={{ scale: canAffordIndustry(industry) ? 1.02 : 1 }}
                    onClick={() => canAffordIndustry(industry) && setSelectedIndustry(industry)}
                  >
                    <div className="text-3xl mb-3 text-center">{industry.icon}</div>
                    <h4 className="font-semibold text-gray-900 mb-2 text-center">{industry.name}</h4>
                    <p className="text-sm text-gray-600 mb-4 text-center">{industry.description}</p>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Starting Cost:</span>
                        <span className={`font-semibold ${canAffordIndustry(industry) ? 'text-gray-900' : 'text-red-600'}`}>
                          {formatCurrency(industry.baseCost)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Base Income:</span>
                        <span className="font-semibold text-green-600">
                          {formatCurrency(industry.baseIncome)}/sec
                        </span>
                      </div>
                    </div>

                    {!canAffordIndustry(industry) && (
                      <div className="mt-3 text-xs text-red-600 text-center">
                        Insufficient funds
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Company Name Input */}
            {selectedIndustry && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Name Your Company</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Name
                    </label>
                    <Input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder={`My ${selectedIndustry.name}`}
                      className="w-full bg-white/20 border-white/30 backdrop-blur-sm"
                    />
                  </div>

                  <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
                    <h4 className="font-semibold text-gray-900 mb-2">Investment Summary</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Industry:</span>
                        <div className="font-medium text-gray-900">{selectedIndustry.name}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Initial Investment:</span>
                        <div className="font-medium text-red-600">{formatCurrency(selectedIndustry.baseCost)}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Starting Income:</span>
                        <div className="font-medium text-green-600">{formatCurrency(selectedIndustry.baseIncome)}/sec</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Ownership:</span>
                        <div className="font-medium text-gray-900">100%</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-white/20">
          <Button
            onClick={onClose}
            variant="outline"
            className="bg-white/10 border-white/20 hover:bg-white/20"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!selectedIndustry || !companyName.trim() || !canAffordIndustry(selectedIndustry)}
            className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white shadow-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Company
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};