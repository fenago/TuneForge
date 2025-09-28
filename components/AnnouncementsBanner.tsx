"use client";

import { useState, useEffect } from 'react';
import { XMarkIcon, MegaphoneIcon } from '@heroicons/react/24/outline';

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high';
  publishedAt: string;
}

export default function AnnouncementsBanner() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchAnnouncements();
    // Load dismissed announcements from localStorage
    const dismissed = localStorage.getItem('dismissedAnnouncements');
    if (dismissed) {
      setDismissedIds(new Set(JSON.parse(dismissed)));
    }
  }, []);

  const fetchAnnouncements = async () => {
    try {
      console.log('📢 Fetching announcements for banner...');
      const response = await fetch('/api/content?type=announcement&featured=true&limit=5');
      
      if (response.ok) {
        const data = await response.json();
        const highPriorityAnnouncements = data.content.filter((ann: Announcement) => 
          ann.priority === 'high' || ann.priority === 'medium'
        );
        
        console.log('✅ Found announcements:', highPriorityAnnouncements.length);
        setAnnouncements(highPriorityAnnouncements);
        
        if (highPriorityAnnouncements.length > 0) {
          setIsVisible(true);
        }
      }
    } catch (error) {
      console.error('❌ Error fetching announcements:', error);
    }
  };

  // Filter out dismissed announcements
  const visibleAnnouncements = announcements.filter(ann => !dismissedIds.has(ann.id));

  // Auto-cycle through announcements
  useEffect(() => {
    if (visibleAnnouncements.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % visibleAnnouncements.length);
      }, 5000); // Change every 5 seconds

      return () => clearInterval(interval);
    }
  }, [visibleAnnouncements.length]);

  const handleDismiss = (announcementId?: string) => {
    if (announcementId) {
      // Dismiss specific announcement
      const newDismissed = new Set(dismissedIds).add(announcementId);
      setDismissedIds(newDismissed);
      localStorage.setItem('dismissedAnnouncements', JSON.stringify(Array.from(newDismissed)));
      
      // If this was the current announcement, move to next
      if (visibleAnnouncements[currentIndex]?.id === announcementId) {
        const remainingAnnouncements = visibleAnnouncements.filter(ann => ann.id !== announcementId);
        if (remainingAnnouncements.length === 0) {
          setIsVisible(false);
        } else {
          setCurrentIndex(prev => prev >= remainingAnnouncements.length ? 0 : prev);
        }
      }
    } else {
      // Dismiss banner entirely
      setIsVisible(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'medium':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return '🚨';
      case 'medium':
        return '📢';
      default:
        return '💡';
    }
  };

  if (!isVisible || visibleAnnouncements.length === 0) {
    return null;
  }

  const currentAnnouncement = visibleAnnouncements[currentIndex];

  return (
    <div className={`border-l-4 p-4 mb-6 rounded-r-lg ${getPriorityColor(currentAnnouncement.priority)}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <div className="flex-shrink-0 mt-0.5">
            <span className="text-lg">{getPriorityIcon(currentAnnouncement.priority)}</span>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold truncate">
                {currentAnnouncement.title}
              </h3>
              
              {visibleAnnouncements.length > 1 && (
                <div className="flex items-center space-x-1 ml-4">
                  {visibleAnnouncements.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={`w-2 h-2 rounded-full ${
                        index === currentIndex ? 'bg-current' : 'bg-current opacity-30'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
            
            <div className="text-sm opacity-90 line-clamp-2">
              {currentAnnouncement.content.length > 150
                ? `${currentAnnouncement.content.substring(0, 150)}...`
                : currentAnnouncement.content
              }
            </div>
            
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs opacity-70">
                {new Date(currentAnnouncement.publishedAt).toLocaleDateString()}
              </span>
              
              {visibleAnnouncements.length > 1 && (
                <button
                  onClick={() => handleDismiss(currentAnnouncement.id)}
                  className="text-xs opacity-70 hover:opacity-100 underline"
                >
                  Don't show this again
                </button>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={() => handleDismiss()}
          className="flex-shrink-0 ml-4 p-1 hover:bg-black hover:bg-opacity-10 rounded-full transition-colors"
          title="Close announcements"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation arrows for multiple announcements */}
      {visibleAnnouncements.length > 1 && (
        <div className="flex justify-center mt-3 space-x-2">
          <button
            onClick={() => setCurrentIndex(prev => 
              prev === 0 ? visibleAnnouncements.length - 1 : prev - 1
            )}
            className="text-xs opacity-70 hover:opacity-100 px-2 py-1 rounded"
          >
            ← Previous
          </button>
          <span className="text-xs opacity-50">
            {currentIndex + 1} of {visibleAnnouncements.length}
          </span>
          <button
            onClick={() => setCurrentIndex(prev => (prev + 1) % visibleAnnouncements.length)}
            className="text-xs opacity-70 hover:opacity-100 px-2 py-1 rounded"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
