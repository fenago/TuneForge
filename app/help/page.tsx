"use client";

import { useState, useEffect } from 'react';
import Link from "next/link";
import { 
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  QuestionMarkCircleIcon,
  BookOpenIcon,
  ChatBubbleLeftRightIcon
} from "@heroicons/react/24/outline";

interface ContentItem {
  id: string;
  title: string;
  content: string;
  type: 'faq' | 'guide' | 'help';
  excerpt?: string;
  publishedAt: string;
}

const HelpCenter = () => {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'faq' | 'guide' | 'help'>('all');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchHelpContent();
  }, [activeCategory]);

  const fetchHelpContent = async () => {
    try {
      setLoading(true);
      console.log('📚 Fetching help content...');
      
      const typeParam = activeCategory === 'all' ? '' : `&type=${activeCategory}`;
      const response = await fetch(`/api/content?limit=50${typeParam}`);

      if (response.ok) {
        const data = await response.json();
        const helpContent = data.content.filter((item: ContentItem) => 
          ['faq', 'guide', 'help'].includes(item.type)
        );
        setContent(helpContent);
        console.log('✅ Help content loaded:', helpContent.length);
      } else {
        throw new Error('Failed to load help content');
      }
    } catch (error) {
      console.error('❌ Error loading help content:', error);
      setError('Failed to load help content');
      // Fallback to default content
      setContent(getDefaultHelpContent());
    } finally {
      setLoading(false);
    }
  };

  const getDefaultHelpContent = (): ContentItem[] => {
    return [
      {
        id: 'default-1',
        title: 'How do I create my first song?',
        content: `Creating your first song with TuneForge is easy:

1. **Click "Create Music"** on your dashboard
2. **Enter a prompt** describing the type of music you want (e.g., "upbeat pop song about friendship")
3. **Select genre and mood** from the dropdown options
4. **Choose your AI model** (we recommend starting with Chirp v4)
5. **Click "Generate"** and wait for your song to be created (usually 1-3 minutes)

**Tips for better results:**
• Be specific in your descriptions
• Include mood, genre, and theme information
• Try different AI models for variety
• Use the lyric input for custom songs`,
        type: 'faq',
        excerpt: 'Learn how to create your first AI-generated song in 5 simple steps.',
        publishedAt: new Date().toISOString()
      },
      {
        id: 'default-2',
        title: 'What AI models are available?',
        content: `TuneForge offers several AI models for different music styles:

**Chirp v4** (Recommended)
• Best overall quality and versatility
• Great for pop, rock, and mainstream genres
• Fast generation times

**Chirp v3.5**
• Excellent for classical and acoustic music
• More controlled and structured compositions
• Ideal for instrumental pieces

**Chirp v4.5 Plus**
• Premium model with highest quality
• Best for professional-grade music
• Supports complex arrangements and vocals

**Choosing the right model:**
• Start with Chirp v4 for most songs
• Use v3.5 for classical or acoustic styles  
• Upgrade to v4.5 Plus for professional projects`,
        type: 'guide',
        excerpt: 'Compare different AI models and learn which one to use for your music style.',
        publishedAt: new Date().toISOString()
      },
      {
        id: 'default-3',
        title: 'Why is my song generation failing?',
        content: `If your song generation is failing, try these solutions:

**Common Issues:**
• **Insufficient credits**: Check your account balance
• **Server overload**: Try again during off-peak hours
• **Invalid prompt**: Avoid copyrighted content references
• **Technical issues**: Clear browser cache and cookies

**Troubleshooting steps:**
1. Refresh the page and try again
2. Simplify your prompt (avoid complex requests)
3. Check your internet connection
4. Try a different AI model
5. Contact support if issues persist

**Prevention tips:**
• Keep prompts clear and simple
• Avoid requesting copyrighted music
• Don't include explicit content requests
• Use specific but reasonable descriptions`,
        type: 'faq',
        excerpt: 'Common solutions for song generation failures and how to prevent them.',
        publishedAt: new Date().toISOString()
      },
      {
        id: 'default-4',
        title: 'Writing Better Music Prompts',
        content: `Crafting effective prompts is key to generating great music:

**Structure your prompt:**
1. **Genre**: "Pop", "Rock", "Classical", "Jazz", etc.
2. **Mood**: "Upbeat", "Melancholy", "Energetic", "Calm"  
3. **Theme**: What the song is about
4. **Style details**: Instruments, tempo, vocal style

**Good prompt examples:**
• "Upbeat pop song about summer vacation with acoustic guitar"
• "Melancholy indie rock ballad about lost love with piano and strings"
• "Energetic electronic dance track for working out"
• "Calm jazz instrumental for late night study sessions"

**Avoid these:**
• Overly complex or long descriptions
• References to copyrighted songs or artists
• Contradictory instructions (e.g., "sad but happy")
• Technical jargon that might confuse the AI

**Pro tips:**
• Start simple and refine based on results
• Use descriptive adjectives for mood and style
• Specify instruments if you have preferences
• Include the song's purpose or setting`,
        type: 'guide',
        excerpt: 'Learn how to write effective prompts that generate better AI music.',
        publishedAt: new Date().toISOString()
      }
    ];
  };

  const filteredContent = content.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const getCategoryIcon = (type: string) => {
    switch (type) {
      case 'faq':
        return <QuestionMarkCircleIcon className="w-5 h-5" />;
      case 'guide':
        return <BookOpenIcon className="w-5 h-5" />;
      default:
        return <ChatBubbleLeftRightIcon className="w-5 h-5" />;
    }
  };

  const getCategoryColor = (type: string) => {
    switch (type) {
      case 'faq':
        return 'bg-blue-100 text-blue-800';
      case 'guide':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-purple-100 text-purple-800';
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to TuneForge
          </Link>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Help Center
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Everything you need to know about creating music with TuneForge
            </p>

            {/* Search */}
            <div className="max-w-md mx-auto relative">
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search help articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg shadow-sm p-1 flex">
            {[
              { id: 'all', name: 'All Help', icon: '📚' },
              { id: 'faq', name: 'FAQ', icon: '❓' },
              { id: 'guide', name: 'Guides', icon: '📖' },
              { id: 'help', name: 'Help', icon: '💬' }
            ].map(category => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id as any)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto">
          {error ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <div className="text-red-600 mb-4">
                <p className="mb-4">{error}</p>
                <button 
                  onClick={fetchHelpContent}
                  className="text-blue-600 hover:text-blue-700 underline"
                >
                  Try again
                </button>
              </div>
            </div>
          ) : filteredContent.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <QuestionMarkCircleIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No articles found</h3>
              <p className="text-gray-600">
                {searchTerm ? 'Try different search terms' : 'No help content available yet'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredContent.map((item) => (
                <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <button
                    onClick={() => toggleExpanded(item.id)}
                    className="w-full px-6 py-4 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(item.type)}`}>
                            {getCategoryIcon(item.type)}
                            <span className="ml-1 capitalize">{item.type}</span>
                          </span>
                        </div>
                        
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {item.title}
                        </h3>
                        
                        {item.excerpt && (
                          <p className="text-gray-600 text-sm">
                            {item.excerpt}
                          </p>
                        )}
                      </div>
                      
                      <div className="ml-4 flex-shrink-0">
                        <span className={`transform transition-transform ${
                          expandedItems.has(item.id) ? 'rotate-180' : 'rotate-0'
                        }`}>
                          ▼
                        </span>
                      </div>
                    </div>
                  </button>

                  {expandedItems.has(item.id) && (
                    <div className="px-6 pb-6 border-t border-gray-100">
                      <div className="prose prose-gray max-w-none mt-4">
                        <div 
                          className="whitespace-pre-line leading-relaxed text-gray-700"
                          style={{ fontFamily: 'inherit' }}
                        >
                          {item.content}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Contact Support */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Still need help?
          </h3>
          <p className="text-blue-700 mb-4">
            Can't find what you're looking for? Our support team is here to help.
          </p>
          <a 
            href="mailto:support@tuneforge.ai"
            className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ChatBubbleLeftRightIcon className="w-4 h-4 mr-2" />
            Contact Support
          </a>
        </div>
      </div>
    </main>
  );
};

export default HelpCenter;
