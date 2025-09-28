/**
 * UNIFIED METADATA MAPPING SYSTEM
 * 
 * Maps API responses from both SunoAPI.com and SunoAPI.org to our unified schema
 */

import { 
  UnifiedSongMetadata, 
  SunoComResponse, 
  SunoOrgResponse, 
  APIProvider,
  SongStatus,
  MetadataValidationResult,
  MappingConfig
} from '@/types/unified-song';

/**
 * Mapping configuration for both APIs
 */
const MAPPING_CONFIG: Record<APIProvider, MappingConfig> = {
  sunoapi_com: {
    required_fields: ['id', 'title', 'user_id', 'api_provider', 'api_task_id', 'prompt', 'tags', 'model_version', 'status'],
    optional_fields: ['audio_url', 'video_url', 'image_url', 'lyrics', 'duration', 'tempo', 'key'],
    default_values: {
      is_instrumental: false,
      is_variation: false,
      is_featured: false,
      is_public: false,
      play_count: 0,
      download_count: 0,
      share_count: 0,
      generation_cost: 10, // Default cost for SunoAPI.com
      file_formats: ['mp3'],
      file_sizes: {},
    },
    field_transformations: {
      status: (status: string) => mapStatusToUnified(status, 'sunoapi_com'),
      duration: (duration: any) => typeof duration === 'number' ? duration : 0,
      lyrics: (lyric: string) => lyric || '',
    }
  },
  sunoapi_org: {
    required_fields: ['id', 'title', 'user_id', 'api_provider', 'api_task_id', 'prompt', 'tags', 'model_version', 'status'],
    optional_fields: ['audio_url', 'video_url', 'image_url', 'lyrics', 'duration', 'tempo', 'key'],
    default_values: {
      is_instrumental: false,
      is_variation: false,
      is_featured: false,
      is_public: false,
      play_count: 0,
      download_count: 0,
      share_count: 0,
      generation_cost: 8, // Default cost for SunoAPI.org
      file_formats: ['mp3'],
      file_sizes: {},
    },
    field_transformations: {
      status: (state: string) => mapStatusToUnified(state, 'sunoapi_org'),
      duration: (duration: any) => typeof duration === 'number' ? duration : 0,
      lyrics: (lyrics: string) => lyrics || '',
    }
  }
};

/**
 * Maps SunoAPI.com response to unified schema
 */
export function mapSunoComResponse(
  response: SunoComResponse, 
  userId: string, 
  taskId: string,
  additionalData?: Partial<UnifiedSongMetadata>
): UnifiedSongMetadata {
  const config = MAPPING_CONFIG.sunoapi_com;
  
  console.log('🔄 MAPPING: SunoAPI.com response to unified schema');
  console.log('🔄 Response ID:', response.id);
  console.log('🔄 Response Title:', response.title);
  
  const baseMetadata: UnifiedSongMetadata = {
    // Core identification
    id: response.id,
    title: response.title || 'Untitled Song',
    user_id: userId,
    created_at: new Date(response.created_at || Date.now()),
    
    // API tracking
    api_provider: 'sunoapi_com',
    api_task_id: taskId,
    api_clip_id: response.id,
    api_response_raw: response,
    
    // Generation details
    prompt: response.gpt_description_prompt || response.prompt || '',
    tags: response.tags || '',
    lyrics: config.field_transformations.lyrics(response.lyric),
    is_instrumental: !response.lyric || response.lyric.length === 0,
    
    // Technical details
    model_version: response.model_name || 'unknown',
    duration: config.field_transformations.duration(response.duration),
    audio_url: response.audio_url || '',
    image_url: response.image_url,
    video_url: response.video_url,
    
    // Audio analysis (extract from tags if available)
    ...extractAudioAnalysisFromTags(response.tags),
    
    // Processing status
    status: config.field_transformations.status(response.status),
    generation_end_time: new Date(),
    
    // Apply defaults
    ...config.default_values,
    
    // Override with any additional data provided
    ...additionalData
  };
  
  // Calculate metadata coverage
  baseMetadata.metadata_coverage_score = calculateMetadataCoverage(baseMetadata);
  baseMetadata.last_metadata_update = new Date();
  
  console.log('✅ MAPPING: SunoAPI.com mapping completed');
  console.log('✅ Coverage Score:', baseMetadata.metadata_coverage_score + '%');
  
  return baseMetadata;
}

