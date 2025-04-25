// import API from '../globals/axiosConfig';

interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  thumbnailLink?: string;
  webViewLink?: string;
  size?: string;
  modifiedTime?: string;
}

// interface GoogleDriveResponse {
//   files: GoogleDriveFile[];
// }

const accessDriveFiles = async (token: string, folderId: string = 'root'): Promise<GoogleDriveFile[]> => {
  if (!token) {
    throw new Error('No access token provided');
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents&fields=files(id,name,mimeType,size,thumbnailLink,webViewLink,modifiedTime)`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      // Check specifically for auth errors
      if (response.status === 401) {
        throw new Error('401 Authentication error: Token expired or invalid');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.files || [];
  } catch (error) {
    console.error('Error fetching Drive files:', error);
    throw error;
  }
};

export default accessDriveFiles;