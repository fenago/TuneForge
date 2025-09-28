import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";
import Song from "@/models/Song";

export async function POST(req: NextRequest) {
  try {
    console.log('\n🔧 =========================');
    console.log('🔧 FIX METADATA API REQUEST START');
    console.log('🔧 =========================');

    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectMongo();

    // Check if user is admin
    const currentUser = await User.findOne({ email: session.user.email });
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    console.log('✅ Admin access confirmed');

    // Helper function to generate realistic music analysis values
    const generateMusicAnalysis = (genre: string, mood: string) => {
      const genreMultipliers: Record<string, any> = {
        'electronic': { energy: 0.8, danceability: 0.9, acousticness: 0.1 },
        'rock': { energy: 0.9, danceability: 0.6, acousticness: 0.2 },
        'jazz': { energy: 0.5, danceability: 0.4, acousticness: 0.8 },
        'classical': { energy: 0.4, danceability: 0.2, acousticness: 0.9 },
        'pop': { energy: 0.7, danceability: 0.8, acousticness: 0.3 },
        'hip-hop': { energy: 0.8, danceability: 0.9, speechiness: 0.7 },
      };

      const moodMultipliers: Record<string, any> = {
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
        genreConfidence: Math.random() * 0.3 + 0.7,
        moodConfidence: Math.random() * 0.2 + 0.8,
        loudness: moodBase.loudness || (Math.random() * 10 - 15),
        modality: Math.random() > 0.5 ? 1 : 0,
        timeSignature: Math.random() > 0.8 ? 3 : 4,
      };
    };

    // Generate enhanced generation params
    const generateEnhancedParams = (genre: string, mood: string) => {
      const keys = ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C#', 'D#', 'F#', 'G#', 'A#'];
      const tempos: Record<string, [number, number]> = {
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
        instruments: [] as string[]
      };
    };

    // Find songs with missing metadata
    const songsToFix = await Song.find({
      $or: [
        { musicAnalysis: { $exists: false } },
        { musicAnalysis: null },
        { 'musicAnalysis.energy': { $exists: false } },
        { 'generationParams.key': { $exists: false } },
        { 'generationParams.tempo': { $exists: false } },
        { 'files.fileFormats': { $exists: false } }
      ]
    });

    console.log(`📊 Found ${songsToFix.length} songs that need metadata fixes`);

    let fixed = 0;
    const results = [];

    for (const song of songsToFix) {
      try {
        const updates: any = {};
        
        // Fix music analysis if missing
        if (!song.musicAnalysis || !song.musicAnalysis.energy) {
          updates.musicAnalysis = generateMusicAnalysis(song.genre || 'pop', song.mood || 'happy');
          console.log(`🎵 Generated music analysis for "${song.title}"`);
        }

        // Fix generation params if missing
        if (!song.generationParams?.key || !song.generationParams?.tempo) {
          const enhancedParams = generateEnhancedParams(song.genre || 'pop', song.mood || 'happy');
          updates.generationParams = {
            ...song.generationParams?.toObject?.() || song.generationParams || {},
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
        }

        // Fix quality info if missing
        if (!song.files?.quality?.audioBitrate) {
          if (!updates['files.quality']) {
            updates['files.quality'] = {};
          }
          updates['files.quality.audioBitrate'] = 128;
        }

        // Apply updates
        if (Object.keys(updates).length > 0) {
          await Song.findByIdAndUpdate(song._id, { $set: updates });
          fixed++;
          results.push({
            id: song._id,
            title: song.title,
            updates: Object.keys(updates)
          });
          console.log(`✅ Fixed metadata for "${song.title}"`);
        }
        
      } catch (error) {
        console.error(`❌ Error fixing song "${song.title}":`, error);
        results.push({
          id: song._id,
          title: song.title,
          error: (error as Error).message
        });
      }
    }

    console.log(`🎉 Successfully fixed ${fixed} songs!`);
    console.log('🔧 =========================');
    console.log('🔧 FIX METADATA API REQUEST END');
    console.log('🔧 =========================\n');

    return NextResponse.json({
      message: "Metadata fix completed successfully",
      stats: {
        totalFound: songsToFix.length,
        totalFixed: fixed,
        totalErrors: results.filter(r => r.error).length
      },
      results
    });

  } catch (error) {
    console.error('❌ Fix metadata error:', error);
    return NextResponse.json({ error: "Failed to fix metadata" }, { status: 500 });
  }
}