/**
 * Maps SunoAPI.org response to unified schema
 */
export function mapSunoOrgResponse(
  response: SunoOrgResponse, 
  userId: string, 
  taskId: string,
  additionalData?: Partial<UnifiedSongMetadata>
): UnifiedSongMetadata {
  const config = MAPPING_CONFIG.sunoapi_org;
  
  console.log('🔄 MAPPING: SunoAPI.org response to unified schema');
  console.log('🔄 Response Clip ID:', response.clip_id);
  console.log('🔄 Response Title:', response.title);
  
  const baseMetadata: UnifiedSongMetadata = {
    // Core identification
    id: response.clip_id,
    title: response.title || 'Untitled Song',
    user_id: userId,
    created_at: new Date(response.created_at || Date.now()),
    
    // API tracking
    api_provider: 'sunoapi_org',
    api_task_id: taskId,
    api_clip_id: response.clip_id,
    api_response_raw: response,
    
    // Generation details
    prompt: '', // SunoAPI.org doesn't return prompt in status response
    tags: response.tags || '',
    lyrics: config.field_transformations.lyrics(response.lyrics),
    is_instrumental: !response.lyrics || response.lyrics.length === 0,
    
    // Technical details
    model_version: response.mv || 'unknown',
    duration: config.field_transformations.duration(response.duration),
    audio_url: response.audio_url || '',
    image_url: response.image_url,
    video_url: response.video_url,
    
    // Audio analysis (extract from tags if available)
    ...extractAudioAnalysisFromTags(response.tags),
    
    // Processing status
    status: config.field_transformations.status(response.state),
    generation_end_time: new Date(),
    
    // Apply defaults
    ...config.default_values,
    
    // Override with any additional data provided
    ...additionalData
  };
  
  // Calculate metadata coverage
  baseMetadata.metadata_coverage_score = calculateMetadataCoverage(baseMetadata);
  baseMetadata.last_metadata_update = new Date();
  
  console.log('✅ MAPPING: SunoAPI.org mapping completed');
  console.log('✅ Coverage Score:', baseMetadata.metadata_coverage_score + '%');
  
  return baseMetadata;
}

/**
 * Maps API-specific status to unified status
 */
function mapStatusToUnified(status: string, provider: APIProvider): SongStatus {
  const statusMap: Record<APIProvider, Record<string, SongStatus>> = {
    sunoapi_com: {
      'pending': 'pending',
      'processing': 'processing',
      'complete': 'completed',
      'completed': 'completed',
      'success': 'completed',
      'failed': 'failed',
      'error': 'failed',
    },
    sunoapi_org: {
      'pending': 'pending',
      'running': 'processing',
      'processing': 'processing',
      'succeeded': 'completed',
      'completed': 'completed',
      'failed': 'failed',
      'error': 'failed',
    }
  };
  
  const mapped = statusMap[provider][status.toLowerCase()];
  if (!mapped) {
    console.warn(`⚠️ MAPPING: Unknown status "${status}" for provider ${provider}, defaulting to 'pending'`);
    return 'pending';
  }
  
  return mapped;
}

/**
 * Extracts audio analysis from tags string
 */
function extractAudioAnalysisFromTags(tags?: string): Partial<UnifiedSongMetadata> {
  if (!tags) return {};
  
  const analysis: Partial<UnifiedSongMetadata> = {};
  const lowerTags = tags.toLowerCase();
  
  // Extract genre
  const genres = ['pop', 'rock', 'hip-hop', 'electronic', 'jazz', 'classical', 'country', 'r&b', 'reggae', 'folk', 'blues', 'metal'];
  for (const genre of genres) {
    if (lowerTags.includes(genre)) {
      analysis.genre = genre;
      break;
    }
  }
  
  // Extract mood
  const moods = ['happy', 'sad', 'energetic', 'calm', 'romantic', 'aggressive', 'mysterious', 'uplifting', 'melancholic', 'epic', 'dreamy', 'dark'];
  for (const mood of moods) {
    if (lowerTags.includes(mood)) {
      analysis.mood = mood;
      break;
    }
  }
  
  // Extract tempo indicators
  if (lowerTags.includes('fast') || lowerTags.includes('upbeat')) {
    analysis.tempo = 140;
    analysis.energy_level = 0.8;
  } else if (lowerTags.includes('slow') || lowerTags.includes('ballad')) {
    analysis.tempo = 80;
    analysis.energy_level = 0.3;
  } else {
    analysis.tempo = 120; // Default
    analysis.energy_level = 0.5;
  }
  
  return analysis;
}

