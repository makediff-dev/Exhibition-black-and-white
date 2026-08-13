const MAX_FILE_BYTES = 5 * 1024 * 1024;

export function resizeImageFile(
  file: File,
  maxSize = 256,
  quality = 0.82
): Promise<string> {
  if (file.size > MAX_FILE_BYTES) {
    return Promise.reject(new Error("Файл слишком большой. Максимум 5 МБ."));
  }

  return new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const scale = Math.min(maxSize / image.width, maxSize / image.height, 1);
      const width = Math.max(1, Math.round(image.width * scale));
      const height = Math.max(1, Math.round(image.height * scale));

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext("2d");
      if (!context) {
        reject(new Error("Не удалось обработать изображение"));
        return;
      }

      context.drawImage(image, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Не удалось загрузить изображение"));
    };

    image.src = objectUrl;
  });
}
