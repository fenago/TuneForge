# Dual API Integration Strategy: SunoAPI.com + SunoAPI.org

## Strategic Integration Overview

Integrating both SunoAPI.com and SunoAPI.org creates a powerful synergy that leverages the unique strengths of each platform while providing redundancy and enhanced functionality. This dual-API approach positions TuneForge as a more robust and feature-rich platform than competitors using single API sources.

## API Capability Matrix

| Feature Category | SunoAPI.com | SunoAPI.org | Recommended Primary |
|------------------|-------------|-------------|-------------------|
| **Core Music Generation** | ✅ Advanced | ✅ Standard | SunoAPI.com |
| **Lyrics Generation** | ❌ Limited | ✅ Dedicated | SunoAPI.org |
| **Music Extension** | ✅ Full Support | ✅ Basic | SunoAPI.com |
| **Stem Separation** | ✅ Advanced (12 tracks) | ✅ Basic (2 tracks) | SunoAPI.com |
| **Persona Creation** | ✅ Full Support | ❌ Not Available | SunoAPI.com |
| **Music Video** | ❌ Not Available | ✅ Full Support | SunoAPI.org |
| **Streaming Output** | ❌ Not Available | ✅ 20-second streaming | SunoAPI.org |
| **Model Variety** | ✅ Suno + Riffusion + Nuro | ✅ Suno Only | SunoAPI.com |
| **Callback System** | ✅ Basic | ✅ Advanced (3-stage) | SunoAPI.org |
| **Pricing** | $0.08/generation | Variable/competitive | Context-dependent |

## Implementation Architecture

### Unified API Gateway Pattern

**Central API Router (lib/api/router.ts):**

```typescript
interface APIRequest {
  operation: string
  payload: any
  preferences?: {
    preferredProvider?: 'sunoapi-com' | 'sunoapi-org'
    fallbackEnabled?: boolean
    costOptimized?: boolean
  }
}

interface APIResponse {
  success: boolean
  data?: any
  error?: string
  provider: string
  cost?: number
  executionTime?: number
}

class APIRouter {
  private providers = {
    'sunoapi-com': new SunoAPIComClient(),
    'sunoapi-org': new SunoAPIOrgClient()
  }

  async route(request: APIRequest): Promise<APIResponse> {
    const provider = this.selectProvider(request)
    
    try {
      const startTime = Date.now()
      const result = await this.providers[provider].execute(request)
      const executionTime = Date.now() - startTime
      
      return {
        success: true,
        data: result,
        provider,
        executionTime
      }
    } catch (error) {
      if (request.preferences?.fallbackEnabled) {
        return this.handleFallback(request, provider, error)
      }
      
      return {
        success: false,
        error: error.message,
        provider
      }
    }
  }

  private selectProvider(request: APIRequest): string {
    // Explicit preference
    if (request.preferences?.preferredProvider) {
      return request.preferences.preferredProvider
    }

    // Operation-based routing
    const operationRouting = {
      'generate-lyrics': 'sunoapi-org',
      'create-persona': 'sunoapi-com',
      'separate-stems': 'sunoapi-com',
      'create-video': 'sunoapi-org',
      'generate-music': this.selectMusicProvider(request),
      'extend-music': 'sunoapi-com'
    }

    return operationRouting[request.operation] || 'sunoapi-com'
  }

  private selectMusicProvider(request: APIRequest): string {
    // Use SunoAPI.org for quick/streaming generation
    if (request.payload.mode === 'quick' || request.payload.streaming) {
      return 'sunoapi-org'
    }
    
    // Use SunoAPI.com for advanced features
    if (request.payload.persona || request.payload.customMode) {
      return 'sunoapi-com'
    }

    // Cost optimization logic
    if (request.preferences?.costOptimized) {
      return this.getCheaperProvider()
    }

    return 'sunoapi-com' // Default to more feature-rich option
  }

  private async handleFallback(
    request: APIRequest, 
    failedProvider: string, 
    error: any
  ): Promise<APIResponse> {
    const fallbackProvider = failedProvider === 'sunoapi-com' 
      ? 'sunoapi-org' 
      : 'sunoapi-com'

    // Adapt request for fallback provider if needed
    const adaptedRequest = this.adaptRequestForProvider(request, fallbackProvider)
    
    try {
      const result = await this.providers[fallbackProvider].execute(adaptedRequest)
      return {
        success: true,
        data: result,
        provider: fallbackProvider,
        fallbackUsed: true,
        originalError: error.message
      }
    } catch (fallbackError) {
      return {
        success: false,
        error: `Both providers failed. Primary: ${error.message}, Fallback: ${fallbackError.message}`,
        provider: failedProvider
      }
    }
  }

  private adaptRequestForProvider(request: APIRequest, provider: string): APIRequest {
    // Adapt request parameters based on provider capabilities
    const adapted = { ...request }
    
    if (provider === 'sunoapi-org' && request.operation === 'generate-music') {
      // Convert SunoAPI.com format to SunoAPI.org format
      adapted.payload = {
        prompt: request.payload.prompt,
        customMode: request.payload.custom_mode,
        instrumental: request.payload.make_instrumental,
        model: this.mapModelVersion(request.payload.mv),
        style: request.payload.tags,
        title: request.payload.title
      }
    }

    return adapted
  }

  private mapModelVersion(sunoComModel: string): string {
    const modelMap = {
      'chirp-v3-5': 'V3_5',
      'chirp-v4': 'V4',
      'chirp-v4-5': 'V4_5',
      'chirp-v4-5-plus': 'V4_5PLUS',
      'chirp-v5': 'V5'
    }
    return modelMap[sunoComModel] || 'V4'
  }

  private getCheaperProvider(): string {
    // Implement dynamic pricing comparison
    // This could check current rates or use cached pricing data
    return 'sunoapi-org' // Placeholder - implement actual cost comparison
  }
}
```

