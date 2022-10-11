import { extname } from 'path';
import { path as approot } from 'app-root-path';
import { ensureDir, writeFile } from 'fs-extra';

const uploadFolder = `${approot}/uploads/`;

export const uploadFiles = async (images, room, id?): Promise<string[]> => {
  await ensureDir(uploadFolder);

  const result = await Promise.all(
    images.map(async (image, i) => {
      const index = room.images.length + i;
      const name = `${room.id}-${index}${extname(image.originalname)}`;
      await writeFile(`${uploadFolder}/${name}`, image.buffer);
      return name;
    }),
  );
  return result;
};
