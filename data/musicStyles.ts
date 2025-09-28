export interface MusicStyle {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  popularity: number; // 1-5, for trending/popular sorting
  voiceType?: 'male' | 'female' | 'mixed' | 'instrumental';
  energy?: 'low' | 'medium' | 'high';
  tempo?: 'slow' | 'medium' | 'fast';
}

export interface StyleCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  styles: MusicStyle[];
}

export const musicStylesData: StyleCategory[] = [
  {
    id: 'pop',
    name: 'Pop',
    icon: '🎵',
    description: 'Mainstream, catchy, and accessible music',
    styles: [
      { id: 'pop-mainstream', name: 'Mainstream Pop', description: 'Radio-friendly with catchy hooks', category: 'pop', tags: ['pop', 'catchy', 'mainstream'], popularity: 5, energy: 'medium' },
      { id: 'pop-indie', name: 'Indie Pop', description: 'Alternative pop with artistic flair', category: 'pop', tags: ['indie', 'alternative', 'artistic'], popularity: 4, energy: 'medium' },
      { id: 'pop-electro', name: 'Electro Pop', description: 'Pop with electronic elements', category: 'pop', tags: ['electronic', 'synth', 'pop'], popularity: 4, energy: 'high' },
      { id: 'pop-dance', name: 'Dance Pop', description: 'Upbeat pop for dancing', category: 'pop', tags: ['dance', 'upbeat', 'energetic'], popularity: 5, energy: 'high' },
      { id: 'pop-ballad', name: 'Pop Ballad', description: 'Emotional and melodic slow songs', category: 'pop', tags: ['ballad', 'emotional', 'slow'], popularity: 3, energy: 'low' },
      { id: 'pop-synth', name: 'Synth Pop', description: 'Pop with synthesizer focus', category: 'pop', tags: ['synth', '80s', 'retro'], popularity: 3, energy: 'medium' },
    ]
  },
  {
    id: 'rock',
    name: 'Rock',
    icon: '🎸',
    description: 'Guitar-driven with powerful rhythms',
    styles: [
      { id: 'rock-classic', name: 'Classic Rock', description: 'Traditional rock sound', category: 'rock', tags: ['classic', 'guitar', 'drums'], popularity: 4, energy: 'high' },
      { id: 'rock-alternative', name: 'Alternative Rock', description: 'Non-mainstream rock styles', category: 'rock', tags: ['alternative', 'grunge', 'indie'], popularity: 4, energy: 'high' },
      { id: 'rock-punk', name: 'Punk Rock', description: 'Fast, aggressive, and raw', category: 'rock', tags: ['punk', 'fast', 'aggressive'], popularity: 3, energy: 'high' },
      { id: 'rock-progressive', name: 'Progressive Rock', description: 'Complex and experimental', category: 'rock', tags: ['progressive', 'complex', 'experimental'], popularity: 2, energy: 'medium' },
      { id: 'rock-indie', name: 'Indie Rock', description: 'Independent and artistic rock', category: 'rock', tags: ['indie', 'alternative', 'artistic'], popularity: 4, energy: 'medium' },
      { id: 'rock-hard', name: 'Hard Rock', description: 'Heavy and powerful sound', category: 'rock', tags: ['heavy', 'powerful', 'loud'], popularity: 3, energy: 'high' },
    ]
  },
  {
    id: 'electronic',
    name: 'Electronic',
    icon: '🎛️',
    description: 'Synthesized and digital sounds',
    styles: [
      { id: 'electronic-house', name: 'House', description: 'Four-on-the-floor dance music', category: 'electronic', tags: ['house', 'dance', '4/4'], popularity: 5, energy: 'high' },
      { id: 'electronic-techno', name: 'Techno', description: 'Repetitive electronic beats', category: 'electronic', tags: ['techno', 'repetitive', 'electronic'], popularity: 4, energy: 'high' },
      { id: 'electronic-ambient', name: 'Ambient', description: 'Atmospheric and spacious', category: 'electronic', tags: ['ambient', 'atmospheric', 'spacious'], popularity: 2, energy: 'low' },
      { id: 'electronic-dubstep', name: 'Dubstep', description: 'Heavy bass and syncopated drops', category: 'electronic', tags: ['dubstep', 'bass', 'drops'], popularity: 3, energy: 'high' },
      { id: 'electronic-trance', name: 'Trance', description: 'Hypnotic and uplifting', category: 'electronic', tags: ['trance', 'hypnotic', 'uplifting'], popularity: 3, energy: 'high' },
      { id: 'electronic-chillout', name: 'Chillout', description: 'Relaxed electronic music', category: 'electronic', tags: ['chill', 'relaxed', 'downtempo'], popularity: 3, energy: 'low' },
    ]
  },
  {
    id: 'hip-hop',
    name: 'Hip-Hop',
    icon: '🎤',
    description: 'Rhythmic beats and rap vocals',
    styles: [
      { id: 'hiphop-trap', name: 'Trap', description: 'Heavy 808s and hi-hats', category: 'hip-hop', tags: ['trap', '808', 'heavy'], popularity: 5, energy: 'high', voiceType: 'male' },
      { id: 'hiphop-oldschool', name: 'Old School', description: 'Classic hip-hop style', category: 'hip-hop', tags: ['old school', 'classic', 'boom bap'], popularity: 3, energy: 'medium' },
      { id: 'hiphop-conscious', name: 'Conscious Rap', description: 'Socially aware lyrics', category: 'hip-hop', tags: ['conscious', 'lyrical', 'social'], popularity: 2, energy: 'medium' },
      { id: 'hiphop-drill', name: 'Drill', description: 'Dark and aggressive style', category: 'hip-hop', tags: ['drill', 'dark', 'aggressive'], popularity: 4, energy: 'high' },
      { id: 'hiphop-lo-fi', name: 'Lo-Fi Hip-Hop', description: 'Chill and atmospheric', category: 'hip-hop', tags: ['lo-fi', 'chill', 'atmospheric'], popularity: 4, energy: 'low' },
      { id: 'hiphop-melodic', name: 'Melodic Rap', description: 'Singing and rapping combined', category: 'hip-hop', tags: ['melodic', 'singing', 'auto-tune'], popularity: 5, energy: 'medium' },
    ]
  },
  {
    id: 'r-and-b',
    name: 'R&B / Soul',
    icon: '💫',
    description: 'Smooth vocals and groovy rhythms',
    styles: [
      { id: 'rb-contemporary', name: 'Contemporary R&B', description: 'Modern R&B sound', category: 'r-and-b', tags: ['contemporary', 'smooth', 'modern'], popularity: 4, energy: 'medium' },
      { id: 'rb-neo-soul', name: 'Neo-Soul', description: 'Modern take on classic soul', category: 'r-and-b', tags: ['neo-soul', 'organic', 'groovy'], popularity: 3, energy: 'medium' },
      { id: 'rb-classic-soul', name: 'Classic Soul', description: 'Traditional soul music', category: 'r-and-b', tags: ['classic', 'soul', 'vintage'], popularity: 2, energy: 'medium' },
      { id: 'rb-funk', name: 'Funk', description: 'Groove-oriented with strong rhythm', category: 'r-and-b', tags: ['funk', 'groove', 'rhythm'], popularity: 3, energy: 'high' },
      { id: 'rb-alternative', name: 'Alternative R&B', description: 'Experimental and artistic', category: 'r-and-b', tags: ['alternative', 'experimental', 'artistic'], popularity: 3, energy: 'low' },
    ]
  },
  {
    id: 'country',
    name: 'Country',
    icon: '🤠',
    description: 'Folk-inspired storytelling music',
    styles: [
      { id: 'country-modern', name: 'Modern Country', description: 'Contemporary country sound', category: 'country', tags: ['modern', 'country', 'radio'], popularity: 4, energy: 'medium' },
      { id: 'country-traditional', name: 'Traditional Country', description: 'Classic country style', category: 'country', tags: ['traditional', 'classic', 'honky-tonk'], popularity: 2, energy: 'medium' },
      { id: 'country-folk', name: 'Country Folk', description: 'Folk-influenced country', category: 'country', tags: ['folk', 'acoustic', 'storytelling'], popularity: 3, energy: 'low' },
      { id: 'country-bluegrass', name: 'Bluegrass', description: 'Fast-picked acoustic strings', category: 'country', tags: ['bluegrass', 'acoustic', 'fast'], popularity: 2, energy: 'high' },
      { id: 'country-crossover', name: 'Country Pop', description: 'Pop-influenced country', category: 'country', tags: ['pop', 'crossover', 'mainstream'], popularity: 4, energy: 'medium' },
    ]
  },
  {
    id: 'jazz',
    name: 'Jazz',
    icon: '🎺',
    description: 'Improvisation and complex harmonies',
    styles: [
      { id: 'jazz-smooth', name: 'Smooth Jazz', description: 'Mellow and accessible', category: 'jazz', tags: ['smooth', 'mellow', 'accessible'], popularity: 3, energy: 'low' },
      { id: 'jazz-bebop', name: 'Bebop', description: 'Fast and complex improvisation', category: 'jazz', tags: ['bebop', 'fast', 'complex'], popularity: 2, energy: 'high' },
      { id: 'jazz-fusion', name: 'Jazz Fusion', description: 'Jazz with rock/funk elements', category: 'jazz', tags: ['fusion', 'rock', 'electric'], popularity: 2, energy: 'high' },
      { id: 'jazz-swing', name: 'Swing', description: 'Rhythmic and danceable', category: 'jazz', tags: ['swing', 'rhythmic', 'danceable'], popularity: 2, energy: 'medium' },
      { id: 'jazz-latin', name: 'Latin Jazz', description: 'Jazz with Latin rhythms', category: 'jazz', tags: ['latin', 'rhythmic', 'bossa nova'], popularity: 3, energy: 'medium' },
    ]
  },
  {
    id: 'world',
    name: 'World Music',
    icon: '🌍',
    description: 'Global and cultural sounds',
    styles: [
      { id: 'world-latin', name: 'Latin', description: 'Latin American rhythms', category: 'world', tags: ['latin', 'salsa', 'reggaeton'], popularity: 4, energy: 'high' },
      { id: 'world-reggae', name: 'Reggae', description: 'Jamaican rhythm and culture', category: 'world', tags: ['reggae', 'jamaican', 'relaxed'], popularity: 3, energy: 'low' },
      { id: 'world-afrobeat', name: 'Afrobeat', description: 'African rhythms and modern production', category: 'world', tags: ['afrobeat', 'african', 'rhythmic'], popularity: 4, energy: 'high' },
      { id: 'world-bollywood', name: 'Bollywood', description: 'Indian film music style', category: 'world', tags: ['bollywood', 'indian', 'cinematic'], popularity: 3, energy: 'high' },
      { id: 'world-celtic', name: 'Celtic', description: 'Irish and Scottish traditional', category: 'world', tags: ['celtic', 'irish', 'traditional'], popularity: 2, energy: 'medium' },
    ]
  },
  {
    id: 'classical',
    name: 'Classical',
    icon: '🎻',
    description: 'Orchestral and traditional composition',
    styles: [
      { id: 'classical-orchestral', name: 'Orchestral', description: 'Full orchestra arrangements', category: 'classical', tags: ['orchestral', 'symphonic', 'grand'], popularity: 2, energy: 'medium', voiceType: 'instrumental' },
      { id: 'classical-chamber', name: 'Chamber Music', description: 'Small ensemble pieces', category: 'classical', tags: ['chamber', 'intimate', 'acoustic'], popularity: 1, energy: 'low', voiceType: 'instrumental' },
      { id: 'classical-minimalist', name: 'Minimalist', description: 'Repetitive and gradual changes', category: 'classical', tags: ['minimalist', 'repetitive', 'ambient'], popularity: 2, energy: 'low', voiceType: 'instrumental' },
      { id: 'classical-baroque', name: 'Baroque', description: 'Ornate and structured', category: 'classical', tags: ['baroque', 'ornate', 'structured'], popularity: 1, energy: 'medium', voiceType: 'instrumental' },
      { id: 'classical-cinematic', name: 'Cinematic', description: 'Film score style', category: 'classical', tags: ['cinematic', 'epic', 'emotional'], popularity: 3, energy: 'high', voiceType: 'instrumental' },
    ]
  },
];

// Helper functions for style management
export function getAllStyles(): MusicStyle[] {
  return musicStylesData.flatMap(category => category.styles);
}

export function getStylesByCategory(categoryId: string): MusicStyle[] {
  const category = musicStylesData.find(cat => cat.id === categoryId);
  return category?.styles || [];
}

export function getStyleById(styleId: string): MusicStyle | undefined {
  return getAllStyles().find(style => style.id === styleId);
}

export function getPopularStyles(limit: number = 10): MusicStyle[] {
  return getAllStyles()
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, limit);
}

export function searchStyles(query: string): MusicStyle[] {
  const searchTerm = query.toLowerCase();
  return getAllStyles().filter(style => 
    style.name.toLowerCase().includes(searchTerm) ||
    style.description.toLowerCase().includes(searchTerm) ||
    style.tags.some(tag => tag.toLowerCase().includes(searchTerm))
  );
}
