/**
 * Persona System Validation Utilities
 * Provides validation functions for persona creation and management
 */

export interface PersonaValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface PersonaCreateInput {
  name: string;
  description: string;
  sourceClipId: string;
}

/**
 * Validates persona creation input
 */
export function validatePersonaInput(input: PersonaCreateInput): PersonaValidationResult {
  const errors: string[] = [];

  // Name validation
  if (!input.name?.trim()) {
    errors.push('Persona name is required');
  } else if (input.name.trim().length > 50) {
    errors.push('Persona name must be 50 characters or less');
  } else if (input.name.trim().length < 2) {
    errors.push('Persona name must be at least 2 characters');
  }

  // Description validation
  if (!input.description?.trim()) {
    errors.push('Voice description is required');
  } else if (input.description.trim().length > 200) {
    errors.push('Description must be 200 characters or less');
  } else if (input.description.trim().length < 10) {
    errors.push('Description must be at least 10 characters for better voice quality');
  }

  // Source clip validation
  if (!input.sourceClipId?.trim()) {
    errors.push('Source song is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates persona name for uniqueness (client-side check)
 */
export function validatePersonaNameUniqueness(
  name: string, 
  existingPersonas: Array<{ name: string }>
): PersonaValidationResult {
  const errors: string[] = [];
  
  const normalizedName = name.trim().toLowerCase();
  const isDuplicate = existingPersonas.some(
    persona => persona.name.toLowerCase() === normalizedName
  );
  
  if (isDuplicate) {
    errors.push('A persona with this name already exists');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Extracts voice characteristics from description text
 */
export function extractVoiceCharacteristics(description: string): {
  voiceType: 'male' | 'female' | 'mixed' | 'unknown';
  characteristics: string[];
} {
  const desc = description.toLowerCase();
  let voiceType: 'male' | 'female' | 'mixed' | 'unknown' = 'unknown';
  const characteristics: string[] = [];

  // Voice type detection
  const hasMale = desc.includes('male') || desc.includes('man') || desc.includes('masculine');
  const hasFemale = desc.includes('female') || desc.includes('woman') || desc.includes('feminine');
  
  if (hasMale && hasFemale) {
    voiceType = 'mixed';
  } else if (hasMale) {
    voiceType = 'male';
  } else if (hasFemale) {
    voiceType = 'female';
  }

  // Characteristic extraction
  const characteristicMap: Record<string, string[]> = {
    'deep': ['deep', 'bass', 'low', 'baritone'],
    'high': ['high', 'tenor', 'soprano', 'falsetto'],
    'smooth': ['smooth', 'silky', 'velvet', 'creamy'],
    'rough': ['rough', 'raspy', 'gritty', 'gravelly'],
    'powerful': ['powerful', 'strong', 'bold', 'commanding'],
    'soft': ['soft', 'gentle', 'whisper', 'delicate'],
    'energetic': ['energetic', 'upbeat', 'lively', 'dynamic'],
    'calm': ['calm', 'peaceful', 'serene', 'mellow'],
    'rhythmic': ['rhythmic', 'percussive', 'beat', 'groove'],
    'melodic': ['melodic', 'singing', 'tune', 'harmonic'],
    'soulful': ['soulful', 'emotional', 'heartfelt', 'passionate'],
    'aggressive': ['aggressive', 'intense', 'fierce', 'heavy']
  };

  for (const [characteristic, keywords] of Object.entries(characteristicMap)) {
    if (keywords.some(keyword => desc.includes(keyword))) {
      characteristics.push(characteristic);
    }
  }

  return { voiceType, characteristics };
}

/**
 * Generates suggestion templates based on genre/style
 */
export function getPersonaTemplates(genre?: string): Array<{ label: string; value: string }> {
  const baseTemplates = [
    { 
      label: "Powerful Male Rock Voice", 
      value: "Powerful male rock vocals, strong and energetic delivery with gritty edge" 
    },
    { 
      label: "Smooth Female Pop Voice", 
      value: "Smooth female pop vocals, melodic and commercial style with clear articulation" 
    },
    { 
      label: "Deep Male Rap Voice", 
      value: "Deep male rap vocals, rhythmic and bass-heavy delivery with confident flow" 
    },
    { 
      label: "Gentle Female Acoustic", 
      value: "Gentle female acoustic vocals, soft and intimate style with emotional warmth" 
    },
    { 
      label: "High Energy Electronic", 
      value: "High energy electronic vocals, processed and futuristic with dynamic range" 
    },
    { 
      label: "Soulful R&B Voice", 
      value: "Soulful R&B vocals, rich and emotional delivery with smooth runs and riffs" 
    }
  ];

  // Add genre-specific templates if genre is provided
  const genreTemplates: Record<string, Array<{ label: string; value: string }>> = {
    'jazz': [
      { label: "Jazz Crooner", value: "Smooth jazz vocals, sophisticated and laid-back with perfect timing" },
      { label: "Jazz Diva", value: "Powerful female jazz vocals, sultry and expressive with improvisational flair" }
    ],
    'country': [
      { label: "Country Storyteller", value: "Authentic country vocals with storytelling delivery and rustic charm" },
      { label: "Modern Country", value: "Contemporary country vocals, polished but with traditional heart" }
    ],
    'metal': [
      { label: "Metal Screamer", value: "Intense metal vocals, aggressive and powerful with controlled distortion" },
      { label: "Melodic Metal", value: "Melodic metal vocals, strong but clean with soaring range" }
    ]
  };

  if (genre && genreTemplates[genre.toLowerCase()]) {
    return [...baseTemplates, ...genreTemplates[genre.toLowerCase()]];
  }

  return baseTemplates;
}

/**
 * Formats persona display name with usage info
 */
export function formatPersonaDisplayName(persona: { name: string; usageCount: number }): string {
  const usageText = persona.usageCount > 0 ? ` (${persona.usageCount} songs)` : ' (New)';
  return `${persona.name}${usageText}`;
}

/**
 * Sorts personas by priority (favorites, usage, date)
 */
export function sortPersonas<T extends { 
  isFavorite: boolean; 
  usageCount: number; 
  lastUsedAt?: Date; 
  createdAt: Date 
}>(personas: T[]): T[] {
  return [...personas].sort((a, b) => {
    // Favorites first
    if (a.isFavorite && !b.isFavorite) return -1;
    if (!a.isFavorite && b.isFavorite) return 1;
    
    // Then by usage count
    if (a.usageCount !== b.usageCount) {
      return b.usageCount - a.usageCount;
    }
    
    // Then by last used date
    if (a.lastUsedAt && b.lastUsedAt) {
      return new Date(b.lastUsedAt).getTime() - new Date(a.lastUsedAt).getTime();
    }
    
    // Finally by creation date
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}
