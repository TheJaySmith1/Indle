import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Slider } from './ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Company, BoxOfficeProject } from '../hooks/useGameState';
import { 
  Film, 
  Play, 
  Trophy, 
  DollarSign, 
  Clock, 
  Star,
  TrendingUp,
  Award,
  Clapperboard,
  Tv,
  FileText
} from 'lucide-react';

interface BoxOfficeManagerProps {
  isOpen: boolean;
  onClose: () => void;
  filmCompanies: Company[];
  boxOfficeProjects: BoxOfficeProject[];
  currentCash: number;
  onStartProject: (companyId: string, budget: number, projectType: 'movie' | 'series' | 'documentary') => boolean;
  formatCurrency: (amount: number) => string;
}

type ProjectType = 'movie' | 'series' | 'documentary';

const PROJECT_TYPES: { type: ProjectType; name: string; icon: any; minBudget: number; maxBudget: number; description: string; examples: string }[] = [
  {
    type: 'movie',
    name: 'Feature Film',
    icon: Film,
    minBudget: 1000000, // $1M
    maxBudget: 300000000, // $300M
    description: 'Big screen blockbusters with highest earning potential',
    examples: 'Indie ($1M-10M) • Mid-budget ($10M-75M) • Blockbuster ($100M+)'
  },
  {
    type: 'series',
    name: 'TV Series',
    icon: Tv,
    minBudget: 500000, // $500K per episode/season
    maxBudget: 20000000, // $20M per season
    description: 'Streaming series with steady, reliable returns',
    examples: 'Cable TV ($500K-2M) • Premium TV ($5M-10M) • Prestige ($15M+)'
  },
  {
    type: 'documentary',
    name: 'Documentary',
    icon: FileText,
    minBudget: 100000, // $100K
    maxBudget: 5000000, // $5M
    description: 'Lower budget but critically acclaimed productions',
    examples: 'Independent ($100K-500K) • Network ($1M-2M) • Major ($3M+)'
  }
];