### Provider-Specific Clients

**SunoAPI.com Client (lib/api/sunoapi-com.ts):**

```typescript
export class SunoAPIComClient {
  private baseURL = 'https://api.sunoapi.com/api/v1'
  private apiKey = process.env.SUNOAPI_COM_KEY

  async execute(request: APIRequest): Promise<any> {
    const endpoint = this.getEndpoint(request.operation)
    const payload = this.formatPayload(request.operation, request.payload)

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'SunoAPI.com request failed')
    }

    return response.json()
  }

  private getEndpoint(operation: string): string {
    const endpoints = {
      'generate-music': '/suno/create',
      'extend-music': '/suno/create',
      'create-persona': '/suno/persona',
      'separate-stems': '/suno/stems',
      'cover-music': '/suno/create'
    }
    return endpoints[operation] || '/suno/create'
  }

  private formatPayload(operation: string, payload: any): any {
    switch (operation) {
      case 'generate-music':
        return {
          custom_mode: payload.customMode || false,
          prompt: payload.prompt,
          title: payload.title,
          tags: payload.style,
          make_instrumental: payload.instrumental || false,
          mv: payload.model || 'chirp-v4',
          style_weight: payload.styleWeight,
          weirdness_constraint: payload.weirdnessConstraint,
          negative_tags: payload.negativeTags
        }
      
      case 'extend-music':
        return {
          task_type: 'extend_music',
          continue_clip_id: payload.clipId,
          continue_at: payload.continueAt,
          custom_mode: payload.customMode || false,
          prompt: payload.prompt || '',
          mv: payload.model || 'chirp-v4'
        }
      
      case 'create-persona':
        return {
          name: payload.name,
          description: payload.description,
          continue_clip_id: payload.clipId
        }
      
      default:
        return payload
    }
  }
}
```

**SunoAPI.org Client (lib/api/sunoapi-org.ts):**

```typescript
export class SunoAPIOrgClient {
  private baseURL = 'https://api.sunoapi.org/api/v1'
  private apiKey = process.env.SUNOAPI_ORG_KEY

  async execute(request: APIRequest): Promise<any> {
    const endpoint = this.getEndpoint(request.operation)
    const payload = this.formatPayload(request.operation, request.payload)

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.msg || 'SunoAPI.org request failed')
    }

    return response.json()
  }

  private getEndpoint(operation: string): string {
    const endpoints = {
      'generate-music': '/generate',
      'generate-lyrics': '/lyrics/generate',
      'create-video': '/video/create',
      'extend-music': '/extend',
      'separate-stems': '/separate'
    }
    return endpoints[operation] || '/generate'
  }

  private formatPayload(operation: string, payload: any): any {
    switch (operation) {
      case 'generate-music':
        return {
          prompt: payload.prompt,
          customMode: payload.customMode || false,
          instrumental: payload.instrumental || false,
          model: payload.model || 'V4',
          style: payload.style,
          title: payload.title,
          vocalGender: payload.vocalGender,
          styleWeight: payload.styleWeight,
          weirdnessConstraint: payload.weirdnessConstraint,
          callBackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/callback`
        }
      
      case 'generate-lyrics':
        return {
          prompt: payload.concept,
          maxLength: 2500,
          structure: payload.structure,
          rhymeScheme: payload.rhymeScheme,
          genre: payload.genre,
          mood: payload.mood,
          language: payload.language
        }
      
      case 'create-video':
        return {
          song_url: payload.audioUrl,
          image_url: payload.imageUrl
        }
      
      default:
        return payload
    }
  }
}
```

## Smart Feature Routing

### Lyrics Lab Integration

**Enhanced Lyrics API Route (app/api/lyrics/generate/route.ts):**

```typescript
import { APIRouter } from '@/lib/api/router'

