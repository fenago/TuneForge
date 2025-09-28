/**
 * MIGRATION SCRIPT: Convert existing songs to unified metadata schema
 * 
 * This script migrates existing songs to the new unified metadata structure
 * that supports both SunoAPI.com and SunoAPI.org consistently.
 * 
 * Run this script when deploying the unified metadata system.
 */

import mongoose from 'mongoose';
import Song from '@/models/Song';
import { validateUnifiedMetadata, generateMetadataReport } from '@/lib/metadata-validator';
import { APIProvider } from '@/types/unified-song';

interface MigrationResult {
  total_processed: number;
  successfully_migrated: number;
  failed_migrations: number;
  skipped_already_migrated: number;
  errors: string[];
  detailed_report: any;
}

/**
 * Main migration function
 */
export async function migrateToUnifiedSchema(): Promise<MigrationResult> {
  console.log('\n🔄 =========================');
  console.log('🔄 MIGRATION: Starting unified schema migration');
  console.log('🔄 =========================');
  
  const result: MigrationResult = {
    total_processed: 0,
    successfully_migrated: 0,
    failed_migrations: 0,
    skipped_already_migrated: 0,
    errors: [],
    detailed_report: null
  };

  try {
    // Get all songs that need migration
    const songs = await Song.find({}).lean();
    result.total_processed = songs.length;
    
    console.log(`🔄 Found ${songs.length} songs to process`);
    
    if (songs.length === 0) {
      console.log('✅ No songs found - migration complete');
      return result;
    }

    // Process songs in batches
    const batchSize = 50;
    for (let i = 0; i < songs.length; i += batchSize) {
      const batch = songs.slice(i, i + batchSize);
      console.log(`\n🔄 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(songs.length / batchSize)}`);
      
      for (const song of batch) {
        try {
          await migrateSingleSong(song, result);
        } catch (error) {
          console.error(`❌ Failed to migrate song ${song._id}:`, error);
          result.failed_migrations++;
          result.errors.push(`Song ${song._id}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
    }

    // Generate final report
    console.log('\n🔄 Generating migration report...');
    const migratedSongs = await Song.find({ apiProvider: { $exists: true } }).lean();
    result.detailed_report = generateMetadataReport(migratedSongs as any[]);
    
    console.log('✅ MIGRATION: Complete!');
    console.log('✅ Results:');
    console.log(`   - Total Processed: ${result.total_processed}`);
    console.log(`   - Successfully Migrated: ${result.successfully_migrated}`);
    console.log(`   - Failed: ${result.failed_migrations}`);
    console.log(`   - Skipped: ${result.skipped_already_migrated}`);
    console.log(`   - Errors: ${result.errors.length}`);
    
    return result;
    
  } catch (error) {
    console.error('❌ MIGRATION: Fatal error:', error);
    result.errors.push(`Fatal error: ${error instanceof Error ? error.message : String(error)}`);
    return result;
  }
}

/**
 * Migrates a single song document
 */
async function migrateSingleSong(song: any, result: MigrationResult): Promise<void> {
  // Check if already migrated
  if (song.apiProvider) {
    console.log(`⏭️  Song ${song._id} already migrated`);
    result.skipped_already_migrated++;
    return;
  }

  console.log(`🔄 Migrating song: ${song._id} - "${song.title}"`);

  // Determine API provider based on existing data
  const apiProvider: APIProvider = determineApiProvider(song);
  
  // Create migration data
  const migrationData: any = {
    // Core API tracking
    apiProvider: apiProvider,
    apiTaskId: song.taskId || song._id.toString(), // Fallback to _id if no taskId
    apiClipId: song.clipId || song._id.toString(), // Fallback to _id if no clipId
    
    // Enhanced metadata
    isInstrumental: !song.lyrics || song.lyrics.length === 0,
    isVariation: false, // Default for existing songs
    isFeatured: false, // Default for existing songs
    generationCost: estimateGenerationCost(song, apiProvider),
    
    // Metadata tracking
    metadataCoverageScore: 0, // Will be calculated
    lastMetadataUpdate: new Date(),
    
    // Ensure status is in new format
    status: mapLegacyStatus(song.status),
    
    // Generation timing
    generationStartTime: song.createdAt,
    generationEndTime: song.updatedAt || song.createdAt,
  };

  // Calculate coverage score
  const tempMetadata = { ...song, ...migrationData };
  const validation = validateUnifiedMetadata(tempMetadata, apiProvider);
  migrationData.metadataCoverageScore = validation.coverage_score;

  // Store original response if available
  if (song.originalApiResponse) {
    migrationData.apiResponseRaw = song.originalApiResponse;
  }

  // Update the document
  await Song.updateOne(
    { _id: song._id },
    { $set: migrationData }
  );

  console.log(`✅ Migrated song ${song._id} (${apiProvider}, coverage: ${validation.coverage_score}%)`);
  
  if (!validation.is_valid) {
    console.warn(`⚠️  Song ${song._id} has validation issues:`, validation.missing_required);
  }

  result.successfully_migrated++;
}

/**
 * Determines which API provider was used based on existing data
 */
function determineApiProvider(song: any): APIProvider {
  // Try to determine from existing data patterns
  
  // If we have clipId and it looks like SunoAPI.org format
  if (song.clipId && typeof song.clipId === 'string') {
    if (song.clipId.includes('chirp') || song.clipId.length > 20) {
      return 'sunoapi_org';
    }
  }
  
  // If we have specific model versions
  if (song.aiModel && ['chirp-v3-5', 'chirp-v4', 'chirp-v4-5', 'chirp-v4-5-plus'].includes(song.aiModel)) {
    return 'sunoapi_org';
  }
  
  // If audio URL contains specific patterns
  if (song.files?.audioUrl) {
    if (song.files.audioUrl.includes('suno.ai') || song.files.audioUrl.includes('sunoapi.org')) {
      return 'sunoapi_org';
    }
    if (song.files.audioUrl.includes('sunoapi.com')) {
      return 'sunoapi_com';
    }
  }
  
  // Default to sunoapi_com for older songs
  return 'sunoapi_com';
}

/**
 * Maps legacy status values to new unified status
 */
function mapLegacyStatus(status?: string): string {
  if (!status) return 'pending';
  
  const statusMap: Record<string, string> = {
    'generating': 'pending',
    'processing': 'processing',
    'completed': 'completed',
    'failed': 'failed',
    'success': 'completed',
    'error': 'failed',
  };
  
  return statusMap[status.toLowerCase()] || 'pending';
}

/**
 * Estimates generation cost based on song data and provider
 */
function estimateGenerationCost(song: any, provider: APIProvider): number {
  const baseCosts = {
    sunoapi_com: 10,
    sunoapi_org: 8
  };
  
  let cost = baseCosts[provider];
  
  // Adjust based on model if available
  if (song.aiModel) {
    const modelMultipliers: Record<string, number> = {
      'chirp-v3-5': 1.0,
      'chirp-v4': 1.2,
      'chirp-v4-5': 1.4,
      'chirp-v4-5-plus': 1.6,
      'premium': 1.5,
      'max': 2.0,
    };
    
    cost *= (modelMultipliers[song.aiModel] || 1.0);
  }
  
  // Adjust based on duration
  if (song.duration && song.duration > 120) {
    cost *= 1.5; // Longer songs cost more
  }
  
  return Math.round(cost);
}

/**
 * Validates all migrated songs
 */
export async function validateMigratedSongs(): Promise<any> {
  console.log('\n🔍 Validating migrated songs...');
  
  const songs = await Song.find({ apiProvider: { $exists: true } }).lean();
  const validationResults = {
    total: songs.length,
    valid: 0,
    invalid: 0,
    high_coverage: 0,
    low_coverage: 0,
    issues: [] as string[]
  };
  
  for (const song of songs) {
    const validation = validateUnifiedMetadata(song as any, song.apiProvider || 'sunoapi_com');
    
    if (validation.is_valid) {
      validationResults.valid++;
    } else {
      validationResults.invalid++;
      validationResults.issues.push(`${song._id}: ${validation.errors.join(', ')}`);
    }
    
    if ((song.metadataCoverageScore || 0) >= 80) {
      validationResults.high_coverage++;
    } else if ((song.metadataCoverageScore || 0) < 60) {
      validationResults.low_coverage++;
    }
  }
  
  console.log('🔍 Validation Results:');
  console.log(`   - Valid: ${validationResults.valid}/${validationResults.total}`);
  console.log(`   - High Coverage (80%+): ${validationResults.high_coverage}`);
  console.log(`   - Low Coverage (<60%): ${validationResults.low_coverage}`);
  console.log(`   - Issues: ${validationResults.issues.length}`);
  
  return validationResults;
}

/**
 * CLI wrapper for running migration
 */
async function runMigration() {
    try {
      // Load environment variables
      require('dotenv').config();
      
      if (!process.env.MONGODB_URI) {
        console.error('❌ MONGODB_URI environment variable is required');
        process.exit(1);
      }
      
      // Connect to MongoDB
      console.log('📦 Connecting to MongoDB Atlas...');
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('✅ Connected to MongoDB Atlas successfully');
      
      // Run migration
      const result = await migrateToUnifiedSchema();
      
      // Validate results
      await validateMigratedSongs();
      
      console.log('\n🎉 Migration complete!');
      console.log('📊 Final Results:', JSON.stringify(result, null, 2));
      
      process.exit(0);
    } catch (error) {
      console.error('💥 Migration failed:', error);
      process.exit(1);
    }
}

if (require.main === module) {
  runMigration();
}
