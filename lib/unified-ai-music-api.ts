/**
 * UNIFIED AI MUSIC API - FIXED VERSION
 * 
 * Handles both SunoAPI.com and SunoAPI.org with consistent metadata tracking
 */

import { 
  UnifiedSongMetadata, 
  UnifiedTaskResponse, 
  APIProvider,
  SunoComResponse,
  SunoOrgResponse 
} from '@/types/unified-song';
import { 
  mapSunoComResponse, 
  mapSunoOrgResponse, 
  validateMetadata,
  createMetadataLog 
} from '@/lib/metadata-mappers';

export interface CreateMusicRequest {
  task_type: 'create_music' | 'persona_music';
  custom_mode: boolean;
  prompt: string;
  title?: string;
  tags: string;
  persona_id?: string;
  mv: 'chirp-v3-5' | 'chirp-v4' | 'chirp-v4-5' | 'chirp-v4-5-plus';
  is_instrumental?: boolean;
  preferred_provider?: APIProvider;
}

export interface CreateMusicResponse {
  success: boolean;
  message: string;
  task_id: string;
  provider: APIProvider;
  estimated_wait_time: number;
}

/**
 * Creates music using the unified API system
 */
export async function createUnifiedMusic(
  request: CreateMusicRequest, 
  userId: string
): Promise<CreateMusicResponse> {
  const startTime = Date.now();
  
  console.log('\n🎵 UNIFIED API: Starting music creation');
  console.log('🎵 User ID:', userId);
  console.log('🎵 Preferred Provider:', request.preferred_provider || 'auto');
  
  try {
    // Determine which provider to use
    const provider = await selectOptimalProvider(request);
    console.log('🎵 Selected Provider:', provider);
    
    // Create music using the selected provider
    const response = await createMusicWithProvider(request, provider);
    
    const responseTime = Date.now() - startTime;
    console.log('✅ UNIFIED API: Music creation initiated successfully');
    console.log('✅ Response Time:', responseTime + 'ms');
    console.log('✅ Provider Used:', provider);
    console.log('✅ Task ID:', response.task_id);
    
    return {
      success: true,
      message: `Music creation started with ${provider}`,
      task_id: response.task_id,
      provider,
      estimated_wait_time: getEstimatedWaitTime(provider, request.mv)
    };
    
  } catch (error) {
    const errorTime = Date.now() - startTime;
    console.error('❌ UNIFIED API: Music creation failed');
    console.error('❌ Error Time:', errorTime + 'ms');
    console.error('❌ Error:', error);
    
    throw new Error(`Failed to create music: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Gets task status with unified metadata mapping
 */
export async function getUnifiedTaskStatus(
  taskId: string, 
  userId: string,
  originalRequest?: Partial<CreateMusicRequest>
): Promise<UnifiedTaskResponse> {
  const startTime = Date.now();
  
  console.log('\n🔄 UNIFIED API: Getting task status');
  console.log('🔄 Task ID:', taskId);
  console.log('🔄 User ID:', userId);
  
  try {
    // Try both providers to find the task
    const providers: APIProvider[] = ['sunoapi_com', 'sunoapi_org'];
    let lastError: Error | null = null;
    
    for (const provider of providers) {
      try {
        console.log(`🔄 Checking provider: ${provider}`);
        
        const rawResponse = await getTaskStatusFromProvider(taskId, provider);
        
        if (rawResponse && rawResponse.data && rawResponse.data.length > 0) {
          // Map the response to unified format
          const unifiedSongs = rawResponse.data.map((song: SunoComResponse | SunoOrgResponse) => {
            if (provider === 'sunoapi_com') {
              return mapSunoComResponse(song as SunoComResponse, userId, taskId, originalRequest);
            } else {
              return mapSunoOrgResponse(song as SunoOrgResponse, userId, taskId, originalRequest);
            }
          });
          
          // Validate each song's metadata
          const validatedSongs = unifiedSongs.map((song: UnifiedSongMetadata) => {
            const validation = validateMetadata(song, provider);
            
            // Log metadata for debugging
            console.log(createMetadataLog(song, 'status_check', provider, validation));
            
            if (!validation.is_valid) {
              console.warn('⚠️ VALIDATION: Song metadata incomplete:', validation.missing_required);
            }
            
            return song;
          });
          
          const responseTime = Date.now() - startTime;
          console.log('✅ UNIFIED API: Task status retrieved successfully');
          console.log('✅ Provider:', provider);
          console.log('✅ Songs Found:', validatedSongs.length);
          console.log('✅ Response Time:', responseTime + 'ms');
          
          return {
            success: true,
            message: 'Task status retrieved successfully',
            data: validatedSongs,
            metadata: {
              api_provider: provider,
              response_time: responseTime,
              total_songs: validatedSongs.length,
              completed_songs: validatedSongs.filter((s: UnifiedSongMetadata) => s.status === 'completed').length,
              failed_songs: validatedSongs.filter((s: UnifiedSongMetadata) => s.status === 'failed').length,
            }
          };
        }
        
      } catch (error) {
        console.log(`❌ Provider ${provider} failed:`, error);
        lastError = error instanceof Error ? error : new Error(String(error));
        continue;
      }
    }
    
    // If we reach here, neither provider had the task
    throw lastError || new Error('Task not found in any provider');
    
  } catch (error) {
    const errorTime = Date.now() - startTime;
    console.error('❌ UNIFIED API: Failed to get task status');
    console.error('❌ Error Time:', errorTime + 'ms');
    console.error('❌ Error:', error);
    
    return {
      success: false,
      message: `Failed to get task status: ${error instanceof Error ? error.message : 'Unknown error'}`,
      data: [],
      metadata: {
        api_provider: 'sunoapi_com', // Default
        response_time: errorTime,
        total_songs: 0,
        completed_songs: 0,
        failed_songs: 0,
      }
    };
  }
}

/**
 * Selects the optimal provider based on request and current load
 */
async function selectOptimalProvider(request: CreateMusicRequest): Promise<APIProvider> {
  // If user has a preference, use it
  if (request.preferred_provider) {
    return request.preferred_provider;
  }
  
  // Simple load balancing - default to sunoapi_com
  return 'sunoapi_com';
}

/**
 * Creates music with a specific provider
 */
async function createMusicWithProvider(
  request: CreateMusicRequest, 
  provider: APIProvider
): Promise<{ task_id: string }> {
  const endpoint = provider === 'sunoapi_com' ? '/api/music/create' : '/api/music/generate-org';
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  
  if (!response.ok) {
    throw new Error(`${provider} API failed: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Gets task status from a specific provider
 */
async function getTaskStatusFromProvider(taskId: string, provider: APIProvider): Promise<any> {
  const endpoint = provider === 'sunoapi_com' 
    ? `/api/music/task/${taskId}` 
    : `/api/music/status-org/${taskId}`;
  
  const response = await fetch(endpoint, { method: 'GET' });
  
  if (!response.ok) {
    throw new Error(`${provider} status check failed: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Gets estimated wait time based on provider and model
 */
function getEstimatedWaitTime(provider: APIProvider, model: string): number {
  const baseTimes: Record<APIProvider, number> = {
    sunoapi_com: 60000, // 1 minute
    sunoapi_org: 45000, // 45 seconds
  };
  
  const modelMultipliers: Record<string, number> = {
    'chirp-v3-5': 1.0,
    'chirp-v4': 1.2,
    'chirp-v4-5': 1.4,
    'chirp-v4-5-plus': 1.6,
  };
  
  return baseTimes[provider] * (modelMultipliers[model] || 1.0);
}
