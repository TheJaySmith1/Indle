import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Slider } from './ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Loan, LoanOffer } from '../hooks/useGameState';
import { 
  DollarSign, 
  TrendingDown, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  CreditCard,
  Calculator,
  Building2,
  Zap
} from 'lucide-react';

interface LoanManagerProps {
  isOpen: boolean;
  onClose: () => void;
  loans: Loan[];
  loanOffers: LoanOffer[];
  creditScore: number;
  currentCash: number;
  onTakeLoan: (loanType: 'small' | 'medium' | 'large' | 'emergency', amount: number) => boolean;
  onRepayLoan: (loanId: string, amount?: number) => void;
  formatCurrency: (amount: number) => string;
  getCreditScoreLabel: (score: number) => string;
}

export const LoanManager = ({
  isOpen,
  onClose,
  loans,
  loanOffers,
  creditScore,
  currentCash,
  onTakeLoan,
  onRepayLoan,
  formatCurrency,
  getCreditScoreLabel
}: LoanManagerProps) => {
  const [selectedLoanType, setSelectedLoanType] = useState<'small' | 'medium' | 'large' | 'emergency'>('small');
  const [loanAmount, setLoanAmount] = useState(1000);

  const activeLoans = useMemo(() => loans.filter(l => l.status === 'active'), [loans]);
  const totalDebt = useMemo(() => activeLoans.reduce((sum, loan) => sum + loan.amount, 0), [activeLoans]);
  const totalMonthlyPayments = useMemo(() => activeLoans.reduce((sum, loan) => sum + loan.monthlyPayment, 0), [activeLoans]);

  const selectedOffer = loanOffers.find(o => o.type === selectedLoanType);
  
  const creditMultiplier = useMemo(() => {
    return Math.max(0.5, Math.min(2, (850 - creditScore) / 350));
  }, [creditScore]);

  const adjustedInterestRate = useMemo(() => {
    if (!selectedOffer) return 0;
    return selectedOffer.baseInterestRate * (1 + creditMultiplier * 0.5);
  }, [selectedOffer, creditMultiplier]);

  const monthlyPayment = useMemo(() => {
    if (!selectedOffer) return 0;
    const rate = adjustedInterestRate / 12;
    return loanAmount * rate / (1 - Math.pow(1 + rate, -selectedOffer.termMonths));
  }, [loanAmount, adjustedInterestRate, selectedOffer]);

  const canQualify = useMemo(() => {
    if (!selectedOffer) return false;
    return creditScore >= selectedOffer.creditScoreRequired;
  }, [creditScore, selectedOffer]);

  const handleTakeLoan = () => {
    if (selectedOffer && canQualify && loanAmount >= selectedOffer.minAmount && loanAmount <= selectedOffer.maxAmount) {
      const success = onTakeLoan(selectedLoanType, loanAmount);
      if (success) {
        setLoanAmount(selectedOffer.minAmount);
      }
    }
  };

  const getCreditScoreColor = (score: number) => {
    if (score >= 800) return 'text-green-600';
    if (score >= 740) return 'text-blue-600';
    if (score >= 670) return 'text-yellow-600';
    if (score >= 580) return 'text-orange-600';
    return 'text-red-600';
  };

  const getLoanTypeIcon = (type: string) => {
    switch (type) {
      case 'small': return <Building2 className="w-5 h-5" />;
      case 'medium': return <TrendingDown className="w-5 h-5" />;
      case 'large': return <DollarSign className="w-5 h-5" />;
      case 'emergency': return <Zap className="w-5 h-5" />;
      default: return <CreditCard className="w-5 h-5" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl w-[95vw] h-[90vh] bg-white/10 backdrop-blur-2xl border border-white/30 shadow-2xl flex flex-col">
        <DialogHeader className="flex-shrink-0 pb-4">
          <DialogTitle className="flex items-center text-2xl font-semibold text-gray-900">
            <CreditCard className="w-6 h-6 mr-3" />
            Loan Center
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Access business financing options to grow your empire. Apply for loans, manage existing debt, and track your credit score to unlock better terms.
          </DialogDescription>
        </DialogHeader>

        {/* Credit Score Header */}
        <div className="flex-shrink-0 mb-6 bg-gradient-to-r from-white/15 to-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/30">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Credit Profile</h3>
              <p className="text-sm text-gray-600">Your creditworthiness affects loan terms</p>
            </div>
            <div className="text-right">
              <div className={`text-2xl font-bold ${getCreditScoreColor(creditScore)}`}>
                {creditScore}
              </div>
              <div className="text-sm text-gray-600">
                {getCreditScoreLabel(creditScore)}
              </div>
            </div>
          </div>
          <div className="w-full bg-white/20 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-300 ${
                creditScore >= 800 ? 'bg-green-500' :
                creditScore >= 740 ? 'bg-blue-500' :
                creditScore >= 670 ? 'bg-yellow-500' :
                creditScore >= 580 ? 'bg-orange-500' : 'bg-red-500'
              }`}
              style={{ width: `${((creditScore - 300) / 550) * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>300</span>
            <span>850</span>
          </div>
        </div>

        <Tabs defaultValue="take-loan" className="flex-1 flex flex-col min-h-0">
          <TabsList className="flex-shrink-0 grid w-full grid-cols-2 bg-white/20 backdrop-blur-sm">
            <TabsTrigger value="take-loan" className="data-[state=active]:bg-white/30">
              Apply for Loan
            </TabsTrigger>
            <TabsTrigger value="manage-loans" className="data-[state=active]:bg-white/30">
              Manage Loans ({activeLoans.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="take-loan" className="flex-1 mt-6 overflow-y-auto">
            <div className="space-y-6 pr-2">
              {/* Loan Type Selection */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Loan Type</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {loanOffers.map((offer) => (
                    <motion.div
                      key={offer.type}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        selectedLoanType === offer.type
                          ? 'bg-blue-500/20 border-blue-500/40'
                          : 'bg-white/10 border-white/20 hover:bg-white/15'
                      } ${creditScore < offer.creditScoreRequired ? 'opacity-50' : ''}`}
                      whileHover={{ scale: creditScore >= offer.creditScoreRequired ? 1.02 : 1 }}
                      onClick={() => {
                        if (creditScore >= offer.creditScoreRequired) {
                          setSelectedLoanType(offer.type);
                          setLoanAmount(offer.minAmount);
                        }
                      }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          {getLoanTypeIcon(offer.type)}
                          <div>
                            <h4 className="font-semibold text-gray-900">{offer.name}</h4>
                            <p className="text-sm text-gray-600">{offer.description}</p>
                          </div>
                        </div>
                        {creditScore < offer.creditScoreRequired && (
                          <AlertTriangle className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-600">Amount: </span>
                          <span className="font-medium">{formatCurrency(offer.minAmount)}-{formatCurrency(offer.maxAmount)}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Base Rate: </span>
                          <span className="font-medium">{(offer.baseInterestRate * 100).toFixed(1)}%</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Term: </span>
                          <span className="font-medium">{offer.termMonths} months</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Credit Required: </span>
                          <span className="font-medium">{offer.creditScoreRequired}+</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Loan Calculator */}
              {selectedOffer && (
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Calculator className="w-5 h-5 mr-2" />
                    Loan Calculator
                  </h3>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Loan Amount: {formatCurrency(loanAmount)}
                      </label>
                      <Slider
                        value={[loanAmount]}
                        onValueChange={([value]) => setLoanAmount(value)}
                        min={selectedOffer.minAmount}
                        max={selectedOffer.maxAmount}
                        step={selectedOffer.minAmount / 10}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>{formatCurrency(selectedOffer.minAmount)}</span>
                        <span>{formatCurrency(selectedOffer.maxAmount)}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-white/10 rounded-lg">
                        <div className="text-xs text-gray-600 mb-1">Interest Rate</div>
                        <div className="text-sm font-semibold text-gray-900">
                          {(adjustedInterestRate * 100).toFixed(2)}%
                        </div>
                      </div>
                      <div className="text-center p-3 bg-white/10 rounded-lg">
                        <div className="text-xs text-gray-600 mb-1">Monthly Payment</div>
                        <div className="text-sm font-semibold text-red-600">
                          {formatCurrency(monthlyPayment)}
                        </div>
                      </div>
                      <div className="text-center p-3 bg-white/10 rounded-lg">
                        <div className="text-xs text-gray-600 mb-1">Total Cost</div>
                        <div className="text-sm font-semibold text-gray-900">
                          {formatCurrency(monthlyPayment * selectedOffer.termMonths)}
                        </div>
                      </div>
                      <div className="text-center p-3 bg-white/10 rounded-lg">
                        <div className="text-xs text-gray-600 mb-1">Interest Paid</div>
                        <div className="text-sm font-semibold text-orange-600">
                          {formatCurrency(monthlyPayment * selectedOffer.termMonths - loanAmount)}
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={handleTakeLoan}
                      disabled={!canQualify}
                      className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white shadow-lg"
                    >
                      {canQualify ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Apply for {formatCurrency(loanAmount)} Loan
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-4 h-4 mr-2" />
                          Credit Score Too Low
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="manage-loans" className="flex-1 mt-6 overflow-y-auto">
            <div className="space-y-6 pr-2">
              {/* Debt Summary */}
              {activeLoans.length > 0 && (
                <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-xl p-6 border border-red-500/20">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Debt Summary</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-sm text-gray-600 mb-1">Total Debt</div>
                      <div className="text-xl font-semibold text-red-600">
                        {formatCurrency(totalDebt)}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600 mb-1">Monthly Payments</div>
                      <div className="text-xl font-semibold text-orange-600">
                        {formatCurrency(totalMonthlyPayments)}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600 mb-1">Active Loans</div>
                      <div className="text-xl font-semibold text-gray-900">
                        {activeLoans.length}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Active Loans */}
              <div className="space-y-4">
                {activeLoans.map((loan) => (
                  <motion.div
                    key={loan.id}
                    className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          {getLoanTypeIcon(loan.loanType)}
                          <h4 className="font-semibold text-gray-900">
                            {loanOffers.find(o => o.type === loan.loanType)?.name || 'Loan'}
                          </h4>
                          <Badge variant={loan.missedPayments > 0 ? 'destructive' : 'secondary'}>
                            {loan.missedPayments > 0 ? `${loan.missedPayments} Missed` : 'Current'}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          Taken on {new Date(loan.takenDate).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-red-600">
                          {formatCurrency(loan.amount)}
                        </div>
                        <div className="text-sm text-gray-600">
                          of {formatCurrency(loan.originalAmount)}
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Progress</span>
                        <span>{loan.totalPayments - loan.remainingPayments} / {loan.totalPayments} payments</span>
                      </div>
                      <Progress 
                        value={((loan.totalPayments - loan.remainingPayments) / loan.totalPayments) * 100} 
                        className="h-2 bg-white/20" 
                      />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                      <div className="text-center">
                        <div className="text-xs text-gray-600 mb-1">Interest Rate</div>
                        <div className="text-sm font-medium">{(loan.interestRate * 100).toFixed(2)}%</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-gray-600 mb-1">Monthly Payment</div>
                        <div className="text-sm font-medium text-red-600">
                          {formatCurrency(loan.monthlyPayment)}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-gray-600 mb-1">Remaining</div>
                        <div className="text-sm font-medium">{loan.remainingPayments} months</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-gray-600 mb-1">Next Payment</div>
                        <div className="text-sm font-medium">
                          <Clock className="w-3 h-3 inline mr-1" />
                          30 days
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <Button
                        onClick={() => onRepayLoan(loan.id)}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
                        disabled={currentCash < loan.monthlyPayment}
                      >
                        Pay {formatCurrency(loan.monthlyPayment)}
                      </Button>
                      <Button
                        onClick={() => onRepayLoan(loan.id, loan.amount)}
                        variant="outline"
                        className="flex-1 bg-green-500/10 border-green-500/20 hover:bg-green-500/20 text-green-700"
                        disabled={currentCash < loan.amount}
                      >
                        Pay Off ({formatCurrency(loan.amount)})
                      </Button>
                    </div>
                  </motion.div>
                ))}

                {activeLoans.length === 0 && (
                  <motion.div
                    className="text-center py-12"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Loans</h3>
                    <p className="text-gray-600">You're debt-free! Consider applying for a loan to grow your business.</p>
                  </motion.div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};