import { useState } from 'react';
import { motion } from 'motion/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { SaveSlot, SaveStatus } from '../hooks/useGameState';
import { 
  Save, 
  Download, 
  Upload, 
  Trash2, 
  Plus, 
  Clock, 
  Building,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface SaveManagerProps {
  isOpen: boolean;
  onClose: () => void;
  saveStatus: SaveStatus;
  currentSaveSlot: string;
  saveSlots: SaveSlot[];
  onManualSave: (slotId?: string) => void;
  onLoadSave: (slotId: string) => boolean;
  onDeleteSave: (slotId: string) => boolean;
  onExportSave: (slotId?: string) => boolean | null;
  onImportSave: (file: File) => Promise<boolean>;
  onNewGame: () => void;
  formatCurrency: (amount: number) => string;
  formatPlayTime: (seconds: number) => string;
}

export const SaveManager = ({
  isOpen,
  onClose,
  saveStatus,
  currentSaveSlot,
  saveSlots,
  onManualSave,
  onLoadSave,
  onDeleteSave,
  onExportSave,
  onImportSave,
  onNewGame,
  formatCurrency,
  formatPlayTime
}: SaveManagerProps) => {
  const [newSlotName, setNewSlotName] = useState('');
  const [isCreatingSlot, setIsCreatingSlot] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);

  const handleCreateNewSlot = () => {
    if (newSlotName.trim()) {
      const timestamp = Date.now().toString();
      onManualSave(timestamp);
      setNewSlotName('');
      setIsCreatingSlot(false);
    }
  };

  const handleFileImport = async () => {
    if (importFile) {
      const success = await onImportSave(importFile);
      if (success) {
        setImportFile(null);
      }
    }
  };

  const getSaveStatusIcon = (status: SaveStatus) => {
    switch (status) {
      case 'saving': return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'saved': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-600" />;
      default: return <Save className="w-4 h-4" />;
    }
  };

  const getSaveStatusText = (status: SaveStatus) => {
    switch (status) {
      case 'saving': return 'Saving...';
      case 'saved': return 'Saved';
      case 'error': return 'Save Error';
      default: return 'Save Game';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[95vw] bg-white/10 backdrop-blur-2xl border border-white/30 shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center text-2xl font-semibold text-gray-900">
            <Save className="w-6 h-6 mr-3" />
            Save Manager
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Manage your game saves with multiple slots, auto-save functionality, and import/export options. Your progress is automatically saved every 10 seconds.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6">
          {/* Quick Actions */}
          <div className="bg-gradient-to-r from-white/15 to-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/30">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => onManualSave()}
                disabled={saveStatus === 'saving'}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                {getSaveStatusIcon(saveStatus)}
                <span className="ml-2">{getSaveStatusText(saveStatus)}</span>
              </Button>
              
              <Button
                onClick={onNewGame}
                variant="outline"
                className="bg-red-500/10 border-red-500/20 hover:bg-red-500/20 text-red-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Game
              </Button>

              <Button
                onClick={() => setIsCreatingSlot(true)}
                variant="outline"
                className="bg-green-500/10 border-green-500/20 hover:bg-green-500/20 text-green-700"
              >
                <Save className="w-4 h-4 mr-2" />
                Create New Slot
              </Button>

              <Button
                onClick={() => onExportSave()}
                variant="outline"
                className="bg-white/10 border-white/20 hover:bg-white/20"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Current
              </Button>
            </div>
          </div>

          {/* Create New Slot */}
          {isCreatingSlot && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Save Slot</h3>
              <div className="flex space-x-3">
                <Input
                  type="text"
                  value={newSlotName}
                  onChange={(e) => setNewSlotName(e.target.value)}
                  placeholder="Save slot name..."
                  className="flex-1 bg-white/20 border-white/30 backdrop-blur-sm"
                />
                <Button
                  onClick={handleCreateNewSlot}
                  disabled={!newSlotName.trim()}
                  className="bg-green-500 hover:bg-green-600 text-white"
                >
                  Create
                </Button>
                <Button
                  onClick={() => {
                    setIsCreatingSlot(false);
                    setNewSlotName('');
                  }}
                  variant="outline"
                  className="bg-white/10 border-white/20 hover:bg-white/20"
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          )}

          {/* Import Section */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Import Save</h3>
            <div className="flex space-x-3">
              <Input
                type="file"
                accept=".json"
                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                className="flex-1 bg-white/20 border-white/30 backdrop-blur-sm"
              />
              <Button
                onClick={handleFileImport}
                disabled={!importFile}
                className="bg-purple-500 hover:bg-purple-600 text-white"
              >
                <Upload className="w-4 h-4 mr-2" />
                Import
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Select a .json save file exported from Entrepreneur Empire
            </p>
          </div>

          {/* Save Slots */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Save Slots ({saveSlots.length})</h3>
              <Badge variant="secondary" className="text-sm">
                Auto-save: Every 10s
              </Badge>
            </div>

            {saveSlots.length === 0 ? (
              <motion.div
                className="text-center py-12 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Save className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h4 className="text-lg font-semibold text-gray-900 mb-2">No Save Slots</h4>
                <p className="text-gray-600">
                  Create your first save slot or continue with the main save file.
                </p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {saveSlots.map((slot) => (
                  <motion.div
                    key={slot.id}
                    className={`p-6 rounded-xl border transition-all ${
                      currentSaveSlot === slot.id
                        ? 'bg-blue-500/20 border-blue-500/40'
                        : 'bg-white/10 border-white/20 hover:bg-white/15'
                    }`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    layout
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 flex items-center">
                          {slot.name}
                          {currentSaveSlot === slot.id && (
                            <Badge className="ml-2 bg-blue-500 text-white text-xs">
                              Current
                            </Badge>
                          )}
                        </h4>
                        <div className="text-sm text-gray-600 flex items-center mt-1">
                          <Clock className="w-3 h-3 mr-1" />
                          Last played: {new Date(slot.lastPlayed).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(slot.netWorth)}
                        </div>
                        <div className="text-xs text-gray-600">Net Worth</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Building className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">Companies:</span>
                        <span className="font-medium text-gray-900">{slot.companies}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">Play Time:</span>
                        <span className="font-medium text-gray-900">{formatPlayTime(slot.playTime)}</span>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      {currentSaveSlot !== slot.id && (
                        <Button
                          onClick={() => onLoadSave(slot.id)}
                          size="sm"
                          className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                        >
                          Load
                        </Button>
                      )}
                      
                      <Button
                        onClick={() => onExportSave(slot.id)}
                        size="sm"
                        variant="outline"
                        className="flex-1 bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20 text-blue-700"
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Export
                      </Button>

                      {slot.id !== 'main' && (
                        <Button
                          onClick={() => onDeleteSave(slot.id)}
                          size="sm"
                          variant="outline"
                          className="bg-red-500/10 border-red-500/20 hover:bg-red-500/20 text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-white/20">
          <Button
            onClick={onClose}
            className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};