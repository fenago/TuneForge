"use client";

import { useState } from "react";
import { SparklesIcon, CogIcon } from "@heroicons/react/24/outline";

export type CreationMode = 'simple' | 'advanced';

interface ModeToggleProps {
  currentMode: CreationMode;
  onModeChange: (mode: CreationMode) => void;
  className?: string;
}

export default function ModeToggle({ currentMode, onModeChange, className = "" }: ModeToggleProps) {
  return (
    <div className={`inline-flex items-center bg-gray-100 rounded-xl p-1 ${className}`}>
      {/* Simple Mode Button */}
      <button
        onClick={() => onModeChange('simple')}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
          currentMode === 'simple'
            ? 'bg-tuneforge-gradient text-white shadow-sm'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
        }`}
      >
        <SparklesIcon className="w-4 h-4" />
        Surprise Me
      </button>

      {/* Advanced Mode Button */}
      <button
        onClick={() => onModeChange('advanced')}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
          currentMode === 'advanced'
            ? 'bg-tuneforge-gradient text-white shadow-sm'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
        }`}
      >
        <CogIcon className="w-4 h-4" />
        Advanced
      </button>
    </div>
  );
}

/**
 * Mode descriptions for help text
 */
export const modeDescriptions: Record<CreationMode, string> = {
  simple: "Let AI surprise you with a perfect song based on your mood and genre preferences",
  advanced: "Full control over prompts, styles, models, and advanced features like personas"
};
