import API from '../globals/axiosConfig';

interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  thumbnailLink?: string;
  webViewLink?: string;
  size?: string;
  modifiedTime?: string;
}

interface GoogleDriveResponse {
  files: GoogleDriveFile[];
}



const accessDriveFiles = async (accessToken: string, folderId: string = 'root'): Promise<GoogleDriveFile[]> => {
  try {
    // Updated to explicitly request thumbnails with proper size
    const fields = 'files(id,name,mimeType,size,thumbnailLink,webViewLink,modifiedTime)';
    const query = folderId === 'root' ? '' : `'${folderId}' in parents`;
    const queryParam = query ? `&q=${encodeURIComponent(query)}` : '';
    
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?pageSize=100&fields=${fields}${queryParam}`, 
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`

        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: GoogleDriveResponse = await response.json();
    
    // Process thumbnails to ensure they are accessible
    const processedFiles = data.files.map(file => {
      // If the file has a thumbnailLink, make sure it's using the correct access token
      if (file.thumbnailLink) {
        // Google Drive thumbnail URLs need to be decoded and may need parameter adjustments
        file.thumbnailLink = file.thumbnailLink.replace('=s220', '=s400');
      }
      return file;
    });
    
    return processedFiles;
  } catch (error) {
    console.error('Error accessing Google Drive files:', error);
    throw error;
  }
};

export default accessDriveFiles;