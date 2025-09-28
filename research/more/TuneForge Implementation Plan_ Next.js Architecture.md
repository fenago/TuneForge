# TuneForge Implementation Plan: Next.js Architecture

## Overview

This comprehensive implementation plan provides detailed guidance for enhancing TuneForge using Next.js architecture. The plan leverages both SunoAPI.com and SunoAPI.org capabilities to create a superior music generation platform with dual-mode interface, advanced post-generation tools, and competitive differentiators.

## Architecture Foundation

### Next.js Project Structure

The enhanced TuneForge application follows Next.js 13+ App Router conventions with a clear separation of concerns and scalable architecture.

```
tuneforge/
├── app/
│   ├── api/
│   │   ├── music/
│   │   │   ├── generate/route.ts
│   │   │   ├── extend/route.ts
│   │   │   ├── stems/route.ts
│   │   │   └── persona/route.ts
│   │   └── callback/route.ts
│   ├── dashboard/
│   │   ├── page.tsx
│   │   └── layout.tsx
│   ├── create/
│   │   ├── page.tsx
│   │   ├── quick/page.tsx
│   │   └── advanced/page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/
│   ├── music/
│   └── forms/
├── lib/
│   ├── api/
│   ├── utils/
│   └── types/
└── public/
```

### Environment Configuration

The application requires proper environment variable configuration for API integration and security.

```typescript
// .env.local
SUNOAPI_COM_KEY=your_sunoapi_com_key
SUNOAPI_ORG_KEY=your_sunoapi_org_key
NEXTAUTH_SECRET=your_nextauth_secret
DATABASE_URL=your_database_url
WEBHOOK_SECRET=your_webhook_secret
```

## Core Implementation Components

### 1. Dual-Mode Interface Implementation

The dual-mode interface provides both quick generation and advanced control through a unified component architecture.

**Quick Mode Component (components/music/QuickMode.tsx):**

```typescript
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Sparkles, Music, Heart, Zap } from 'lucide-react'

interface QuickModeProps {
  onGenerate: (prompt: string, preset?: string) => void
  isGenerating: boolean
}

export function QuickMode({ onGenerate, isGenerating }: QuickModeProps) {
  const [prompt, setPrompt] = useState('')

  const presets = [
    { 
      id: 'chill', 
      label: 'Chill Vibes', 
      icon: Heart,
      prompt: 'A relaxing, ambient track with soft melodies and gentle rhythms perfect for studying or unwinding'
    },
    { 
      id: 'energetic', 
      label: 'Energetic Anthem', 
      icon: Zap,
      prompt: 'An upbeat, motivational song with driving beats and inspiring melodies that energizes and motivates'
    },
    { 
      id: 'emotional', 
      label: 'Emotional Ballad', 
      icon: Music,
      prompt: 'A heartfelt ballad with emotional vocals and touching lyrics that tells a meaningful story'
    }
  ]

  const handlePresetClick = (preset: typeof presets[0]) => {
    setPrompt(preset.prompt)
    onGenerate(preset.prompt, preset.id)
  }

  const handleGenerate = () => {
    if (prompt.trim()) {
      onGenerate(prompt)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-2xl">
          <Sparkles className="h-6 w-6 text-purple-500" />
          Surprise Me Mode
        </CardTitle>
        <p className="text-muted-foreground">
          Describe your musical vision and let AI create something amazing
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Textarea
            placeholder="Describe your musical vision in a few words... (e.g., 'A dreamy song about summer nights and fireflies')"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[100px] resize-none"
            maxLength={500}
          />
          <p className="text-sm text-muted-foreground mt-2">
            {prompt.length}/500 characters
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {presets.map((preset) => {
            const Icon = preset.icon
            return (
              <Button
                key={preset.id}
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={() => handlePresetClick(preset)}
                disabled={isGenerating}
              >
                <Icon className="h-5 w-5" />
                <span className="text-sm font-medium">{preset.label}</span>
              </Button>
            )
          })}
        </div>

        <Button
          onClick={handleGenerate}
          disabled={!prompt.trim() || isGenerating}
          className="w-full h-12 text-lg"
          size="lg"
        >
          {isGenerating ? (
            <>
              <Music className="mr-2 h-5 w-5 animate-spin" />
              Creating Your Song...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-5 w-5" />
              Create My Song
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
```

**Advanced Mode Component (components/music/AdvancedMode.tsx):**

