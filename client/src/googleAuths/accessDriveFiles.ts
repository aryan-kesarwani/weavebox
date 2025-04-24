import API from '../globals/axiosConfig';

interface GoogleDriveFile {
    id: string;
    name: string;
    mimeType: string;
}

interface GoogleDriveResponse {
    files: GoogleDriveFile[];
}

const accessDriveFiles = async (accessToken: string): Promise<GoogleDriveFile[]> => {
    try {
        const response = await fetch('https://www.googleapis.com/drive/v3/files?fields=files(id,name,mimeType)', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data: GoogleDriveResponse = await response.json();
        console.log(data.files);
        return data.files;
    } catch (error) {
        console.error('Error accessing Google Drive files:', error);
        throw error;
    }
}

export default accessDriveFiles;