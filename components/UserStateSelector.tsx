import React, { useState } from 'react';
import { MapPin } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { states } from '@/data/states';
import { useUserProfile } from '@/contexts/UserProfileContext';

interface UserStateSelectorProps {
  isButton?: boolean;
  externalOpen?: boolean;
  onExternalOpenChange?: (open: boolean) => void;
}

// Helper function to get flag image path from state ID
const getFlagImagePath = (stateId: string): string => {
  // Map state IDs to flag filenames
  const flagMapping: Record<string, string> = {
    'negerisembilan': 'negeri-sembilan',
    'malacca': 'melaka',
    'kualalumpur': 'kuala-lumpur', // Note: there's no KL flag, so it might not exist
    'penang': 'penang',
  };

  const flagName = flagMapping[stateId] || stateId;
  return `/images/flags/${flagName}.png`;
};

const UserStateSelector: React.FC<UserStateSelectorProps> = ({ 
  isButton = false, 
  externalOpen,
  onExternalOpenChange 
}) => {
  const { selectedState, setSelectedState, showStateSelector, setShowStateSelector } = useUserProfile();
  const [internalOpen, setInternalOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [tempSelectedState, setTempSelectedState] = useState<string | null>(selectedState);

  const selectedStateData = states.find(state => state.id === selectedState);

  // Use external open if provided, otherwise use internal
  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = (externalOpen !== undefined && onExternalOpenChange) ? onExternalOpenChange : setInternalOpen;

  const handleStateSelect = (stateId: string) => {
    setTempSelectedState(stateId);
  };

  const handleSaveState = () => {
    if (tempSelectedState) {
      setSelectedState(tempSelectedState);
      setOpen(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    // If closing the initial state selector dialog, mark it as shown
    if (!newOpen && showStateSelector) {
      setShowStateSelector(false);
    }
  };

  // Reset image error when selected state changes
  React.useEffect(() => {
    setImageError(false);
  }, [selectedState]);

  // Sync temp state with selected state when it changes
  React.useEffect(() => {
    setTempSelectedState(selectedState);
  }, [selectedState]);

  // Auto-open dialog if showStateSelector is true (after login without state)
  React.useEffect(() => {
    if (showStateSelector && externalOpen === undefined) {
      setInternalOpen(true);
    }
  }, [showStateSelector, externalOpen]);

  if (isButton) {
    return (
      <>
        <button
          onClick={() => setOpen(true)}
          className="cursor-pointer relative p-2 rounded-lg shadow-md bg-zinc-800 dark:bg-zinc-200 hover:bg-zinc-900 dark:hover:bg-zinc-300 transition-colors duration-200 flex items-center gap-2"
          aria-label="Select your state"
          title={selectedStateData ? selectedStateData.name : 'Select your state'}
        >
          {selectedState && selectedStateData ? (
            <>
              {!imageError ? (
                <img
                  src={getFlagImagePath(selectedState)}
                  alt={selectedStateData.name}
                  className="h-6 w-6 rounded object-cover"
                  onError={() => {
                    setImageError(true);
                  }}
                />
              ) : (
                <MapPin className="h-6 w-6 text-white dark:text-zinc-800" />
              )}
              <span className="text-sm font-medium text-white dark:text-zinc-800 hidden sm:inline">
                {selectedStateData.name}
              </span>
            </>
          ) : (
            <MapPin className="h-6 w-6 text-white dark:text-zinc-800" />
          )}
        </button>

        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogContent className="sm:max-w-md bg-zinc-100 dark:bg-zinc-800 max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-zinc-900 dark:text-zinc-100">Select Your State</DialogTitle>
              <div className="flex items-start gap-2 p-3 mt-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-alert-triangle text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5">
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/>
                  <path d="M12 9v4"/>
                  <path d="M12 17h.01"/>
                </svg>
                <p className="text-sm text-amber-800 dark:text-amber-300 font-medium">
                  <strong>Warning:</strong> This selection is irreversible. You can only do this once. Please choose carefully.
                </p>
              </div>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-4">
              <div className="flex flex-wrap gap-2">
                {states.map((state) => (
                  <Button
                    key={state.id}
                    variant={tempSelectedState === state.id ? "default" : "outline"}
                    className={`border-0 h-auto px-3 py-2 transition-all duration-200 shadow-md ${
                      tempSelectedState === state.id 
                        ? "bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-500 dark:to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 dark:hover:from-blue-600 dark:hover:to-blue-700" 
                        : "bg-white dark:bg-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-600 border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-zinc-100"
                    }`}
                    onClick={() => handleStateSelect(state.id)}
                  >
                    <span className="text-sm font-medium">{state.name}</span>
                  </Button>
                ))}
              </div>
              <Button
                onClick={handleSaveState}
                disabled={!tempSelectedState}
                className="w-full bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
              >
                Save State Selection
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Dialog-only mode (for auto-show after login)
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md bg-zinc-100 dark:bg-zinc-800 max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-zinc-900 dark:text-zinc-100">Welcome! Select Your State</DialogTitle>
          <div className="flex items-start gap-2 p-3 mt-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-alert-triangle text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/>
              <path d="M12 9v4"/>
              <path d="M12 17h.01"/>
            </svg>
            <p className="text-sm text-amber-800 dark:text-amber-300 font-medium">
              <strong>Warning:</strong> This selection is permanent and cannot be changed later. Please choose carefully.
            </p>
          </div>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="flex flex-wrap gap-2">
            {states.map((state) => (
              <Button
                key={state.id}
                variant={tempSelectedState === state.id ? "default" : "outline"}
                className={`border-0 h-auto px-3 py-2 transition-all duration-200 shadow-md ${
                  tempSelectedState === state.id 
                    ? "bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-500 dark:to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 dark:hover:from-blue-600 dark:hover:to-blue-700" 
                    : "bg-white dark:bg-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-600 border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-zinc-100"
                }`}
                onClick={() => handleStateSelect(state.id)}
              >
                <span className="text-sm font-medium">{state.name}</span>
              </Button>
            ))}
          </div>
          <Button
            onClick={handleSaveState}
            disabled={!tempSelectedState}
            className="w-full bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
          >
            Save State Selection
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserStateSelector;

