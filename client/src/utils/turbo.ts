import mime from 'mime-types';
import { TurboFactory, ArconnectSigner } from '@ardrive/turbo-sdk/web';
import { db, FileRecord } from './db';

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

  // Fetch the current balance
  const { winc: balance } = await turbo.getBalance();
  console.log(`Current balance: ${balance} Winc`);

  for (const file of files) {
    const { name: fileName, data, sizeInBytes: fileSize, contentType } = file;

    // Calculate upload costs
    const [{ winc: fileSizeCost }] = await turbo.getUploadCosts({ bytes: [fileSize] });
    console.log(`File: ${fileName}, Size: ${fileSize} bytes, Cost: ${fileSizeCost} Winc`);

    try {
      const buffer = await data.arrayBuffer(); // Convert the Blob to an ArrayBuffer
      const uploadResult = await turbo.uploadFile({
        fileStreamFactory: () =>
          new ReadableStream({
            start(controller) {
              controller.enqueue(buffer); // Enqueue the ArrayBuffer
              controller.close(); // Close the stream
            },
          }),
        fileSizeFactory: () => fileSize,
        fileMetaDataFactory: () => ({
          fileName: fileName,
          contentType: contentType || mime.lookup(fileName) || 'application/octet-stream',
        }),
        dataItemOpts: {
          tags: [
            { name: 'Content-Type', value: contentType || mime.lookup(fileName) || 'application/octet-stream' },
          ],
        },
      });

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
