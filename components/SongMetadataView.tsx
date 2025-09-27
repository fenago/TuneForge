'use client';

import React, { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Song {
  _id: string;
  title: string;
  description?: string;
  genre: string;
  mood: string;
  duration: number;
  prompt: string;
  aiModel: string;
  generationParams?: {
    style?: string;
    tempo?: number;
    key?: string;
    instruments?: string[];
  };
  files: {
    audioUrl?: string;
    videoUrl?: string;
    thumbnailUrl?: string;
    fileFormats?: {
      audio?: string;
      video?: string;
      thumbnail?: string;
    };
    fileSizes?: {
      audio?: number;
      video?: number;
      thumbnail?: number;
    };
    quality?: {
      audioBitrate?: number;
      videoResolution?: string;
      thumbnailDimensions?: {
        width?: number;
        height?: number;
      };
    };
  };
  status: string;
  isPublic: boolean;
  tags: string[];
  playCount: number;
  downloadCount: number;
  shareCount: number;
  taskId?: string;
  clipId?: string;
  lyrics?: string;
  originalCreatedAt?: string;
  generationTime?: number;
  generationAnalytics?: {
    pollingAttempts?: number;
    totalWaitTime?: number;
    apiResponseCode?: number;
    apiResponseTime?: number;
  };
  musicAnalysis?: {
    energy?: number;
    valence?: number;
    danceability?: number;
    acousticness?: number;
    instrumentalness?: number;
    liveness?: number;
    speechiness?: number;
    genreConfidence?: number;
    moodConfidence?: number;
    loudness?: number;
    modality?: number;
    timeSignature?: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface SongMetadataViewProps {
  song: Song;
}

const formatFileSize = (bytes?: number): string => {
  if (!bytes) return 'N/A';
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const formatPercentage = (value?: number): string => {
  if (value === undefined || value === null) return 'N/A';
  return `${Math.round(value * 100)}%`;
};

const formatDate = (dateString?: string): string => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString();
};

export default function SongMetadataView({ song }: SongMetadataViewProps) {
  const [expanded, setExpanded] = useState(false);

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  return (
    <div className="w-full">
      {/* Basic Song Info - Always Visible */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold">{song.title}</h3>
          <div className="flex gap-2 mt-1">
            <Badge variant="secondary">{song.genre}</Badge>
            <Badge variant="outline">{song.mood}</Badge>
            <Badge variant="outline">{formatDuration(song.duration)}</Badge>
          </div>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={toggleExpanded}
          className="ml-4"
        >
          {expanded ? (
            <>
              Hide Details <ChevronUpIcon className="w-4 h-4 ml-1" />
            </>
          ) : (
            <>
              Show Details <ChevronDownIcon className="w-4 h-4 ml-1" />
            </>
          )}
        </Button>
      </div>

      {/* Detailed Metadata - Expandable */}
      {expanded && (
        <div className="space-y-6">
          {/* Generation Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Generation Information</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong>AI Model:</strong> {song.aiModel}
                </div>
                <div>
                  <strong>Generation Time:</strong> {song.generationTime ? `${song.generationTime}s` : 'N/A'}
                </div>
                <div>
                  <strong>Task ID:</strong> {song.taskId || 'N/A'}
                </div>
                <div>
                  <strong>Clip ID:</strong> {song.clipId || 'N/A'}
                </div>
                <div>
                  <strong>Status:</strong> 
                  <Badge variant={song.status === 'completed' ? 'default' : 'secondary'} className="ml-2">
                    {song.status}
                  </Badge>
                </div>
                <div>
                  <strong>Original Created:</strong> {formatDate(song.originalCreatedAt)}
                </div>
              </div>
              
              {song.generationAnalytics && (
                <div className="mt-4 pt-4 border-t">
                  <h4 className="font-medium mb-2">Generation Analytics</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <strong>Polling Attempts:</strong> {song.generationAnalytics.pollingAttempts || 'N/A'}
                    </div>
                    <div>
                      <strong>Total Wait Time:</strong> {song.generationAnalytics.totalWaitTime ? `${Math.round(song.generationAnalytics.totalWaitTime / 1000)}s` : 'N/A'}
                    </div>
                    <div>
                      <strong>API Response Code:</strong> {song.generationAnalytics.apiResponseCode || 'N/A'}
                    </div>
                    <div>
                      <strong>API Response Time:</strong> {song.generationAnalytics.apiResponseTime ? `${song.generationAnalytics.apiResponseTime}ms` : 'N/A'}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Music Parameters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Music Parameters</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong>Style:</strong> {song.generationParams?.style || 'N/A'}
                </div>
                <div>
                  <strong>Tempo:</strong> {song.generationParams?.tempo ? `${song.generationParams.tempo} BPM` : 'N/A'}
                </div>
                <div>
                  <strong>Key:</strong> {song.generationParams?.key || 'N/A'}
                </div>
                <div>
                  <strong>Time Signature:</strong> {song.musicAnalysis?.timeSignature ? `${song.musicAnalysis.timeSignature}/4` : 'N/A'}
                </div>
              </div>
              
              {song.generationParams?.instruments && song.generationParams.instruments.length > 0 && (
                <div className="mt-4">
                  <strong>Instruments:</strong>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {song.generationParams.instruments.map((instrument, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {instrument}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* File Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">File Information</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <div className="space-y-3">
                <div>
                  <strong>Audio:</strong> {song.files.audioUrl ? 'Available' : 'Not Available'}
                  {song.files.audioUrl && (
                    <div className="ml-4 mt-1 text-xs text-gray-600">
                      <div>Format: {song.files.fileFormats?.audio || 'N/A'}</div>
                      <div>Size: {formatFileSize(song.files.fileSizes?.audio)}</div>
                      <div>Bitrate: {song.files.quality?.audioBitrate ? `${song.files.quality.audioBitrate} kbps` : 'N/A'}</div>
                    </div>
                  )}
                </div>
                
                <div>
                  <strong>Video:</strong> {song.files.videoUrl ? 'Available' : 'Not Available'}
                  {song.files.videoUrl && (
                    <div className="ml-4 mt-1 text-xs text-gray-600">
                      <div>Format: {song.files.fileFormats?.video || 'N/A'}</div>
                      <div>Size: {formatFileSize(song.files.fileSizes?.video)}</div>
                      <div>Resolution: {song.files.quality?.videoResolution || 'N/A'}</div>
                    </div>
                  )}
                </div>
                
                <div>
                  <strong>Thumbnail:</strong> {song.files.thumbnailUrl ? 'Available' : 'Not Available'}
                  {song.files.thumbnailUrl && (
                    <div className="ml-4 mt-1 text-xs text-gray-600">
                      <div>Format: {song.files.fileFormats?.thumbnail || 'N/A'}</div>
                      <div>Size: {formatFileSize(song.files.fileSizes?.thumbnail)}</div>
                      <div>Dimensions: {song.files.quality?.thumbnailDimensions?.width && song.files.quality?.thumbnailDimensions?.height 
                        ? `${song.files.quality.thumbnailDimensions.width}x${song.files.quality.thumbnailDimensions.height}` 
                        : 'N/A'}</div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Music Analysis */}
          {song.musicAnalysis && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Music Analysis</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <strong>Energy:</strong> {formatPercentage(song.musicAnalysis.energy)}
                  </div>
                  <div>
                    <strong>Valence (Happiness):</strong> {formatPercentage(song.musicAnalysis.valence)}
                  </div>
                  <div>
                    <strong>Danceability:</strong> {formatPercentage(song.musicAnalysis.danceability)}
                  </div>
                  <div>
                    <strong>Acousticness:</strong> {formatPercentage(song.musicAnalysis.acousticness)}
                  </div>
                  <div>
                    <strong>Instrumentalness:</strong> {formatPercentage(song.musicAnalysis.instrumentalness)}
                  </div>
                  <div>
                    <strong>Speechiness:</strong> {formatPercentage(song.musicAnalysis.speechiness)}
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">Confidence Scores</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <strong>Genre Confidence:</strong> {formatPercentage(song.musicAnalysis.genreConfidence)}
                    </div>
                    <div>
                      <strong>Mood Confidence:</strong> {formatPercentage(song.musicAnalysis.moodConfidence)}
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">Technical Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <strong>Loudness:</strong> {song.musicAnalysis.loudness ? `${song.musicAnalysis.loudness.toFixed(1)} dB` : 'N/A'}
                    </div>
                    <div>
                      <strong>Modality:</strong> {song.musicAnalysis.modality === 1 ? 'Major' : song.musicAnalysis.modality === 0 ? 'Minor' : 'N/A'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Usage Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Usage Statistics</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <strong>Plays:</strong> {song.playCount}
                </div>
                <div>
                  <strong>Downloads:</strong> {song.downloadCount}
                </div>
                <div>
                  <strong>Shares:</strong> {song.shareCount}
                </div>
              </div>
              <div className="mt-4">
                <div>
                  <strong>Visibility:</strong> 
                  <Badge variant={song.isPublic ? 'default' : 'secondary'} className="ml-2">
                    {song.isPublic ? 'Public' : 'Private'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          {song.tags && song.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1">
                  {song.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Lyrics */}
          {song.lyrics && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Lyrics</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-sm whitespace-pre-wrap font-mono bg-gray-50 p-3 rounded">
                  {song.lyrics}
                </pre>
              </CardContent>
            </Card>
          )}

          {/* Timestamps */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Timestamps</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong>Created:</strong> {formatDate(song.createdAt)}
                </div>
                <div>
                  <strong>Updated:</strong> {formatDate(song.updatedAt)}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