```typescript
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface AdvancedModeProps {
  onGenerate: (config: MusicGenerationConfig) => void
  isGenerating: boolean
}

interface MusicGenerationConfig {
  title: string
  prompt: string
  style: string
  model: string
  customMode: boolean
  instrumental: boolean
  vocalGender?: 'm' | 'f'
  styleWeight: number
  weirdnessConstraint: number
  negativeTags: string
}

export function AdvancedMode({ onGenerate, isGenerating }: AdvancedModeProps) {
  const [config, setConfig] = useState<MusicGenerationConfig>({
    title: '',
    prompt: '',
    style: '',
    model: 'V4',
    customMode: true,
    instrumental: false,
    styleWeight: 0.7,
    weirdnessConstraint: 0.5,
    negativeTags: ''
  })

  const genres = [
    'pop', 'rock', 'electronic', 'hip-hop', 'jazz', 'classical', 
    'country', 'r&b', 'indie', 'folk', 'blues', 'reggae'
  ]

  const moods = [
    'upbeat', 'mellow', 'energetic', 'chill', 'emotional', 
    'powerful', 'smooth', 'dreamy', 'dark', 'bright'
  ]

  const models = [
    { value: 'V3_5', label: 'Chirp v3.5', description: 'Fast generation, creative diversity' },
    { value: 'V4', label: 'Chirp v4', description: 'Balanced quality and speed (Recommended)' },
    { value: 'V4_5', label: 'Chirp v4.5', description: 'Superior genre blending, up to 8 minutes' },
    { value: 'V4_5PLUS', label: 'Chirp v4.5 Plus', description: 'Ultimate quality for professional use' },
    { value: 'V5', label: 'Chirp v5', description: 'Latest model with superior expression' }
  ]

  const addStyleTag = (tag: string) => {
    const currentTags = config.style.split(',').map(t => t.trim()).filter(Boolean)
    if (!currentTags.includes(tag)) {
      const newStyle = [...currentTags, tag].join(', ')
      setConfig(prev => ({ ...prev, style: newStyle }))
    }
  }

  const removeStyleTag = (tagToRemove: string) => {
    const currentTags = config.style.split(',').map(t => t.trim()).filter(Boolean)
    const newStyle = currentTags.filter(tag => tag !== tagToRemove).join(', ')
    setConfig(prev => ({ ...prev, style: newStyle }))
  }

  const handleGenerate = () => {
    onGenerate(config)
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Advanced Music Creation</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="basics" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basics">Basics</TabsTrigger>
              <TabsTrigger value="style">Style</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
              <TabsTrigger value="model">Model</TabsTrigger>
            </TabsList>

            <TabsContent value="basics" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Song Title</Label>
                  <Input
                    id="title"
                    value={config.title}
                    onChange={(e) => setConfig(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="My Amazing Song"
                    maxLength={80}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="instrumental"
                    checked={config.instrumental}
                    onCheckedChange={(checked) => setConfig(prev => ({ ...prev, instrumental: checked }))}
                  />
                  <Label htmlFor="instrumental">Instrumental only</Label>
                </div>
              </div>

              <div>
                <Label htmlFor="prompt">
                  {config.instrumental ? 'Song Description' : 'Lyrics or Song Concept'}
                </Label>
                <Textarea
                  id="prompt"
                  value={config.prompt}
                  onChange={(e) => setConfig(prev => ({ ...prev, prompt: e.target.value }))}
                  placeholder={config.instrumental 
                    ? "Describe the mood and style of your instrumental track..."
                    : "Enter your lyrics or describe the song concept..."
                  }
                  className="min-h-[120px]"
                  maxLength={config.model.includes('V4_5') || config.model === 'V5' ? 5000 : 3000}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  {config.prompt.length}/{config.model.includes('V4_5') || config.model === 'V5' ? 5000 : 3000} characters
                </p>
              </div>

              {!config.instrumental && (
                <div>
                  <Label>Voice Gender</Label>
                  <Select
                    value={config.vocalGender || 'auto'}
                    onValueChange={(value) => setConfig(prev => ({ 
                      ...prev, 
                      vocalGender: value === 'auto' ? undefined : value as 'm' | 'f'
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Let AI Decide</SelectItem>
                      <SelectItem value="m">Male Voice</SelectItem>
                      <SelectItem value="f">Female Voice</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </TabsContent>

            <TabsContent value="style" className="space-y-4">
              <div>
                <Label>Music Style & Tags</Label>
                <Textarea
                  value={config.style}
                  onChange={(e) => setConfig(prev => ({ ...prev, style: e.target.value }))}
                  placeholder="pop, electronic, upbeat, emotional..."
                  className="min-h-[80px]"
                  maxLength={config.model.includes('V4_5') || config.model === 'V5' ? 1000 : 200}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  {config.style.length}/{config.model.includes('V4_5') || config.model === 'V5' ? 1000 : 200} characters
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium">Quick Genre Tags</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {genres.map(genre => (
                    <Button
                      key={genre}
                      variant="outline"
                      size="sm"
                      onClick={() => addStyleTag(genre)}
                      className="h-8"
                    >
                      + {genre}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Mood Tags</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {moods.map(mood => (
                    <Button
                      key={mood}
                      variant="outline"
                      size="sm"
                      onClick={() => addStyleTag(mood)}
                      className="h-8"
                    >
                      + {mood}
                    </Button>
                  ))}
                </div>
              </div>

              {config.style && (
                <div>
                  <Label className="text-sm font-medium">Current Tags</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {config.style.split(',').map(tag => tag.trim()).filter(Boolean).map(tag => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => removeStyleTag(tag)}
                      >
                        {tag} ×
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="advanced" className="space-y-6">
              <div>
                <Label>Style Weight: {config.styleWeight}</Label>
                <Slider
                  value={[config.styleWeight]}
                  onValueChange={([value]) => setConfig(prev => ({ ...prev, styleWeight: value }))}
                  max={1}
                  min={0}
                  step={0.01}
                  className="mt-2"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  How strongly the style influences the generation
                </p>
              </div>

              <div>
                <Label>Creativity Level: {config.weirdnessConstraint}</Label>
                <Slider
                  value={[config.weirdnessConstraint]}
                  onValueChange={([value]) => setConfig(prev => ({ ...prev, weirdnessConstraint: value }))}
                  max={1}
                  min={0}
                  step={0.01}
                  className="mt-2"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Higher values create more experimental and unique results
                </p>
              </div>

              <div>
                <Label htmlFor="negativeTags">Negative Tags</Label>
                <Input
                  id="negativeTags"
                  value={config.negativeTags}
                  onChange={(e) => setConfig(prev => ({ ...prev, negativeTags: e.target.value }))}
                  placeholder="piano, drums, heavy metal..."
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Elements to avoid in the generation
                </p>
              </div>
            </TabsContent>

            <TabsContent value="model" className="space-y-4">
              <div>
                <Label>AI Model Selection</Label>
                <div className="grid gap-3 mt-2">
                  {models.map(model => (
                    <Card
                      key={model.value}
                      className={`cursor-pointer transition-colors ${
                        config.model === model.value 
                          ? 'border-primary bg-primary/5' 
                          : 'hover:border-primary/50'
                      }`}
                      onClick={() => setConfig(prev => ({ ...prev, model: model.value }))}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{model.label}</h4>
                            <p className="text-sm text-muted-foreground">{model.description}</p>
                          </div>
                          <div className={`w-4 h-4 rounded-full border-2 ${
                            config.model === model.value 
                              ? 'border-primary bg-primary' 
                              : 'border-muted-foreground'
                          }`} />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-6">
            <Button
              onClick={handleGenerate}
              disabled={!config.title || !config.prompt || isGenerating}
              className="w-full h-12 text-lg"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Music className="mr-2 h-5 w-5 animate-spin" />
                  Generating Music...
                </>
              ) : (
                'Generate Music'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

### 2. API Route Implementation

The Next.js API routes handle communication with both SunoAPI services and provide a unified interface for the frontend.

**Music Generation API Route (app/api/music/generate/route.ts):**

```typescript
import { NextRequest, NextResponse } from 'next/server'

