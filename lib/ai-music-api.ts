// AI Music API utilities using the MCP server
// This file provides functions to interact with Suno AI API

export interface CreateMusicRequest {
  task_type: 'create_music' | 'persona_music';
  custom_mode: boolean;
  prompt: string;
  title?: string;
  tags: string;
  persona_id?: string;
  mv: 'chirp-v3-5' | 'chirp-v4' | 'chirp-v4-5' | 'chirp-v4-5-plus';
}

export interface MusicTask {
  clip_id: string;
  state: 'pending' | 'running' | 'succeeded' | 'failed';
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

export interface CreateMusicResponse {
  message: string;
  task_id: string;
}

export interface GetTaskResponse {
  code: number;
  data: MusicTask[];
  message: string;
}

export interface CreditsResponse {
  credits: number;
  extra_credits: number;
}

// Note: These functions will use the AI Music API MCP server
// The actual API calls will be made through Next.js API routes

export async function createMusic(request: CreateMusicRequest): Promise<CreateMusicResponse> {
  const response = await fetch('/api/music/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Failed to create music: ${response.statusText}`);
  }

  return response.json();
}

export async function getTaskStatus(taskId: string): Promise<GetTaskResponse> {
  const response = await fetch(`/api/music/task/${taskId}`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error(`Failed to get task status: ${response.statusText}`);
  }

  return response.json();
}

export async function getCredits(): Promise<CreditsResponse> {
  const response = await fetch('/api/music/credits', {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error(`Failed to get credits: ${response.statusText}`);
  }

  return response.json();
}

// Utility function to poll task status until completion
export async function pollTaskUntilComplete(
  taskId: string,
  onProgress?: (status: string) => void,
  maxAttempts: number = 20,
  intervalMs: number = 15000
): Promise<MusicTask[]> {
  console.log('\n🔄 =========================');
  console.log('🔄 POLLING: Starting task polling');
  console.log('🔄 =========================');
  console.log('🔄 Task ID:', taskId);
  console.log('🔄 Max attempts:', maxAttempts);
  console.log('🔄 Interval:', intervalMs + 'ms');
  
  let attempts = 0;
  const startTime = Date.now();
  
  while (attempts < maxAttempts) {
    attempts++;
    console.log(`\n🔄 POLLING: Attempt ${attempts}/${maxAttempts}`);
    
    const attemptStartTime = Date.now();
    try {
      const response = await getTaskStatus(taskId);
      const attemptEndTime = Date.now();
      
      console.log(`🔄 POLLING: API call took ${attemptEndTime - attemptStartTime}ms`);
      console.log('🔄 POLLING: Response code:', response.code);
      console.log('🔄 POLLING: Response data length:', response.data?.length || 0);
      
      if (response.code === 200 && response.data.length > 0) {
        const tasks = response.data;
        console.log(`🔄 POLLING: Found ${tasks.length} tasks in response`);
        
        tasks.forEach((task, index) => {
          console.log(`🔄 POLLING: Task ${index + 1}:`);
          console.log(`   - State: ${task.state}`);
          console.log(`   - Duration: ${task.duration}s`);
          console.log(`   - Audio URL: ${task.audio_url ? 'Present' : 'Missing'}`);
          
          if (task.duration && task.duration < 30) {
            console.warn(`⚠️  POLLING WARNING: Task ${index + 1} has short duration: ${task.duration}s`);
          }
        });
        
        const allCompleted = tasks.every(task => 
          task.state === 'succeeded' || task.state === 'failed'
        );
        
        console.log('🔄 POLLING: All tasks completed?', allCompleted);
        
        if (allCompleted) {
          const totalTime = Date.now() - startTime;
          console.log('✅ POLLING: All tasks completed successfully!');
          console.log('✅ POLLING: Total polling time:', totalTime + 'ms');
          console.log('🔄 =========================');
          console.log('🔄 POLLING: Complete');
          console.log('🔄 =========================\n');
          return tasks;
        }
        
        // Update progress
        const currentState = tasks[0]?.state || 'pending';
        console.log('🔄 POLLING: Current state:', currentState);
        onProgress?.(currentState);
      } else {
        console.log('🔄 POLLING: Invalid response or no data');
      }
    } catch (error) {
      console.error('❌ POLLING: Error during attempt:', error);
    }
    
    if (attempts < maxAttempts) {
      console.log(`🔄 POLLING: Waiting ${intervalMs}ms before next attempt...`);
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }
  }
  
  const totalTime = Date.now() - startTime;
  console.error('❌ POLLING: Timeout after', totalTime + 'ms');
  console.log('🔄 =========================');
  console.log('🔄 POLLING: Failed/Timeout');
  console.log('🔄 =========================\n');
  
  throw new Error('Task polling timeout - music generation took too long');
}

// Helper function to validate music generation request
export function validateMusicRequest(request: Partial<CreateMusicRequest>): string[] {
  const errors: string[] = [];
  
  if (!request.prompt || request.prompt.trim().length === 0) {
    errors.push('Prompt is required');
  }
  
  if (request.prompt && request.prompt.length > 3000) {
    errors.push('Prompt must be less than 3000 characters');
  }
  
  if (!request.tags || request.tags.trim().length === 0) {
    errors.push('Tags are required');
  }
  
  if (request.tags && request.tags.length > 200) {
    errors.push('Tags must be less than 200 characters');
  }
  
  if (!request.mv) {
    errors.push('Music model version is required');
  }
  
  return errors;
}

// Helper function to format duration
export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Helper function to get model display name
export function getModelDisplayName(mv: string): string {
  const modelNames: Record<string, string> = {
    'chirp-v3-5': 'Chirp v3.5',
    'chirp-v4': 'Chirp v4',
    'chirp-v4-5': 'Chirp v4.5',
    'chirp-v4-5-plus': 'Chirp v4.5 Plus',
  };
  
  return modelNames[mv] || mv;
}
