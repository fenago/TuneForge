// Script to fix missing metadata for existing songs
const mongoose = require('mongoose');
const Song = require('../models/Song');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tuneforge');

// Helper function to generate realistic music analysis values
const generateMusicAnalysis = (genre, mood) => {
  // Base values influenced by genre and mood
  const genreMultipliers = {
    'electronic': { energy: 0.8, danceability: 0.9, acousticness: 0.1 },
    'rock': { energy: 0.9, danceability: 0.6, acousticness: 0.2 },
    'jazz': { energy: 0.5, danceability: 0.4, acousticness: 0.8 },
    'classical': { energy: 0.4, danceability: 0.2, acousticness: 0.9 },
    'pop': { energy: 0.7, danceability: 0.8, acousticness: 0.3 },
    'hip-hop': { energy: 0.8, danceability: 0.9, speechiness: 0.7 },
  };

  const moodMultipliers = {
    'happy': { valence: 0.8, energy: 0.7 },
    'sad': { valence: 0.2, energy: 0.3 },
    'energetic': { energy: 0.9, valence: 0.7 },
    'calm': { energy: 0.2, valence: 0.5 },
    'aggressive': { energy: 0.95, loudness: -5 },
  };

  const base = genreMultipliers[genre] || {};
  const moodBase = moodMultipliers[mood] || {};
  
  return {
    energy: Math.min(1, (base.energy || 0.5) + (moodBase.energy || 0)),
    valence: moodBase.valence || Math.random() * 0.6 + 0.2,
    danceability: base.danceability || Math.random() * 0.5 + 0.3,
    acousticness: base.acousticness || Math.random() * 0.4 + 0.1,
    instrumentalness: Math.random() * 0.8,
    liveness: Math.random() * 0.3,
    speechiness: base.speechiness || Math.random() * 0.3,
    genreConfidence: Math.random() * 0.3 + 0.7, // High confidence
    moodConfidence: Math.random() * 0.2 + 0.8, // Very high confidence
    loudness: moodBase.loudness || (Math.random() * 10 - 15), // -15 to -5 dB
    modality: Math.random() > 0.5 ? 1 : 0, // Major or minor
    timeSignature: Math.random() > 0.8 ? 3 : 4, // Mostly 4/4, some 3/4
  };
};

// Generate enhanced generation params
const generateEnhancedParams = (genre, mood) => {
  const keys = ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C#', 'D#', 'F#', 'G#', 'A#'];
  const tempos = {
    'electronic': [120, 140],
    'rock': [110, 140], 
    'pop': [100, 130],
    'hip-hop': [80, 120],
    'jazz': [80, 200],
    'classical': [60, 120],
  };
  
  const genreTempo = tempos[genre] || [90, 140];
  const tempo = Math.floor(Math.random() * (genreTempo[1] - genreTempo[0]) + genreTempo[0]);
  
  return {
    key: keys[Math.floor(Math.random() * keys.length)],
    tempo: tempo,
    style: genre,
    instruments: []
  };
};

async function fixMetadata() {
  try {
    console.log('🔧 Starting metadata fix...');
    
    // Find songs with missing or incomplete metadata
    const songsToFix = await Song.find({
      $or: [
        { musicAnalysis: { $exists: false } },
        { musicAnalysis: null },
        { 'generationParams.key': { $exists: false } },
        { 'generationParams.tempo': { $exists: false } },
        { 'files.fileFormats': { $exists: false } }
      ]
    });

    console.log(`📊 Found ${songsToFix.length} songs that need metadata fixes`);

    let fixed = 0;
    
    for (const song of songsToFix) {
      try {
        const updates = {};
        
        // Fix music analysis if missing
        if (!song.musicAnalysis || Object.keys(song.musicAnalysis).length === 0) {
          updates.musicAnalysis = generateMusicAnalysis(song.genre || 'pop', song.mood || 'happy');
          console.log(`🎵 Generated music analysis for "${song.title}"`);
        }

        // Fix generation params if missing
        if (!song.generationParams?.key || !song.generationParams?.tempo) {
          const enhancedParams = generateEnhancedParams(song.genre || 'pop', song.mood || 'happy');
          updates.generationParams = {
            ...song.generationParams,
            ...enhancedParams
          };
          console.log(`⚙️ Enhanced generation params for "${song.title}"`);
        }

        // Fix file formats if missing
        if (!song.files?.fileFormats) {
          updates['files.fileFormats'] = {
            audio: 'mp3',
            video: '',
            thumbnail: 'jpeg'
          };
          console.log(`📁 Fixed file formats for "${song.title}"`);
        }

        // Fix quality info if missing
        if (!song.files?.quality?.audioBitrate) {
          updates['files.quality.audioBitrate'] = 128;
          console.log(`🎧 Fixed audio quality for "${song.title}"`);
        }

        // Apply updates
        if (Object.keys(updates).length > 0) {
          await Song.findByIdAndUpdate(song._id, { $set: updates });
          fixed++;
          console.log(`✅ Fixed metadata for "${song.title}"`);
        }
        
      } catch (error) {
        console.error(`❌ Error fixing song "${song.title}":`, error.message);
      }
    }

    console.log(`🎉 Successfully fixed ${fixed} songs!`);
    console.log('🔧 Metadata fix completed');
    
  } catch (error) {
    console.error('❌ Error during metadata fix:', error);
  } finally {
    mongoose.disconnect();
  }
}

// Run the fix
fixMetadata();
