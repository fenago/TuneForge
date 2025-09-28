/**
 * METADATA VALIDATION UTILITIES
 * 
 * Validates metadata completeness and quality for unified song schema
 */

import { UnifiedSongMetadata, MetadataValidationResult, APIProvider } from '@/types/unified-song';

/**
 * Validates complete metadata structure
 */
export function validateUnifiedMetadata(
  metadata: Partial<UnifiedSongMetadata>,
  provider: APIProvider
): MetadataValidationResult {
  const result: MetadataValidationResult = {
    is_valid: true,
    coverage_score: 0,
    missing_required: [],
    missing_optional: [],
    errors: [],
    warnings: []
  };

  // Define critical fields that must be present
  const criticalFields = [
    'id', 'title', 'user_id', 'api_provider', 'api_task_id', 
    'status', 'audio_url'
  ];

  // Define important fields for good coverage
  const importantFields = [
    'prompt', 'tags', 'lyrics', 'duration', 'model_version',
    'image_url', 'video_url', 'genre', 'mood'
  ];

  // Define optional fields for full coverage
  const optionalFields = [
    'tempo', 'key', 'energy_level', 'generation_time',
    'music_analysis', 'generation_cost', 'user_rating'
  ];

  // Check critical fields
  for (const field of criticalFields) {
    const value = (metadata as any)[field];
    if (!value || value === '' || value === null || value === undefined) {
      result.missing_required.push(field);
      result.errors.push(`Critical field missing: ${field}`);
      result.is_valid = false;
    }
  }

  // Check important fields
  for (const field of importantFields) {
    const value = (metadata as any)[field];
    if (!value || value === '' || value === null || value === undefined) {
      result.missing_optional.push(field);
      result.warnings.push(`Important field missing: ${field}`);
    }
  }

  // Calculate coverage score
  const allFields = [...criticalFields, ...importantFields, ...optionalFields];
  let populatedFields = 0;

  for (const field of allFields) {
    const value = (metadata as any)[field];
    if (value && value !== '' && value !== null && value !== undefined) {
      if (field === 'duration' && value === 0) continue; // Don't count 0 duration
      populatedFields++;
    }
  }

  result.coverage_score = Math.round((populatedFields / allFields.length) * 100);

  // Add specific validations
  if (metadata.duration === 0) {
    result.warnings.push('Duration is 0 - may indicate incomplete generation');
  }

  if (metadata.audio_url && !isValidUrl(metadata.audio_url)) {
    result.errors.push('Invalid audio URL format');
    result.is_valid = false;
  }

  if (metadata.status === 'completed' && !metadata.audio_url) {
    result.errors.push('Completed song missing audio URL');
    result.is_valid = false;
  }

  // Provider-specific validations
  if (provider === 'sunoapi_com') {
    if (!metadata.api_clip_id) {
      result.warnings.push('SunoAPI.com songs should have clip_id');
    }
  }

  if (provider === 'sunoapi_org') {
    if (!metadata.api_clip_id) {
      result.errors.push('SunoAPI.org songs must have clip_id');
      result.is_valid = false;
    }
  }

  // Coverage score warnings
  if (result.coverage_score < 40) {
    result.errors.push(`Very low metadata coverage: ${result.coverage_score}%`);
    result.is_valid = false;
  } else if (result.coverage_score < 60) {
    result.warnings.push(`Low metadata coverage: ${result.coverage_score}%`);
  }

  return result;
}

/**
 * Checks if metadata is suitable for public display
 */
export function validateForPublicDisplay(metadata: UnifiedSongMetadata): MetadataValidationResult {
  const result = validateUnifiedMetadata(metadata, metadata.api_provider);
  
  // Additional checks for public display
  const publicRequiredFields = ['title', 'audio_url', 'duration', 'genre', 'mood'];
  
  for (const field of publicRequiredFields) {
    const value = (metadata as any)[field];
    if (!value || value === '' || value === 0) {
      result.errors.push(`Public song missing ${field}`);
      result.is_valid = false;
    }
  }
  
  if (metadata.lyrics && metadata.lyrics.includes('[inappropriate content]')) {
    result.errors.push('Song contains inappropriate content');
    result.is_valid = false;
  }
  
  return result;
}

/**
 * Validates metadata quality for analytics
 */
export function validateForAnalytics(metadata: UnifiedSongMetadata): boolean {
  const requiredForAnalytics = [
    'duration', 'genre', 'mood', 'play_count', 'generation_cost'
  ];
  
  return requiredForAnalytics.every(field => {
    const value = (metadata as any)[field];
    return value !== undefined && value !== null && value !== '';
  });
}

/**
 * Simple URL validation
 */
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return url.startsWith('http://') || url.startsWith('https://');
  } catch {
    return false;
  }
}

/**
 * Generates a metadata quality report
 */
export function generateMetadataReport(songs: UnifiedSongMetadata[]): any {
  const report = {
    total_songs: songs.length,
    by_provider: {
      sunoapi_com: songs.filter(s => s.api_provider === 'sunoapi_com').length,
      sunoapi_org: songs.filter(s => s.api_provider === 'sunoapi_org').length,
    },
    by_status: {
      completed: songs.filter(s => s.status === 'completed').length,
      pending: songs.filter(s => s.status === 'pending').length,
      processing: songs.filter(s => s.status === 'processing').length,
      failed: songs.filter(s => s.status === 'failed').length,
    },
    coverage_analysis: {
      high_coverage: songs.filter(s => (s.metadata_coverage_score || 0) >= 80).length,
      medium_coverage: songs.filter(s => (s.metadata_coverage_score || 0) >= 60 && (s.metadata_coverage_score || 0) < 80).length,
      low_coverage: songs.filter(s => (s.metadata_coverage_score || 0) < 60).length,
      average_coverage: songs.reduce((sum, s) => sum + (s.metadata_coverage_score || 0), 0) / songs.length,
    },
    data_quality: {
      has_audio_url: songs.filter(s => s.audio_url).length,
      has_duration: songs.filter(s => s.duration && s.duration > 0).length,
      has_lyrics: songs.filter(s => s.lyrics && s.lyrics.length > 0).length,
      has_genre: songs.filter(s => s.genre).length,
      has_mood: songs.filter(s => s.mood).length,
      has_analysis: songs.filter(s => s.music_analysis).length,
    },
    public_ready: songs.filter(s => {
      const validation = validateForPublicDisplay(s);
      return validation.is_valid;
    }).length,
    timestamp: new Date().toISOString()
  };

  return report;
}

/**
 * Identifies songs that need metadata enhancement
 */
export function identifyIncompleteMetadata(songs: UnifiedSongMetadata[]): {
  critical: UnifiedSongMetadata[];
  low_coverage: UnifiedSongMetadata[];
  missing_audio: UnifiedSongMetadata[];
  missing_analysis: UnifiedSongMetadata[];
} {
  return {
    critical: songs.filter(s => {
      const validation = validateUnifiedMetadata(s, s.api_provider);
      return !validation.is_valid;
    }),
    low_coverage: songs.filter(s => (s.metadata_coverage_score || 0) < 60),
    missing_audio: songs.filter(s => !s.audio_url),
    missing_analysis: songs.filter(s => !s.music_analysis)
  };
}
