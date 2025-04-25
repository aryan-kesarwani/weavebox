import { db, FileRecord } from './db';

/**
 * Utility for managing file storage in IndexedDB
 */

// Helper functions
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
};

const getFileType = (mimeType: string): string => {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.includes('pdf') || 
      mimeType.includes('document') || 
      mimeType.includes('presentation') || 
      mimeType.includes('spreadsheet')) {
    return 'document';
  }
  if (mimeType.includes('zip') || 
      mimeType.includes('compressed') || 
      mimeType.includes('archive')) {
    return 'archive';
  }
  return 'file';
};

/**
 * Get all stored files from IndexedDB
 */
export const getStoredFiles = async (): Promise<FileRecord[]> => {
  try {
    // Get all files ordered by date (newest first)
    const files = await db.files.orderBy('id').reverse().toArray();
    
    // Create object URLs for previewing files
    return files.map(file => {
      if (!file.url && file.data) {
        file.url = URL.createObjectURL(file.data);
      }
      return file;
    });
  } catch (error) {
    console.error('Error retrieving files from IndexedDB:', error);
    return [];
  }
};

/**
 * Add a new file to IndexedDB
 */
export const storeFile = async (file: File, userAddress: string): Promise<FileRecord> => {
  try {
    // Create date and time strings
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = now.toTimeString().split(' ')[0];
    
    // Format size string
    const sizeInBytes = file.size;
    const size = formatFileSize(sizeInBytes);
    
    // Create the file record
    const fileRecord: FileRecord = {
      name: file.name,
      type: getFileType(file.type),
      contentType: file.type,
      data: file,
      size,
      sizeInBytes,
      date,
      time,
      txHash: 'pending',
      permanentlyStored: true,
      uploadedBy: userAddress || 'Unknown',
      status: 'pending'
    };
    
    // Add to the database
    const id = await db.files.add(fileRecord);
    
    // Retrieve the complete record
    const storedRecord = await db.files.get(id);
    if (!storedRecord) {
      throw new Error('Failed to retrieve stored file');
    }
    
    // Create and attach the URL
    storedRecord.url = URL.createObjectURL(storedRecord.data);
    
    return storedRecord;
  } catch (error) {
    console.error('Error storing file in IndexedDB:', error);
    throw error;
  }
};

/**
 * Delete a file from IndexedDB
 */
export const deleteFile = async (id: number): Promise<boolean> => {
  try {
    await db.files.delete(id);
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

// Export the StoredFile type for backwards compatibility
export type StoredFile = FileRecord;