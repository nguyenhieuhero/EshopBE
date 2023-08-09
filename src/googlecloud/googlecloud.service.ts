import { Injectable } from '@nestjs/common';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import { firebasePath } from 'src/enum/enum';
import { v4 as uuid } from 'uuid';

@Injectable()
export class GoogleCloudService {
  async upload(file: Express.Multer.File, path: firebasePath): Promise<string> {
    const storage = getStorage();
    const storageRef = ref(storage, `${path}/${uuid()}.jpeg`);
    const metadata = {
      contentType: 'image/jpeg',
    };
    await uploadBytes(storageRef, file.buffer, metadata);

    return getDownloadURL(storageRef);
  }
}
