"use client";

import { useState } from 'react';
import { musicModels, MusicModel, estimateGenerationTime } from '@/data/musicModels';
import { ClockIcon, SparklesIcon, CheckCircleIcon, StarIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid';

interface MusicModelSelectorProps {
  selectedModel: string;
  onModelSelect: (modelId: string) => void;
  tags?: string;
  complexity?: 'simple' | 'moderate' | 'complex';
}

export default function MusicModelSelector({ 
  selectedModel, 
  onModelSelect, 
  tags = '',
  complexity = 'moderate' 
}: MusicModelSelectorProps) {
  const [showComparison, setShowComparison] = useState(false);

  const getComplexityFromTags = (tags: string): 'simple' | 'moderate' | 'complex' => {
    const tagLower = tags.toLowerCase();
    if (tagLower.includes('orchestral') || tagLower.includes('jazz fusion') || tagLower.includes('complex')) {
      return 'complex';
    }
    if (tagLower.includes('acoustic') || tagLower.includes('folk') || tagLower.includes('minimal')) {
      return 'simple';
    }
    return 'moderate';
  };

  const currentComplexity = getComplexityFromTags(tags);
  
  const CapabilityBar = ({ value, label }: { value: number; label: string }) => (
    <div className="flex items-center justify-between text-xs">
      <span className="text-gray-600">{label}</span>
      <div className="flex items-center space-x-2">
        <div className="w-16 bg-gray-200 rounded-full h-1.5">
          <div 
            className="bg-gradient-to-r from-blue-400 to-blue-600 h-1.5 rounded-full transition-all"
            style={{ width: `${value * 10}%` }}
          />
        </div>
        <span className="text-gray-500 w-6">{value}/10</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Choose Your AI Music Model</h3>
        <p className="text-gray-600">Different models offer varying quality, speed, and capabilities</p>
      </div>

      {/* Quick Model Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {musicModels.map((model) => {
          const timeEstimate = estimateGenerationTime(model.id, currentComplexity);
          const isSelected = selectedModel === model.id;
          
          return (
            <button
              key={model.id}
              onClick={() => onModelSelect(model.id)}
              className={`p-4 rounded-xl border-2 text-left transition-all relative ${
                isSelected
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${model.color}`} />
                  <h4 className={`font-semibold ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                    {model.displayName}
                  </h4>
                  {model.badge && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      model.badge === 'RECOMMENDED' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {model.badge}
                    </span>
                  )}
                </div>
                {isSelected && (
                  <CheckCircleIconSolid className="w-5 h-5 text-blue-600" />
                )}
              </div>

              {/* Description */}
              <p className={`text-sm mb-3 ${isSelected ? 'text-blue-700' : 'text-gray-600'}`}>
                {model.description}
              </p>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="flex items-center space-x-2">
                  <ClockIcon className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Generation Time</p>
                    <p className="text-sm font-medium">{timeEstimate.estimate}s</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <SparklesIcon className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Audio Quality</p>
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon 
                          key={i}
                          className={`w-3 h-3 ${
                            i < Math.round(model.capabilities.audioQuality / 2) 
                              ? 'text-yellow-400 fill-current' 
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Best For */}
              <div>
                <p className="text-xs font-medium text-gray-700 mb-1">Best for:</p>
                <div className="flex flex-wrap gap-1">
                  {model.bestFor.slice(0, 3).map((use, index) => (
                    <span
                      key={index}
                      className={`text-xs px-2 py-1 rounded-full ${
                        isSelected
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {use}
                    </span>
                  ))}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Comparison Toggle */}
      <div className="text-center">
        <button
          onClick={() => setShowComparison(!showComparison)}
          className="text-blue-600 hover:text-blue-700 underline text-sm font-medium"
        >
          {showComparison ? 'Hide' : 'Show'} Detailed Comparison
        </button>
      </div>

      {/* Detailed Comparison Table */}
      {showComparison && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b">
            <h4 className="font-semibold text-gray-900">Model Comparison</h4>
            <p className="text-sm text-gray-600">Detailed capabilities and specifications</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Model</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quality</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Best Use</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {musicModels.map((model) => {
                  const timeEstimate = estimateGenerationTime(model.id, currentComplexity);
                  return (
                    <tr key={model.id} className={selectedModel === model.id ? 'bg-blue-50' : ''}>
                      <td className="px-4 py-4">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${model.color}`} />
                          <div>
                            <p className="font-medium text-gray-900">{model.displayName}</p>
                            <p className="text-xs text-gray-500">{model.tier}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          <CapabilityBar value={model.capabilities.audioQuality} label="Audio" />
                          <CapabilityBar value={model.capabilities.voiceClarity} label="Voice" />
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm">
                          <p className="font-medium">{timeEstimate.estimate}s avg</p>
                          <p className="text-xs text-gray-500">
                            {timeEstimate.range[0]}-{timeEstimate.range[1]}s range
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          {model.bestFor.slice(0, 2).map((use, index) => (
                            <span 
                              key={index}
                              className="block text-xs text-gray-600"
                            >
                              • {use}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Smart Recommendation */}
      {tags && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
          <div className="flex items-start space-x-3">
            <SparklesIcon className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 mb-1">Smart Recommendation</h4>
              <p className="text-sm text-blue-700">
                Based on your tags "{tags.slice(0, 50)}{tags.length > 50 ? '...' : ''}", 
                {currentComplexity === 'complex' && ' we recommend Chirp v4.5+ for complex arrangements.'}
                {currentComplexity === 'simple' && ' Chirp v4 offers great quality for your style.'}
                {currentComplexity === 'moderate' && ' Chirp v4 provides the perfect balance.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