interface GenerateRequest {
  mode: 'quick' | 'advanced'
  prompt: string
  title?: string
  style?: string
  model?: string
  customMode?: boolean
  instrumental?: boolean
  vocalGender?: 'm' | 'f'
  styleWeight?: number
  weirdnessConstraint?: number
  negativeTags?: string
  preset?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json()
    
    // Choose API based on requirements
    const useOrgAPI = body.mode === 'quick' || body.model === 'V5'
    
    if (useOrgAPI) {
      return await generateWithSunoAPIOrg(body)
    } else {
      return await generateWithSunoAPICom(body)
    }
  } catch (error) {
    console.error('Generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate music' },
      { status: 500 }
    )
  }
}

async function generateWithSunoAPIOrg(config: GenerateRequest) {
  const apiUrl = 'https://api.sunoapi.org/api/v1/generate'
  
  const requestData = {
    prompt: config.prompt,
    customMode: config.mode === 'advanced' && config.customMode,
    instrumental: config.instrumental || false,
    model: config.model || 'V4',
    callBackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/callback`,
    ...(config.mode === 'advanced' && config.customMode && {
      style: config.style,
      title: config.title,
      vocalGender: config.vocalGender,
      styleWeight: config.styleWeight,
      weirdnessConstraint: config.weirdnessConstraint,
      negativeTags: config.negativeTags
    })
  }

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.SUNOAPI_ORG_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestData)
  })

  const result = await response.json()
  
  if (!response.ok) {
    throw new Error(result.msg || 'API request failed')
  }

  return NextResponse.json({
    success: true,
    taskId: result.data.taskId,
    provider: 'sunoapi.org'
  })
}

async function generateWithSunoAPICom(config: GenerateRequest) {
  const apiUrl = 'https://api.sunoapi.com/api/v1/suno/create'
  
  const requestData = {
    custom_mode: config.customMode || false,
    prompt: config.prompt,
    title: config.title,
    tags: config.style,
    style_weight: config.styleWeight,
    weirdness_constraint: config.weirdnessConstraint,
    negative_tags: config.negativeTags,
    make_instrumental: config.instrumental || false,
    mv: config.model || 'chirp-v4'
  }

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.SUNOAPI_COM_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestData)
  })

  const result = await response.json()
  
  if (!response.ok) {
    throw new Error(result.message || 'API request failed')
  }

  return NextResponse.json({
    success: true,
    taskId: result.task_id,
    provider: 'sunoapi.com'
  })
}
```

**Music Extension API Route (app/api/music/extend/route.ts):**

```typescript
import { NextRequest, NextResponse } from 'next/server'

interface ExtendRequest {
  clipId: string
  continueAt: number
  prompt?: string
  style?: string
  model?: string
}

export async function POST(request: NextRequest) {
  try {
    const { clipId, continueAt, prompt, style, model }: ExtendRequest = await request.json()
    
    const apiUrl = 'https://api.sunoapi.com/api/v1/suno/create'
    
    const requestData = {
      task_type: 'extend_music',
      continue_clip_id: clipId,
      continue_at: continueAt,
      custom_mode: !!prompt,
      prompt: prompt || '',
      tags: style || '',
      mv: model || 'chirp-v4'
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SUNOAPI_COM_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    })

    const result = await response.json()
    
    if (!response.ok) {
      throw new Error(result.message || 'Extension failed')
    }

    return NextResponse.json({
      success: true,
      taskId: result.task_id
    })
  } catch (error) {
    console.error('Extension error:', error)
    return NextResponse.json(
      { error: 'Failed to extend music' },
      { status: 500 }
    )
  }
}
```

### 3. Real-time Progress Tracking

Implement WebSocket or Server-Sent Events for real-time generation progress updates.

**Progress Tracking Hook (lib/hooks/useGenerationProgress.ts):**

```typescript
import { useState, useEffect, useCallback } from 'react'

interface GenerationProgress {
  taskId: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number
  stage: string
  result?: {
    audioUrl: string
    imageUrl?: string
    duration?: number
  }
}

export function useGenerationProgress(taskId: string | null) {
  const [progress, setProgress] = useState<GenerationProgress | null>(null)
  const [error, setError] = useState<string | null>(null)

  const checkProgress = useCallback(async () => {
    if (!taskId) return

    try {
      const response = await fetch(`/api/music/status/${taskId}`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to check progress')
      }

      setProgress(data)
      
      // If completed or failed, stop polling
      if (data.status === 'completed' || data.status === 'failed') {
        return true // Stop polling
      }
      
      return false // Continue polling
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      return true // Stop polling on error
    }
  }, [taskId])

  useEffect(() => {
    if (!taskId) {
      setProgress(null)
      setError(null)
      return
    }

    // Initial check
    checkProgress()

    // Set up polling
    const interval = setInterval(async () => {
      const shouldStop = await checkProgress()
      if (shouldStop) {
        clearInterval(interval)
      }
    }, 2000) // Poll every 2 seconds

    return () => clearInterval(interval)
  }, [taskId, checkProgress])

  return { progress, error }
}
```

### 4. Enhanced Post-Generation Tools

**Post-Generation Enhancement Component (components/music/EnhancementHub.tsx):**

```typescript
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Play, 
  Download, 
  Scissors, 
  Copy, 
  Waveform, 
  Video,
  Plus,
  RefreshCw
} from 'lucide-react'

interface GeneratedSong {
  id: string
  title: string
  audioUrl: string
  duration: number
  imageUrl?: string
  clipId: string
}

interface EnhancementHubProps {
  song: GeneratedSong
  onEnhance: (type: string, config: any) => void
}

export function EnhancementHub({ song, onEnhance }: EnhancementHubProps) {
  const [extendAt, setExtendAt] = useState(song.duration)
  const [isPlaying, setIsPlaying] = useState(false)

  const enhancements = [
    {
      id: 'extend',
      title: 'Extend Song',
      description: 'Add more content to make your song longer',
      icon: Plus,
      action: () => onEnhance('extend', { clipId: song.clipId, continueAt: extendAt })
    },
    {
      id: 'variations',
      title: 'Create Variations',
      description: 'Generate alternative versions with different styles',
      icon: RefreshCw,
      action: () => onEnhance('variations', { clipId: song.clipId })
    },
    {
      id: 'stems',
      title: 'Extract Stems',
      description: 'Separate vocals, drums, and instruments',
      icon: Waveform,
      action: () => onEnhance('stems', { clipId: song.clipId })
    },
    {
      id: 'video',
      title: 'Create Music Video',
      description: 'Generate a visual accompaniment',
      icon: Video,
      action: () => onEnhance('video', { audioUrl: song.audioUrl, imageUrl: song.imageUrl })
    }
  ]

  return (
    <div className="space-y-6">
      {/* Song Player */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            {song.imageUrl && (
              <img 
                src={song.imageUrl} 
                alt={song.title}
                className="w-16 h-16 rounded-lg object-cover"
              />
            )}
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{song.title}</h3>
              <p className="text-muted-foreground">
                Duration: {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}
              </p>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                <Play className="h-4 w-4 mr-2" />
                {isPlaying ? 'Pause' : 'Play'}
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
          
          {/* Audio Player */}
          <audio 
            src={song.audioUrl} 
            controls 
            className="w-full mt-4"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
        </CardContent>
      </Card>

      {/* Enhancement Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {enhancements.map((enhancement) => {
          const Icon = enhancement.icon
          return (
            <Card key={enhancement.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Icon className="h-5 w-5 text-primary" />
                  {enhancement.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm mb-4">
                  {enhancement.description}
                </p>
                
                {enhancement.id === 'extend' && (
                  <div className="space-y-3 mb-4">
                    <Label>Extend from: {extendAt}s</Label>
                    <Slider
                      value={[extendAt]}
                      onValueChange={([value]) => setExtendAt(value)}
                      max={song.duration}
                      min={0}
                      step={1}
                    />
                  </div>
                )}
                
                <Button 
                  onClick={enhancement.action}
                  className="w-full"
                  variant="outline"
                >
                  {enhancement.title}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
              Create Instrumental Version
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
              Change Vocal Style
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
              Add Harmony
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
              Remix Style
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

## Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2)
Establish the core dual-mode interface and basic API integration. Implement the Quick Mode for immediate user value and Advanced Mode for power users. Set up proper Next.js API routes and error handling.

### Phase 2: Enhancement Features (Weeks 3-4)
Add post-generation tools including music extension, stem separation, and variation creation. Implement real-time progress tracking and improve user feedback during generation.

### Phase 3: Advanced Features (Weeks 5-6)
Integrate persona creation, music video generation, and advanced audio processing features. Add project management and collaboration tools.

### Phase 4: Optimization (Weeks 7-8)
Implement performance optimizations, cost management features, and comprehensive testing. Add analytics and user behavior tracking for continuous improvement.

This implementation plan provides a solid foundation for transforming TuneForge into a comprehensive music creation platform that leverages the full capabilities of both SunoAPI services while providing an exceptional user experience through Next.js architecture.
