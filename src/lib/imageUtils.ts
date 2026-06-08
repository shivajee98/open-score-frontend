// src/lib/imageUtils.ts

/**
 * Compresses an image file to reduce size before uploading.
 * Useful for preventing network timeouts on slow connections.
 * 
 * @param file The original File or Blob
 * @param maxWidth The maximum width of the compressed image
 * @param maxHeight The maximum height of the compressed image
 * @param quality Quality of the JPEG compression (0 to 1)
 * @returns A Promise resolving to a compressed Blob (or the original file if compression fails)
 */
export const compressImage = (
    file: File | Blob, 
    maxWidth = 1200, 
    maxHeight = 1200, 
    quality = 0.8
): Promise<Blob> => {
    return new Promise((resolve) => {
        // Only attempt compression on images
        if (!file.type.startsWith('image/')) {
            return resolve(file);
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                let width = img.width;
                let height = img.height;

                // Calculate the new dimensions keeping aspect ratio
                if (width > height) {
                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = Math.round((width * maxHeight) / height);
                        height = maxHeight;
                    }
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    return resolve(file);
                }

                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            resolve(blob);
                        } else {
                            resolve(file); // Fallback to original if blob creation fails
                        }
                    },
                    'image/jpeg',
                    quality
                );
            };
            img.onerror = () => {
                resolve(file); // Fallback to original if image loading fails
            };
        };
        reader.onerror = () => {
            resolve(file); // Fallback to original if file reading fails
        };
    });
};
