export function getImageUrl(imagePath: string | null | undefined): string | null {
  if (!imagePath) {
    return null;
  }

  if (imagePath.startsWith('/api/uploads/')) {
    return imagePath;
  }

  if (imagePath.startsWith('http://localhost:3000/') || 
      imagePath.startsWith('http://127.0.0.1:3000/')) {
    const url = new URL(imagePath);
    const path = url.pathname;
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return `/api/uploads/${cleanPath}`;
  }

  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  const cleanPath = imagePath.startsWith('/') 
    ? imagePath.substring(1) 
    : imagePath;
  
  return `/api/uploads/${cleanPath}`;
}

