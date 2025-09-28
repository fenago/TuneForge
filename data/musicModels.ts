export interface MusicModel {
  id: 'chirp-v3-5' | 'chirp-v4' | 'chirp-v4-5' | 'chirp-v4-5-plus';
  name: string;
  displayName: string;
  tier: 'basic' | 'standard' | 'premium' | 'ultra';
  description: string;
  features: string[];
  capabilities: {
    audioQuality: number; // 1-10 scale
    voiceClarity: number; // 1-10 scale
    instrumentSeparation: number; // 1-10 scale
    dynamicRange: number; // 1-10 scale
    stereoImaging: number; // 1-10 scale
  };
  performance: {
    averageGenerationTime: number; // in seconds
    timeRange: [number, number]; // min, max seconds
    complexityMultiplier: number; // how much complexity affects time
  };
  bestFor: string[];
  notIdealFor: string[];
  technicalSpecs: {
    sampleRate: string;
    bitDepth: string;
    format: string;
    maxDuration: string;
  };
  pricing: {
    creditsPerGeneration: number;
    recommended: boolean;
  };
  badge?: string;
  color: string;
  example?: {
    title: string;
    audioUrl?: string; // placeholder for future audio examples
    description: string;
  };
}

export const musicModels: MusicModel[] = [
  {
    id: 'chirp-v3-5',
    name: 'chirp-v3-5',
    displayName: 'Chirp v3.5',
    tier: 'basic',
    description: 'Fast generation with solid quality for quick iterations and demos',
    features: [
      'Rapid 15-20 second generation',
      'Good vocal synthesis',
      'Standard instrumental quality',
      'Perfect for demos and previews'
    ],
    capabilities: {
      audioQuality: 6,
      voiceClarity: 6,
      instrumentSeparation: 5,
      dynamicRange: 5,
      stereoImaging: 5
    },
    performance: {
      averageGenerationTime: 18,
      timeRange: [15, 25],
      complexityMultiplier: 1.0
    },
    bestFor: [
      'Quick song demos',
      'Rapid prototyping',
      'Simple arrangements',
      'Voice-only tracks',
      'Learning and experimentation'
    ],
    notIdealFor: [
      'Final productions',
      'Complex orchestrations',
      'Professional releases'
    ],
    technicalSpecs: {
      sampleRate: '44.1 kHz',
      bitDepth: '16-bit',
      format: 'MP3',
      maxDuration: '4 minutes'
    },
    pricing: {
      creditsPerGeneration: 1,
      recommended: false
    },
    color: 'bg-green-500',
    example: {
      title: 'Pop Demo Track',
      description: 'Clean vocals with simple instrumentation - perfect for quick ideas'
    }
  },
  {
    id: 'chirp-v4',
    name: 'chirp-v4',
    displayName: 'Chirp v4',
    tier: 'standard',
    description: 'Balanced quality and speed - the sweet spot for most projects',
    features: [
      'Enhanced vocal processing',
      'Improved instrument clarity',
      'Better mix balance',
      'Reliable 25-35 second generation',
      'Great for most genres'
    ],
    capabilities: {
      audioQuality: 7,
      voiceClarity: 7,
      instrumentSeparation: 7,
      dynamicRange: 6,
      stereoImaging: 6
    },
    performance: {
      averageGenerationTime: 30,
      timeRange: [25, 40],
      complexityMultiplier: 1.2
    },
    bestFor: [
      'Most music projects',
      'Social media content',
      'Podcast intros',
      'Background music',
      'Creative exploration'
    ],
    notIdealFor: [
      'Audiophile productions',
      'Complex classical pieces'
    ],
    technicalSpecs: {
      sampleRate: '44.1 kHz',
      bitDepth: '16-bit',
      format: 'MP3',
      maxDuration: '4 minutes'
    },
    pricing: {
      creditsPerGeneration: 1,
      recommended: true
    },
    badge: 'RECOMMENDED',
    color: 'bg-blue-500',
    example: {
      title: 'Indie Rock Track',
      description: 'Balanced mix with clear vocals and well-defined instruments'
    }
  },
  {
    id: 'chirp-v4-5',
    name: 'chirp-v4-5',
    displayName: 'Chirp v4.5',
    tier: 'premium',
    description: 'High-quality generation with advanced audio processing and nuanced details',
    features: [
      'Superior audio fidelity',
      'Advanced vocal modeling',
      'Rich harmonic content',
      'Professional mixing quality',
      'Complex arrangement handling'
    ],
    capabilities: {
      audioQuality: 8,
      voiceClarity: 8,
      instrumentSeparation: 8,
      dynamicRange: 8,
      stereoImaging: 7
    },
    performance: {
      averageGenerationTime: 45,
      timeRange: [35, 60],
      complexityMultiplier: 1.5
    },
    bestFor: [
      'Professional projects',
      'Album-quality tracks',
      'Complex arrangements',
      'Genre fusion pieces',
      'Commercial use'
    ],
    notIdealFor: [
      'Quick demos',
      'Simple voice-only tracks',
      'When speed is priority'
    ],
    technicalSpecs: {
      sampleRate: '44.1 kHz',
      bitDepth: '24-bit',
      format: 'WAV/MP3',
      maxDuration: '4 minutes'
    },
    pricing: {
      creditsPerGeneration: 1,
      recommended: false
    },
    color: 'bg-purple-500',
    example: {
      title: 'Jazz Fusion Piece',
      description: 'Complex harmonies with detailed instrument separation and professional polish'
    }
  },
  {
    id: 'chirp-v4-5-plus',
    name: 'chirp-v4-5-plus',
    displayName: 'Chirp v4.5 Plus',
    tier: 'ultra',
    description: 'Ultimate quality with cutting-edge AI processing for professional releases',
    features: [
      'Audiophile-grade quality',
      'Advanced spatial processing',
      'Pristine vocal synthesis',
      'Studio-level production',
      'Maximum dynamic range',
      'Professional mastering'
    ],
    capabilities: {
      audioQuality: 10,
      voiceClarity: 10,
      instrumentSeparation: 9,
      dynamicRange: 9,
      stereoImaging: 9
    },
    performance: {
      averageGenerationTime: 75,
      timeRange: [60, 120],
      complexityMultiplier: 2.0
    },
    bestFor: [
      'Professional releases',
      'Streaming platforms',
      'Commercial productions',
      'Complex orchestral works',
      'Audiophile listening',
      'Final masters'
    ],
    notIdealFor: [
      'Quick sketches',
      'Demo purposes',
      'Background music',
      'When time is limited'
    ],
    technicalSpecs: {
      sampleRate: '48 kHz',
      bitDepth: '24-bit',
      format: 'WAV/FLAC',
      maxDuration: '4 minutes'
    },
    pricing: {
      creditsPerGeneration: 1,
      recommended: false
    },
    badge: 'ULTIMATE',
    color: 'bg-gradient-to-r from-yellow-400 to-orange-500',
    example: {
      title: 'Orchestral Masterpiece',
      description: 'Full dynamic range with pristine clarity and professional mastering quality'
    }
  }
];

export function getModelById(id: string): MusicModel | undefined {
  return musicModels.find(model => model.id === id);
}

export function getRecommendedModel(): MusicModel {
  return musicModels.find(model => model.pricing.recommended) || musicModels[1];
}

export function estimateGenerationTime(
  modelId: string, 
  complexity: 'simple' | 'moderate' | 'complex' = 'moderate'
): { estimate: number; range: [number, number] } {
  const model = getModelById(modelId);
  if (!model) return { estimate: 30, range: [25, 40] };
  
  const complexityMultipliers = { simple: 0.8, moderate: 1.0, complex: 1.3 };
  const multiplier = complexityMultipliers[complexity] * model.performance.complexityMultiplier;
  
  const estimate = Math.round(model.performance.averageGenerationTime * multiplier);
  const range: [number, number] = [
    Math.round(model.performance.timeRange[0] * multiplier),
    Math.round(model.performance.timeRange[1] * multiplier)
  ];
  
  return { estimate, range };
}
