export async function convertHeicToJpeg(file: File): Promise<File> {
    const isHeic = file.name.toLowerCase().endsWith('.heic') || 
                   file.name.toLowerCase().endsWith('.heif') || 
                   file.type === 'image/heic' || 
                   file.type === 'image/heif';
    
    if (!isHeic) return file;

    try {
        const heic2any = (await import('heic2any')).default;
        
        const result = await heic2any({
            blob: file,
            toType: 'image/jpeg',
            quality: 0.7
        });

        const blob = Array.isArray(result) ? result[0] : result;
        const newFileName = file.name.replace(/\.(heic|heif)$/i, '.jpg');
        const finalFileName = newFileName.toLowerCase().endsWith('.jpg') ? newFileName : `${newFileName}.jpg`;

        return new File([blob], finalFileName, { type: 'image/jpeg' });
    } catch (error) {
        console.error('HEIC conversion failed:', error);
        return file;
    }
}
