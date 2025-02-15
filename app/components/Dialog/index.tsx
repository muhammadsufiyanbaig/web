"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trophy, CheckCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { WinnerSelectionDialogProps } from "@/app/Types";

const WinnerSelectionDialog: React.FC<WinnerSelectionDialogProps> = ({
  isOpen,
  onOpenChange,
  onWinnerSelected,
}) => {
  const [selectedWinner, setSelectedWinner] = useState<string>("");

  const handleWinnerSelection = () => {
    onWinnerSelected(selectedWinner);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-w-[90vw] bg-black text-zinc-100 border-zinc-700 border rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl sm:text-3xl font-bold text-white flex items-center justify-center mb-4 sm:mb-6">
            <Trophy className="w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-3 text-yellow-500 animate-pulse" />
            Select Winner
          </DialogTitle>
        </DialogHeader>
        <div className="py-4 sm:py-6">
          <RadioGroup
            value={selectedWinner}
            onValueChange={setSelectedWinner}
            className="space-y-3 sm:space-y-4"
          >
            {["Team 1", "Team 2", "Draw"].map((option) => (
              <div
                key={option}
                className={`flex items-center space-x-3 p-2 sm:p-3 rounded-lg transition-all duration-200 ${
                  selectedWinner === option.toLowerCase().replace(" ", "")
                    ? "bg-blue-500/20 border border-blue-500"
                    : "bg-zinc-900 border border-zinc-700 hover:border-blue-500/50"
                }`}
              >
                <RadioGroupItem
                  value={option.toLowerCase().replace(" ", "")}
                  id={option.toLowerCase().replace(" ", "")}
                  className="border-blue-400"
                />
                <Label
                  htmlFor={option.toLowerCase().replace(" ", "")}
                  className="flex-grow text-base sm:text-lg font-medium cursor-pointer"
                >
                  {option}
                </Label>
                {selectedWinner === option.toLowerCase().replace(" ", "") && (
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 animate-in fade-in duration-300" />
                )}
              </div>
            ))}
          </RadioGroup>
        </div>
        <DialogFooter>
          <Button
            onClick={handleWinnerSelection}
            className="w-full bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 sm:py-3 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 text-sm sm:text-base"
            disabled={!selectedWinner}
          >
            Confirm Selection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WinnerSelectionDialog;

