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
    console.log('Google Drive files:', data.files);
    return data.files;
  } catch (error) {
    console.error('Error accessing Google Drive files:', error);
    throw error;
  }
}

export default accessDriveFiles;