export async function POST(request: NextRequest) {
  const router = new APIRouter()
  
  try {
    const config = await request.json()
    
    const apiRequest = {
      operation: 'generate-lyrics',
      payload: config,
      preferences: {
        preferredProvider: 'sunoapi-org',
        fallbackEnabled: true
      }
    }

    const result = await router.route(apiRequest)
    
    if (!result.success) {
      throw new Error(result.error)
    }

    return NextResponse.json({
      success: true,
      lyrics: result.data,
      provider: result.provider,
      executionTime: result.executionTime
    })
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
```

### Music Generation with Provider Selection

**Enhanced Music Generation Route (app/api/music/generate/route.ts):**

```typescript
import { APIRouter } from '@/lib/api/router'

export async function POST(request: NextRequest) {
  const router = new APIRouter()
  
  try {
    const config = await request.json()
    
    // Determine optimal provider based on request
    let preferredProvider = null
    
    if (config.mode === 'quick') {
      preferredProvider = 'sunoapi-org' // Better for streaming
    } else if (config.persona || config.advancedFeatures) {
      preferredProvider = 'sunoapi-com' // Better for advanced features
    }

    const apiRequest = {
      operation: 'generate-music',
      payload: config,
      preferences: {
        preferredProvider,
        fallbackEnabled: true,
        costOptimized: config.costOptimized || false
      }
    }

    const result = await router.route(apiRequest)
    
    if (!result.success) {
      throw new Error(result.error)
    }

    return NextResponse.json({
      success: true,
      taskId: result.data.taskId || result.data.task_id,
      provider: result.provider,
      executionTime: result.executionTime,
      fallbackUsed: result.fallbackUsed
    })
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
```

## Cost Optimization and Analytics

### Usage Analytics System

**Analytics Tracking (lib/analytics/usage-tracker.ts):**

```typescript
interface UsageEvent {
  operation: string
  provider: string
  cost: number
  executionTime: number
  success: boolean
  userId?: string
  timestamp: Date
}

export class UsageTracker {
  private events: UsageEvent[] = []

  track(event: Omit<UsageEvent, 'timestamp'>) {
    this.events.push({
      ...event,
      timestamp: new Date()
    })
    
    // Persist to database
    this.persistEvent(event)
  }

  async getProviderStats(timeRange: string) {
    // Analyze provider performance and costs
    const stats = await this.analyzeUsage(timeRange)
    return {
      totalRequests: stats.totalRequests,
      successRate: stats.successRate,
      averageCost: stats.averageCost,
      averageExecutionTime: stats.averageExecutionTime,
      providerBreakdown: stats.providerBreakdown
    }
  }

  async getRecommendations() {
    const recentStats = await this.getProviderStats('7d')
    
    return {
      costOptimization: this.analyzeCostOptimization(recentStats),
      performanceOptimization: this.analyzePerformance(recentStats),
      reliabilityOptimization: this.analyzeReliability(recentStats)
    }
  }

  private async persistEvent(event: UsageEvent) {
    // Store in database for analytics
  }

  private async analyzeUsage(timeRange: string) {
    // Implement usage analysis logic
  }

  private analyzeCostOptimization(stats: any) {
    // Provide cost optimization recommendations
  }

  private analyzePerformance(stats: any) {
    // Provide performance optimization recommendations
  }

  private analyzeReliability(stats: any) {
    // Provide reliability optimization recommendations
  }
}
```

## Error Handling and Resilience

### Circuit Breaker Pattern

**Circuit Breaker Implementation (lib/api/circuit-breaker.ts):**

```typescript
enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN'
}

export class CircuitBreaker {
  private state = CircuitState.CLOSED
  private failureCount = 0
  private lastFailureTime = 0
  private successCount = 0

  constructor(
    private threshold = 5,
    private timeout = 60000,
    private monitoringPeriod = 10000
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = CircuitState.HALF_OPEN
        this.successCount = 0
      } else {
        throw new Error('Circuit breaker is OPEN')
      }
    }

    try {
      const result = await operation()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure()
      throw error
    }
  }

  private onSuccess() {
    this.failureCount = 0
    
    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++
      if (this.successCount >= 3) {
        this.state = CircuitState.CLOSED
      }
    }
  }

  private onFailure() {
    this.failureCount++
    this.lastFailureTime = Date.now()
    
    if (this.failureCount >= this.threshold) {
      this.state = CircuitState.OPEN
    }
  }

  getState() {
    return this.state
  }
}
```

## Implementation Timeline

### Phase 1: Foundation (Week 1-2)
Implement the basic API router and provider clients. Set up the dual API architecture with simple routing logic based on operation type.

### Phase 2: Smart Routing (Week 3-4)
Add intelligent provider selection based on request characteristics, cost optimization, and performance metrics. Implement fallback mechanisms.

### Phase 3: Analytics and Optimization (Week 5-6)
Build usage tracking, analytics dashboard, and automated optimization recommendations. Add circuit breaker patterns for resilience.

### Phase 4: Advanced Features (Week 7-8)
Implement advanced routing strategies, A/B testing for provider selection, and machine learning-based optimization.

This dual API integration strategy provides TuneForge with unprecedented flexibility, reliability, and feature richness while optimizing costs and performance. The intelligent routing system ensures users always get the best possible experience regardless of which underlying service is used.