export const BoxOfficeManager = ({
  isOpen,
  onClose,
  filmCompanies,
  boxOfficeProjects,
  currentCash,
  onStartProject,
  formatCurrency
}: BoxOfficeManagerProps) => {
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [selectedProjectType, setSelectedProjectType] = useState<ProjectType>('movie');
  const [budget, setBudget] = useState(1000000);

  const selectedCompany = useMemo(() => 
    filmCompanies.find(c => c.id === selectedCompanyId), 
    [filmCompanies, selectedCompanyId]
  );

  const selectedProjectTypeInfo = PROJECT_TYPES.find(p => p.type === selectedProjectType);

  const companyProjects = useMemo(() => 
    boxOfficeProjects.filter(p => selectedCompanyId && p.companyId === selectedCompanyId),
    [boxOfficeProjects, selectedCompanyId]
  );

  const totalBoxOfficeEarnings = useMemo(() => 
    companyProjects.reduce((sum, p) => sum + p.grossEarnings, 0),
    [companyProjects]
  );

  const getProjectStatusColor = (status: string) => {
    switch (status) {
      case 'in-production': return 'bg-yellow-500';
      case 'released': return 'bg-green-500';
      case 'completed': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getOutcomeLabel = (earnings: number, budget: number) => {
    const multiplier = earnings / budget;
    if (multiplier >= 10) return { label: 'Legendary Hit', color: 'text-purple-600', icon: '🏆' };
    if (multiplier >= 5) return { label: 'Blockbuster', color: 'text-yellow-600', icon: '⭐' };
    if (multiplier >= 2) return { label: 'Hit', color: 'text-green-600', icon: '🎯' };
    if (multiplier >= 0.8) return { label: 'Moderate Success', color: 'text-blue-600', icon: '📈' };
    return { label: 'Box Office Flop', color: 'text-red-600', icon: '📉' };
  };

  const getBudgetCategory = (budget: number, projectType: ProjectType) => {
    switch (projectType) {
      case 'movie':
        if (budget < 10000000) return 'Independent';
        if (budget < 75000000) return 'Mid-Budget';
        return 'Blockbuster';
      case 'series':
        if (budget < 2000000) return 'Cable TV';
        if (budget < 10000000) return 'Premium TV';
        return 'Prestige Series';
      case 'documentary':
        if (budget < 500000) return 'Independent';
        if (budget < 2000000) return 'Network';
        return 'Major Production';
      default:
        return 'Standard';
    }
  };

  const canAffordProject = useMemo(() => 
    currentCash >= budget, 
    [currentCash, budget]
  );

  const handleStartProject = () => {
    if (selectedCompanyId && selectedProjectTypeInfo && canAffordProject) {
      const success = onStartProject(selectedCompanyId, budget, selectedProjectType);
      if (success) {
        setBudget(selectedProjectTypeInfo.minBudget);
      }
    }
  };

  // Set initial company selection when modal opens
  useState(() => {
    if (filmCompanies.length > 0 && !selectedCompanyId) {
      setSelectedCompanyId(filmCompanies[0].id);
    }
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-[95vw] bg-white/10 backdrop-blur-2xl border border-white/30 shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center text-2xl font-semibold text-gray-900">
            <Clapperboard className="w-6 h-6 mr-3" />
            Box Office Studio
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Manage your film and TV productions. Start new projects, track their progress, and monitor box office performance across all your entertainment companies.
          </DialogDescription>
        </DialogHeader>

        {filmCompanies.length === 0 ? (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Film className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Film Companies</h3>
            <p className="text-gray-600 mb-6">
              You need to create a Film & TV Production company to access box office features.
            </p>
            <Button onClick={onClose} variant="outline" className="bg-white/20 border-white/30">
              Close
            </Button>
          </motion.div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-6">
            {/* Company Selection */}
            <div className="bg-gradient-to-r from-white/15 to-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/30">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Production Company</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filmCompanies.map((company) => (
                  <motion.div
                    key={company.id}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      selectedCompanyId === company.id
                        ? 'bg-blue-500/20 border-blue-500/40'
                        : 'bg-white/10 border-white/20 hover:bg-white/15'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setSelectedCompanyId(company.id)}
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="text-2xl">{company.icon}</div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{company.name}</h4>
                        <p className="text-sm text-gray-600">Level {company.level}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-600">Movies: </span>
                        <span className="font-medium">{company.moviesProduced || 0}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Box Office: </span>
                        <span className="font-medium text-green-600">
                          {formatCurrency(company.totalBoxOfficeEarnings || 0)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {selectedCompany && (
              <>
                {/* Production Dashboard */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Play className="w-5 h-5 mr-2" />
                    Start New Production
                  </h3>
                  
                  {/* Project Type Selection */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {PROJECT_TYPES.map((projectType) => {
                      const Icon = projectType.icon;
                      return (
                        <motion.div
                          key={projectType.type}
                          className={`p-4 rounded-xl border cursor-pointer transition-all ${
                            selectedProjectType === projectType.type
                              ? 'bg-blue-500/20 border-blue-500/40'
                              : 'bg-white/10 border-white/20 hover:bg-white/15'
                          }`}
                          whileHover={{ scale: 1.02 }}
                          onClick={() => {
                            setSelectedProjectType(projectType.type);
                            setBudget(projectType.minBudget);
                          }}
                        >
                          <div className="flex items-center space-x-3 mb-2">
                            <Icon className="w-5 h-5" />
                            <h4 className="font-semibold text-gray-900">{projectType.name}</h4>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{projectType.description}</p>
                          <div className="text-xs text-gray-500 mb-2">
                            Budget: {formatCurrency(projectType.minBudget)} - {formatCurrency(projectType.maxBudget)}
                          </div>
                          <div className="text-xs text-gray-600">
                            {projectType.examples}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Budget Slider */}
                  {selectedProjectTypeInfo && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Production Budget: {formatCurrency(budget)}
                          <Badge className="ml-2 bg-blue-500/20 text-blue-700">
                            {getBudgetCategory(budget, selectedProjectType)}
                          </Badge>
                        </label>
                        <Slider
                          value={[budget]}
                          onValueChange={([value]) => setBudget(value)}
                          min={selectedProjectTypeInfo.minBudget}
                          max={selectedProjectTypeInfo.maxBudget}
                          step={selectedProjectTypeInfo.minBudget / 10}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>{formatCurrency(selectedProjectTypeInfo.minBudget)}</span>
                          <span>{formatCurrency(selectedProjectTypeInfo.maxBudget)}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="text-center p-3 bg-white/10 rounded-lg">
                          <div className="text-xs text-gray-600 mb-1">Budget</div>
                          <div className="text-sm font-semibold text-red-600">
                            {formatCurrency(budget)}
                          </div>
                        </div>
                        <div className="text-center p-3 bg-white/10 rounded-lg">
                          <div className="text-xs text-gray-600 mb-1">Production Time</div>
                          <div className="text-sm font-semibold text-blue-600">
                            {selectedProjectType === 'movie' ? '15s' : selectedProjectType === 'series' ? '25s' : '10s'}
                          </div>
                        </div>
                        <div className="text-center p-3 bg-white/10 rounded-lg">
                          <div className="text-xs text-gray-600 mb-1">Success Bonus</div>
                          <div className="text-sm font-semibold text-gray-900">
                            +{(selectedCompany.level * 5)}%
                          </div>
                        </div>
                        <div className="text-center p-3 bg-white/10 rounded-lg">
                          <div className="text-xs text-gray-600 mb-1">Max Potential</div>
                          <div className="text-sm font-semibold text-green-600">
                            {formatCurrency(budget * 15)}
                          </div>
                        </div>
                      </div>

                      <Button
                        onClick={handleStartProject}
                        disabled={!canAffordProject}
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-lg"
                      >
                        {canAffordProject ? (
                          <>
                            <Film className="w-4 h-4 mr-2" />
                            Start Production ({formatCurrency(budget)})
                          </>
                        ) : (
                          <>
                            <DollarSign className="w-4 h-4 mr-2" />
                            Insufficient Funds
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>

                {/* Company Projects */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <Trophy className="w-5 h-5 mr-2" />
                      {selectedCompany.name} Productions
                    </h3>
                    {companyProjects.length > 0 && (
                      <Badge className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
                        Total: {formatCurrency(totalBoxOfficeEarnings)}
                      </Badge>
                    )}
                  </div>

                  {companyProjects.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {companyProjects.map((project) => {
                        const outcome = project.status === 'released' ? getOutcomeLabel(project.grossEarnings, project.budget) : null;
                        const Icon = PROJECT_TYPES.find(p => p.type === project.type)?.icon || Film;
                        const timeRemaining = project.status === 'in-production' 
                          ? Math.max(0, project.releaseDate - Date.now())
                          : 0;
                        const budgetCategory = getBudgetCategory(project.budget, project.type);
                        
                        return (
                          <motion.div
                            key={project.id}
                            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            layout
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center space-x-3">
                                <Icon className="w-6 h-6" />
                                <div>
                                  <h4 className="font-semibold text-gray-900">{project.title}</h4>
                                  <p className="text-sm text-gray-600 capitalize">{project.genre} {project.type}</p>
                                  <div className="flex items-center space-x-2 mt-1">
                                    <Badge className="bg-purple-500/20 text-purple-700 text-xs">
                                      {budgetCategory}
                                    </Badge>
                                    {project.isAutoGenerated && (
                                      <Badge className="bg-blue-500/20 text-blue-700 text-xs">
                                        Auto-Generated
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <Badge className={`${getProjectStatusColor(project.status)} text-white`}>
                                {project.status.replace('-', ' ')}
                              </Badge>
                            </div>

                            {project.status === 'in-production' && (
                              <div className="mb-4">
                                <div className="flex justify-between text-sm text-gray-600 mb-2">
                                  <span>Production Progress</span>
                                  <span>
                                    <Clock className="w-3 h-3 inline mr-1" />
                                    {Math.ceil(timeRemaining / 1000)}s remaining
                                  </span>
                                </div>
                                <Progress 
                                  value={((project.productionTime - timeRemaining) / project.productionTime) * 100} 
                                  className="h-2 bg-white/20" 
                                />
                              </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                              <div className="text-center">
                                <div className="text-xs text-gray-600 mb-1">Budget</div>
                                <div className="text-sm font-semibold text-red-600">
                                  {formatCurrency(project.budget)}
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-xs text-gray-600 mb-1">Box Office</div>
                                <div className={`text-sm font-semibold ${
                                  project.grossEarnings > project.budget ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {formatCurrency(project.grossEarnings)}
                                </div>
                              </div>
                            </div>

                            {outcome && (
                              <div className="mt-4 p-3 bg-white/10 rounded-lg text-center">
                                <div className={`font-semibold ${outcome.color} flex items-center justify-center`}>
                                  <span className="mr-2">{outcome.icon}</span>
                                  {outcome.label}
                                </div>
                                <div className="text-xs text-gray-600 mt-1">
                                  {((project.grossEarnings / project.budget) * 100 - 100).toFixed(0)}% return
                                </div>
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  ) : (
                    <motion.div
                      className="text-center py-12 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <Film className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">No Productions Yet</h4>
                      <p className="text-gray-600">
                        Start your first production project with {selectedCompany.name}!
                      </p>
                    </motion.div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};