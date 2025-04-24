import Dexie from 'dexie';

export interface FileRecord {
  id?: number;
  name: string;
  type: string;
  contentType: string;
  data: Blob;
  url?: string;
  size: string;
  sizeInBytes: number;
  date: string;
  time: string;
  txHash: string;
  permanentlyStored: boolean;
  uploadedBy: string;
  status: 'pending' | 'uploading' | 'uploaded';
}

class FileDatabase extends Dexie {
  files: Dexie.Table<FileRecord, number>;

  constructor() {
    super('WeaveBoxDatabase');
    this.version(1).stores({
      files: '++id, name, type, status, date'
    });
    this.files = this.table('files');
  }
}

export const db = new FileDatabase();