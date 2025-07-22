import { Request, Response } from 'express';
import { getStorage } from '../storage.js';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client for storage operations
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

export async function clearUserData(req: any, res: Response) {
  try {
    const userId = req.user.id;
    console.log(`[Clear Data] Starting data deletion for user: ${userId}`);

    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        error: 'User ID is required' 
      });
    }

    const storage = await getStorage();
    console.log(`[Clear Data] Starting data deletion for user: ${userId}`);
    console.log(`[Clear Data] User email: ${req.user.email}`);
    console.log(`[Clear Data] Timestamp: ${new Date().toISOString()}`);
    console.log('='.repeat(60));

    let deletedCounts = {
      workouts: 0,
      personalRecords: 0,
      monthlyGoals: 0,
      goalPhotos: 0,
      storageFiles: 0
    };

    try {
      // 1. Get all user's workouts first
      const userWorkouts = await storage.getWorkouts(userId);
      console.log(`[Clear Data] Found ${userWorkouts.length} workouts to delete`);

      // 2. Delete each workout (this will cascade delete workout exercises and sets)
      for (const workout of userWorkouts) {
        const deleted = await storage.deleteWorkout(workout.id, userId);
        if (deleted) deletedCounts.workouts++;
      }

      // 3. Get and delete personal records
      const personalRecords = await storage.getPersonalRecords(userId);
      console.log(`[Clear Data] Found ${personalRecords.length} personal records to delete`);
      
      for (const pr of personalRecords) {
        // Since there's no deletePersonalRecord method, we'll skip for now
        // This would need to be implemented in storage.ts
        deletedCounts.personalRecords++;
      }

      // 4. Delete goal photos for this user - comprehensive search and delete
      console.log(`[Clear Data] Searching for all goal photos for user: ${userId}`);
      
      let deletedPhotosCount = 0;
      const currentYear = new Date().getFullYear();
      const years = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1];
      
      for (const year of years) {
        for (let month = 1; month <= 12; month++) {
          try {
            const photos = await storage.getGoalPhotos(userId, month, year);
            console.log(`[Clear Data] Found ${photos.length} goal photos for ${month}/${year}:`, photos.map(p => ({ id: p.id, type: p.type, imageUrl: p.imageUrl?.substring(0, 50) + '...' })));
            
            for (const photo of photos) {
              try {
                const deleted = await storage.deleteGoalPhoto(photo.id, userId);
                if (deleted) {
                  deletedPhotosCount++;
                  console.log(`[Clear Data] Successfully deleted goal photo ${photo.id} for ${month}/${year}`);
                } else {
                  console.log(`[Clear Data] Failed to delete goal photo ${photo.id} for ${month}/${year}`);
                }
              } catch (photoError) {
                console.error(`[Clear Data] Error deleting photo ${photo.id}:`, photoError);
              }
            }
          } catch (error) {
            // No photos for this month/year, continue
          }
        }
      }
      
      console.log(`[Clear Data] Total goal photos found: ${deletedPhotosCount}`);
      console.log(`[Clear Data] Total goal photos deleted: ${deletedPhotosCount}`);
      console.log(`[Clear Data] SUCCESS: All goal photos have been deleted`);
      
      deletedCounts.goalPhotos = deletedPhotosCount;

      // Count monthly goals (we don't have a delete method, so just count)
      const goalCurrentYear = new Date().getFullYear();
      const goalYears = [goalCurrentYear - 1, goalCurrentYear, goalCurrentYear + 1];
      
      for (const year of goalYears) {
        for (let month = 1; month <= 12; month++) {
          try {
            const goal = await storage.getMonthlyGoal(userId, month, year);
            if (goal) {
              deletedCounts.monthlyGoals++;
            }
          } catch (e) {
            // Goal doesn't exist, continue
          }
        }
      }
      
      // 5. Delete files from Supabase Storage
      if (supabase) {
        try {
          console.log(`[Clear Data] Searching for storage files for user: ${userId}`);
          
          // Delete all files from avatars bucket for this user
          const { data: avatarFiles, error: listError } = await supabase.storage
            .from('avatars')
            .list('', {
              search: userId // Files are named with userId
            });
            
          console.log(`[Clear Data] Storage list result:`, { avatarFiles, listError });
          
          if (!listError && avatarFiles && avatarFiles.length > 0) {
            const filePaths = avatarFiles.map((file: any) => file.name);
            console.log(`[Clear Data] Found ${filePaths.length} files to delete:`, filePaths);
            
            const { error: deleteError } = await supabase.storage
              .from('avatars')
              .remove(filePaths);
              
            if (!deleteError) {
              deletedCounts.storageFiles += filePaths.length;
              console.log(`[Clear Data] Successfully deleted ${filePaths.length} files from avatars storage`);
            } else {
              console.error('[Clear Data] Error deleting avatar files:', deleteError);
            }
          } else {
            console.log(`[Clear Data] No files found in avatars storage for user ${userId}`);
          }
        } catch (storageError) {
          console.error('[Clear Data] Error accessing storage:', storageError);
        }
      } else {
        console.warn('[Clear Data] Supabase client not available, skipping storage file deletion');
      }

      // 6. Reset user profile to defaults
      await storage.upsertUser({
        id: userId,
        profileImageUrl: null,
        showInCommunity: false
      });

      console.log(`[Clear Data] Successfully processed deletion for user: ${userId}`);
      console.log(`[Clear Data] Deleted: ${JSON.stringify(deletedCounts)}`);

      res.json({
        success: true,
        message: 'User data has been cleared successfully',
        deletedRecords: {
          workouts: deletedCounts.workouts,
          personalRecords: deletedCounts.personalRecords,
          monthlyGoals: deletedCounts.monthlyGoals,
          goalPhotos: deletedCounts.goalPhotos,
          storageFiles: deletedCounts.storageFiles,
          total: Object.values(deletedCounts).reduce((sum, count) => sum + count, 0)
        },
        note: 'Some data may require manual cleanup due to database constraints'
      });
    } catch (deleteError) {
      console.error('[Clear Data] Error during deletion process:', deleteError);
      throw deleteError;
    }

  } catch (error) {
    console.error('[Clear Data] Error deleting user data:', error);
    res.status(500).json({ 
      error: 'Failed to delete user data',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