/**
 * Calculates metadata coverage percentage
 */
function calculateMetadataCoverage(metadata: UnifiedSongMetadata): number {
  const allFields = [
    'id', 'title', 'user_id', 'api_provider', 'api_task_id', 'prompt', 'tags', 
    'lyrics', 'model_version', 'duration', 'audio_url', 'image_url', 'video_url',
    'tempo', 'key', 'energy_level', 'mood', 'genre', 'generation_time'
  ];
  
  let populatedFields = 0;
  
  for (const field of allFields) {
    const value = (metadata as any)[field];
    if (value !== undefined && value !== null && value !== '' && value !== 0) {
      populatedFields++;
    }
  }
  
  return Math.round((populatedFields / allFields.length) * 100);
}

/**
 * Validates metadata completeness
 */
export function validateMetadata(metadata: UnifiedSongMetadata, provider: APIProvider): MetadataValidationResult {
  const config = MAPPING_CONFIG[provider];
  const result: MetadataValidationResult = {
    is_valid: true,
    coverage_score: calculateMetadataCoverage(metadata),
    missing_required: [],
    missing_optional: [],
    errors: [],
    warnings: []
  };
  
  // Check required fields
  for (const field of config.required_fields) {
    const value = (metadata as any)[field];
    if (value === undefined || value === null || value === '') {
      result.missing_required.push(field);
      result.is_valid = false;
    }
  }
  
  // Check optional fields
  for (const field of config.optional_fields) {
    const value = (metadata as any)[field];
    if (value === undefined || value === null || value === '') {
      result.missing_optional.push(field);
    }
  }
  
  // Add warnings for low coverage
  if (result.coverage_score < 60) {
    result.warnings.push(`Low metadata coverage: ${result.coverage_score}%`);
  }
  
  if (!metadata.audio_url) {
    result.errors.push('Missing audio URL - song cannot be played');
  }
  
  if (metadata.duration === 0) {
    result.warnings.push('Duration is 0 - may indicate incomplete generation');
  }
  
  return result;
}

/**
 * Merges metadata from multiple sources, preferring more complete data
 */
export function mergeMetadata(
  primary: UnifiedSongMetadata, 
  secondary: UnifiedSongMetadata
): UnifiedSongMetadata {
  const merged = { ...primary };
  
  // Merge missing fields from secondary
  Object.keys(secondary).forEach(key => {
    const primaryValue = (primary as any)[key];
    const secondaryValue = (secondary as any)[key];
    
    if (!primaryValue && secondaryValue) {
      (merged as any)[key] = secondaryValue;
    }
  });
  
  // Update coverage score and timestamp
  merged.metadata_coverage_score = calculateMetadataCoverage(merged);
  merged.last_metadata_update = new Date();
  
  return merged;
}

/**
 * Creates a metadata logging entry for debugging
 */
export function createMetadataLog(
  metadata: UnifiedSongMetadata, 
  operation: string, 
  provider: APIProvider,
  validation?: MetadataValidationResult
): any {
  return {
    timestamp: new Date().toISOString(),
    operation,
    provider,
    song_id: metadata.id,
    coverage_score: metadata.metadata_coverage_score,
    validation_result: validation,
    key_fields: {
      has_audio_url: !!metadata.audio_url,
      has_duration: metadata.duration > 0,
      has_lyrics: !!metadata.lyrics,
      has_analysis: !!metadata.music_analysis,
    }
  };
}
