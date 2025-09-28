/**
 * UNIFIED SONG METADATA SCHEMA
 * 
 * This schema unifies metadata from both SunoAPI.com and SunoAPI.org
 * to ensure consistent data structure regardless of API provider.
 */

export type APIProvider = 'sunoapi_com' | 'sunoapi_org';
export type SongStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type VariationType = 'extend' | 'cover' | 'remix' | 'stems';

export interface UnifiedSongMetadata {
  // Core identification
  id: string;
  title: string;
  user_id: string;
  created_at: Date;
  updated_at?: Date;
  
  // API tracking - CRITICAL for dual-provider support
  api_provider: APIProvider;
  api_task_id: string;
  api_clip_id?: string;
  api_response_raw?: any; // Store original response for debugging
  
  // Generation details
  prompt: string;
  tags: string;
  lyrics: string;
  is_instrumental: boolean;
  
  // Technical details
  model_version: string;
  duration: number;
  audio_url: string;
  image_url?: string;
  video_url?: string;
  
  // Audio analysis (unified from both APIs)
  tempo?: number;
  key?: string;
  energy_level?: number;
  mood?: string;
  genre?: string;
  
  // Processing status
  status: SongStatus;
  processing_time?: number;
  generation_start_time?: Date;
  generation_end_time?: Date;
  
  // Advanced features
  persona_id?: string;
  parent_song_id?: string; // For extensions/variations
  is_variation?: boolean;
  variation_type?: VariationType;
  
  // File management
  file_formats?: string[]; // ['mp3', 'wav', etc.]
  file_sizes?: Record<string, number>;
  download_count?: number;
  
  // Quality metrics
  generation_cost?: number;
  user_rating?: number;
  is_featured?: boolean;
  is_public?: boolean;
  
  // Analytics tracking
  play_count?: number;
  share_count?: number;
  
  // Advanced metadata for analysis
  music_analysis?: {
    energy?: number;
    valence?: number;
    danceability?: number;
    acousticness?: number;
    instrumentalness?: number;
    liveness?: number;
    speechiness?: number;
    loudness?: number;
    modality?: number;
    time_signature?: number;
    genre_confidence?: number;
    mood_confidence?: number;
  };
  
  // Generation analytics for performance tracking
  generation_analytics?: {
    polling_attempts?: number;
    total_wait_time?: number;
    api_response_code?: number;
    api_response_time?: number;
    error_count?: number;
    retry_count?: number;
  };
  
  // Error handling
  error_message?: string;
  last_error?: Date;
  
  // Metadata completeness tracking
  metadata_coverage_score?: number; // 0-100% of fields populated
  last_metadata_update?: Date;
}

/**
 * SunoAPI.com Response Format
 */
export interface SunoComResponse {
  id: string;
  title: string;
  image_url: string;
  lyric: string;
  audio_url: string;
  video_url: string;
  created_at: string;
  model_name: string;
  status: string;
  gpt_description_prompt: string;
  prompt: string;
  type: string;
  tags: string;
  duration?: number;
}

/**
 * SunoAPI.org Response Format
 */
export interface SunoOrgResponse {
  clip_id: string;
  state: string;
  title: string;
  tags: string;
  lyrics: string;
  image_url: string;
  audio_url: string;
  video_url: string;
  created_at: string;
  mv: string;
  duration: number;
}

/**
 * Unified Task Response (for polling)
 */
export interface UnifiedTaskResponse {
  success: boolean;
  message: string;
  data: UnifiedSongMetadata[];
  metadata: {
    api_provider: APIProvider;
    response_time: number;
    total_songs: number;
    completed_songs: number;
    failed_songs: number;
    [key: string]: any; // Allow additional metadata fields
  };
}

/**
 * Metadata mapping configuration
 */
export interface MappingConfig {
  required_fields: (keyof UnifiedSongMetadata)[];
  optional_fields: (keyof UnifiedSongMetadata)[];
  default_values: Partial<UnifiedSongMetadata>;
  field_transformations: Record<string, (value: any) => any>;
}

/**
 * Validation result for metadata completeness
 */
export interface MetadataValidationResult {
  is_valid: boolean;
  coverage_score: number;
  missing_required: string[];
  missing_optional: string[];
  errors: string[];
  warnings: string[];
}

/**
 * Database document interface (extends UnifiedSongMetadata for Mongoose)
 */
export interface SongDocument extends UnifiedSongMetadata {
  _id: string;
  __v?: number;
  
  // Methods
  incrementPlayCount(): Promise<SongDocument>;
  incrementDownloadCount(): Promise<SongDocument>;
  incrementShareCount(): Promise<SongDocument>;
  canUserAccess(userId: string, userRole: string): boolean;
  calculateMetadataCoverage(): number;
  updateMetadataFromAPI(apiResponse: any, provider: APIProvider): Promise<SongDocument>;
}

/**
 * API Provider Configuration
 */
export interface APIProviderConfig {
  name: APIProvider;
  base_url: string;
  supports_streaming: boolean;
  supports_stems: boolean;
  max_duration: number;
  supported_models: string[];
  response_format: 'suno_com' | 'suno_org';
  rate_limit: {
    requests_per_minute: number;
    requests_per_hour: number;
  };
}
