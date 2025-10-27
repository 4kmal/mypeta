import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { states } from '@/data/states';

interface StateSelectorDialogProps {
  selectedState: string | null;
  onStateChange: (state: string) => void;
}

const StateSelectorDialog = ({ selectedState, onStateChange }: StateSelectorDialogProps) => {
  const [open, setOpen] = useState(false);

  const selectedStateData = states.find(state => state.id === selectedState);

  const handleStateSelect = (stateId: string) => {
    onStateChange(stateId);
    setOpen(false); // Auto-close dialog after selection
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-0 shadow-md w-full justify-between bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-700 p-6 rounded-xl">
          <span className="flex items-center gap-2">
            {selectedStateData?.name || 'Select a state'}
          </span>
          <svg
            className="h-4 w-4 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-zinc-100 dark:bg-zinc-800 max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-zinc-900 dark:text-zinc-100">Select State</DialogTitle>
          <DialogDescription className="text-zinc-600 dark:text-zinc-400">
            Choose a state to view its data
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-wrap gap-2 py-4">
          {states.map((state) => (
            <Button
              key={state.id}
              variant={selectedState === state.id ? "default" : "outline"}
              className={`border-0 h-auto px-3 py-2 transition-all duration-200 shadow-md ${
                selectedState === state.id 
                  ? "bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-500 dark:to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 dark:hover:from-blue-600 dark:hover:to-blue-700" 
                  : "bg-white dark:bg-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-600 border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-zinc-100"
              }`}
              onClick={() => handleStateSelect(state.id)}
            >
              <span className="text-sm font-medium">{state.name}</span>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StateSelectorDialog;
