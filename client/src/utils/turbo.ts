//turbo sdk file use to upload files to arweave
import mime from 'mime-types';
import { TurboFactory, ArconnectSigner } from '@ardrive/turbo-sdk/web';
import { db, FileRecord } from './db';
// import { Readable } from 'stream';

export const uploadArweave = async () => {
  // Fetch all files from the database
  const files: FileRecord[] = await db.files.toArray();

  if (files.length === 0) {
    console.log("No files found in the database.");
    return;
  }

  // Initialize TurboFactory with the signer
  const signer = new ArconnectSigner(window.arweaveWallet);
  const turbo = TurboFactory.authenticated({ signer });

  // Get the active wallet address
  const walletAddress = await window.arweaveWallet.getActiveAddress();

  for (const file of files) {
    // Skip if file has a non-empty transaction ID that isn't 'pending'
    if (file.txHash && file.txHash !== 'pending') {
      console.log(`Skipping ${file.name} - already uploaded with TX ID: ${file.txHash}`);
      continue;
    }

    const { name: fileName, data, sizeInBytes: fileSize, contentType } = file;
    const fileExtension = fileName.split('.').pop() || '';
    const baseName = fileName.substring(0, fileName.lastIndexOf('.')) || fileName;

    // Skip balance check for files under 100KB (free upload)
    if (fileSize > 100 * 1024) {
      // Calculate upload costs only for files over 100KB
      const [{ winc: fileSizeCost }] = await turbo.getUploadCosts({ bytes: [fileSize] });
      console.log(`File: ${fileName}, Size: ${fileSize} bytes, Cost: ${fileSizeCost} Winc`);
    } else {
      console.log(`File: ${fileName}, Size: ${fileSize} bytes (Free upload)`);
    }

    try {
      const buffer = await data.arrayBuffer();
      const uploadResult = await turbo.uploadFile({
        fileStreamFactory: () => {
          return new ReadableStream({
            start(controller) {
              controller.enqueue(new Uint8Array(buffer));
              controller.close();
            }
          });
        },
        fileSizeFactory: () => fileSize,
        fileName: `${baseName}.${fileExtension}`,
        contentType: contentType || mime.lookup(fileName) || 'application/octet-stream',
        dataItemOpts: {
          tags: [
            { name: 'Wallet-Address', value: walletAddress },
            { name: 'Version', value: '2.0.1' },
            { name: 'Content-Type', value: contentType || mime.lookup(fileName) || 'application/octet-stream' },
            { name: 'File-Extension', value: fileExtension },
            { name: 'File-Type', value: contentType || mime.lookup(fileName) || 'application/octet-stream' }
          ]
        }
      } as any);

      console.log(`Uploaded ${fileName} (${contentType}) successfully. TX ID: ${uploadResult.id}`);

      // Update the file's status in the database
      await db.files.update(file.id!, { status: 'uploaded', txHash: uploadResult.id });
      console.log(`Updated file status for ${fileName} in the database.`);
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Failed to upload ${fileName}:`, error.message);
      } else {
        console.error(`Failed to upload ${fileName}:`, error);
      }
    }
  }
};




// import fs from 'fs';
// import path from 'path';
// import mime from 'mime-types';
// import { TurboFactory, TurboAuthenticatedClient, TurboWallet } from '@ardrive/turbo-sdk';
// import Arweave from 'arweave';
// import { Request, Response } from 'express';
// import  JWKInterface  from 'arweave';

// const downloadFolder: string = './test';

// export const uploadController = async (req: Request,res: Response): Promise<void> => {
//   if (!fs.existsSync(downloadFolder)) {
//     console.log(`Folder '${downloadFolder}' does not exist.`);
//     return;
//   }

//   // Get all files in directory
//   const files: string[] = fs.readdirSync(downloadFolder)
//     .filter((f: string) => fs.statSync(path.join(downloadFolder, f)).isFile());

//   if (files.length === 0) {
//     console.log("No files found in 'download' folder.");
//     return;
//   }



//   const jwk: JWKInterface = JSON.parse(fs.readFileSync('wallet.json', 'utf-8'));
//   const arweave: Arweave = new Arweave({});
//   const turbo : TurboAuthenticatedClient = TurboFactory.authenticated({ privateKey: jwk as JWKInterface | TurboWallet | undefined });
//   const { winc: balance }: { winc: number } = await turbo.getBalance();

//   console.log(`Current balance: ${balance} Winc`);

//   for (const fileName of files) {
//     const filePath: string = path.join(downloadFolder, fileName);
//     const fileSize: number = fs.statSync(filePath).size;
//     const contentType: string = mime.lookup(fileName) || 'application/octet-stream';

//     const [{ winc: fileSizeCost }]: [{ winc: number }] = await turbo.getUploadCosts({ bytes: [fileSize] });
//     console.log(`File: ${fileName}, Size: ${fileSize} bytes, Cost: ${fileSizeCost} Winc`);

//     try {
//       const uploadResult = await turbo.uploadFile({
//         fileStreamFactory: (): fs.ReadStream => fs.createReadStream(filePath),
//         fileSizeFactory: (): number => fileSize,
//         fileMetaDataFactory: (): { fileName: string; contentType: string } => ({
//           fileName: fileName,
//           contentType: contentType
//         }),
//         dataItemOpts: {
//           tags: [
//             { name: 'Content-Type', value: contentType }
//           ]
//         }
//       });

//       console.log(`Uploaded ${fileName} (${contentType}) successfully. TX ID: ${uploadResult.id}`);

//       // Delete the file after successful upload
//       fs.unlinkSync(filePath);
//       console.log(`Deleted ${fileName} from '${downloadFolder}' after successful upload.`);
//     } catch (error: unknown) {
//       if (error instanceof Error) {
//         console.error(`Failed to upload ${fileName}:`, error.message);
//       } else {
//         console.error(`Failed to upload ${fileName}:`, error);
//       }
//     }
//   }
// };
