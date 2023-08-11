import { Injectable } from '@nestjs/common';
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytes,
  deleteObject,
} from 'firebase/storage';
import { firebasePath } from 'src/enum/enum';
import { v4 as uuid } from 'uuid';

@Injectable()
export class GoogleCloudService {
  async upload(file: Buffer, path: firebasePath): Promise<string> {
    const storage = getStorage();
    const storageRef = ref(storage, `${path}/${uuid()}.jpeg`);
    const metadata = {
      contentType: 'image/jpeg',
    };
    await uploadBytes(storageRef, file, metadata);

    return getDownloadURL(storageRef);
  }
  async delete(url: string) {
    const storage = getStorage();
    const storageRef = ref(storage, url);
    deleteObject(storageRef)
      .then(() => console.log('Xóa ảnh thành công!'))
      .catch((err) => console.log(err));
  }
}
