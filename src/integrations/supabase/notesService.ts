import { supabase } from '@/lib/supabaseClient';
import { PostgrestError } from '@supabase/supabase-js';

// Define the structure of a note based on your DB table
interface DbNote {
    id: string;
    content: string;
    user_id: string; // *** Adjust if your user foreign key is named differently ***
    created_at: string;
}

// Define the structure for adding a new note (omit generated fields)
interface NewNote {
    content: string;
    user_id: string; // *** Adjust if your user foreign key is named differently ***
}

const TABLE_NAME = 'notes'; // *** Adjust table name if needed ***

export const notesService = {
    /**
     * Fetches notes for a specific user.
     * @param userId - The ID of the user whose notes to fetch.
     * @returns A promise that resolves to an array of notes or null if an error occurs.
     */
    getNotesForUser: async (userId: string): Promise<DbNote[] | null> => {
        if (!userId) {
            console.error('notesService.getNotesForUser: userId is required.');
            return null;
        }
        console.log(`notesService: Fetching notes for user ID: ${userId}`);
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error(`Error fetching notes from ${TABLE_NAME}:`, error.message);
            return null;
        }
        console.log(`notesService: Fetched ${data?.length ?? 0} notes from ${TABLE_NAME}.`);
        return data as DbNote[];
    },

    /**
     * Adds a new note to the database.
     * @param noteData - An object containing the note content and user ID.
     * @returns A promise that resolves to the newly created note or null if an error occurs.
     */
    addNote: async (noteData: NewNote): Promise<DbNote | null> => {
        if (!noteData.user_id || !noteData.content?.trim()) { // Also check content isn't just whitespace
            console.error('notesService.addNote: user_id and non-empty content are required.');
            return null;
        }
        console.log(`notesService: Adding note to ${TABLE_NAME} for user ID: ${noteData.user_id}`);
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .insert([
                {
                    content: noteData.content,
                    user_id: noteData.user_id,
                },
            ])
            .select() // Select the newly inserted row
            .single(); // Expecting only one row back

        if (error) {
            console.error(`Error adding note to ${TABLE_NAME}:`, error.message);
            return null;
        }
        console.log(`notesService: Note added successfully to ${TABLE_NAME}:`, data);
        return data as DbNote;
    },

    // Example delete function (implement if needed)
    /*
    deleteNote: async (noteId: string): Promise<boolean> => {
      if (!noteId) {
          console.error('notesService.deleteNote: noteId is required.');
          return false;
      }
      console.log(`notesService: Deleting note ${noteId} from ${TABLE_NAME}`);
      const { error } = await supabase
          .from(TABLE_NAME)
          .delete()
          .eq('id', noteId);
  
      if (error) {
          console.error(`Error deleting note ${noteId} from ${TABLE_NAME}:`, error.message);
          return false;
      }
      console.log(`notesService: Note ${noteId} deleted successfully from ${TABLE_NAME}.`);
      return true;
    }
    */
};
