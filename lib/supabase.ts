import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Storage bucket name for documents
export const DOCUMENTS_BUCKET = "documents";

/**
 * Upload a file to Supabase Storage
 * @param file - File to upload
 * @param userId - User ID for organizing files
 * @returns Object containing file path and public URL
 */
export async function uploadFile(file: File, userId: string) {
  const fileExt = file.name.split(".").pop();
  const fileName = `${userId}/${Date.now()}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from(DOCUMENTS_BUCKET)
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    throw error;
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from(DOCUMENTS_BUCKET).getPublicUrl(data.path);

  return {
    path: data.path,
    url: publicUrl,
  };
}

/**
 * Delete a file from Supabase Storage
 * @param filePath - Path of the file to delete
 */
export async function deleteFile(filePath: string) {
  const { error } = await supabase.storage
    .from(DOCUMENTS_BUCKET)
    .remove([filePath]);

  if (error) {
    throw error;
  }
}
