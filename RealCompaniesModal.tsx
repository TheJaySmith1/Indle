import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { RealCompanyCard } from './RealCompanyCard';
import { RealCompany } from '../hooks/useGameState';
import { Star, TrendingUp, Building } from 'lucide-react';

interface RealCompaniesModalProps {
  isOpen: boolean;
  onClose: () => void;
  realCompanies: RealCompany[];
  onBuyShares: (companyId: string, percentage: number) => void;
  onSellShares: (companyId: string, percentage: number) => void;
  formatCurrency: (amount: number) => string;
  currentCash: number;
}

export const RealCompaniesModal = ({
  isOpen,
  onClose,
  realCompanies,
  onBuyShares,
  onSellShares,
  formatCurrency,
  currentCash
}: RealCompaniesModalProps) => {
  const [selectedTab, setSelectedTab] = useState<'all' | 'owned'>('all');

  const ownedCompanies = useMemo(() => 
    realCompanies.filter(company => company.sharesOwned > 0),
    [realCompanies]
  );

  const availableCompanies = useMemo(() => 
    realCompanies.filter(company => company.sharesOwned < 100),
    [realCompanies]
  );

  const portfolioValue = useMemo(() =>
    ownedCompanies.reduce((total, company) => 
      total + (company.marketValue * company.sharesOwned / 100), 0
    ),
    [ownedCompanies]
  );

  const totalShares = useMemo(() =>
    ownedCompanies.reduce((total, company) => total + company.sharesOwned, 0),
    [ownedCompanies]
  );

  const dailyIncome = useMemo(() =>
    ownedCompanies.reduce((total, company) => 
      total + (company.currentIncome * company.sharesOwned / 100 * 86400), 0
    ),
    [ownedCompanies]
  );

  const groupedCompanies = useMemo(() => {
    const companies = selectedTab === 'owned' ? ownedCompanies : availableCompanies;
    const groups: Record<string, RealCompany[]> = {};
    
    companies.forEach(company => {
      if (!groups[company.industry]) {
        groups[company.industry] = [];
      }
      groups[company.industry].push(company);
    });
    
    return groups;
  }, [selectedTab, ownedCompanies, availableCompanies]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-[95vw] bg-white/10 backdrop-blur-2xl border border-white/30 shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center text-2xl font-semibold text-gray-900">
            <Star className="w-6 h-6 mr-3 text-yellow-500" />
            Real Companies Market
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Invest in shares of real-world companies. Buy and sell partial ownership to diversify your portfolio and earn passive income from established businesses.
          </DialogDescription>
        </DialogHeader>

        {ownedCompanies.length > 0 && (
          <div className="mb-6 bg-gradient-to-r from-white/15 to-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/30">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Portfolio Summary
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-1">Total Value</div>
                <div className="text-lg font-semibold text-gray-900">
                  {formatCurrency(portfolioValue)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-1">Daily Income</div>
                <div className="text-lg font-semibold text-green-600">
                  +{formatCurrency(dailyIncome)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-1">Companies</div>
                <div className="text-lg font-semibold text-blue-600">
                  {ownedCompanies.length}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-1">Total Shares</div>
                <div className="text-lg font-semibold text-gray-900">
                  {totalShares.toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        )}

        <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as 'all' | 'owned')} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2 bg-white/20 backdrop-blur-sm">
            <TabsTrigger value="all" className="data-[state=active]:bg-white/30">
              <Building className="w-4 h-4 mr-2" />
              All Companies ({availableCompanies.length})
            </TabsTrigger>
            <TabsTrigger value="owned" className="data-[state=active]:bg-white/30">
              <Star className="w-4 h-4 mr-2" />
              My Portfolio ({ownedCompanies.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="flex-1 overflow-y-auto mt-6">
            {Object.entries(groupedCompanies).map(([industry, companies]) => (
              <div key={industry} className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 sticky top-0 bg-white/20 backdrop-blur-sm p-3 rounded-lg border border-white/30">
                  {industry} ({companies.length})
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {companies.map((company) => (
                    <motion.div
                      key={company.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <RealCompanyCard
                        company={company}
                        onBuyShares={onBuyShares}
                        onSellShares={onSellShares}
                        formatCurrency={formatCurrency}
                        currentCash={currentCash}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}

            {availableCompanies.length === 0 && (
              <motion.div
                className="text-center py-16"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Star className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">All Companies Fully Owned</h3>
                <p className="text-gray-600">
                  You own 100% shares in all available companies. Check back later for new opportunities!
                </p>
              </motion.div>
            )}
          </TabsContent>

          <TabsContent value="owned" className="flex-1 overflow-y-auto mt-6">
            {ownedCompanies.length > 0 ? (
              Object.entries(groupedCompanies).map(([industry, companies]) => (
                <div key={industry} className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 sticky top-0 bg-white/20 backdrop-blur-sm p-3 rounded-lg border border-white/30">
                    {industry} ({companies.length})
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {companies.map((company) => (
                      <motion.div
                        key={company.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <RealCompanyCard
                          company={company}
                          onBuyShares={onBuyShares}
                          onSellShares={onSellShares}
                          formatCurrency={formatCurrency}
                          currentCash={currentCash}
                        />
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <motion.div
                className="text-center py-16"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Star className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Investments Yet</h3>
                <p className="text-gray-600 mb-6">
                  Start building your portfolio by investing in real companies from the "All Companies" tab.
                </p>
                <Button
                  onClick={() => setSelectedTab('all')}
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
                >
                  <Star className="w-4 h-4 mr-2" />
                  Browse Companies
                </Button>
              </motion.div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};