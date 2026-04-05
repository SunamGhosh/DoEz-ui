/**
 * Constructs the correct image URL.
 * If the path is already an absolute URL (e.g., Cloudinary), it returns it as is.
 * Otherwise, it prefixes it with the backend URL.
 *
 * @param {string} imagePath - The path or URL of the image.
 * @returns {string|null} - The full URL or null if no path provided.
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;

  // If it's already a full URL (Cloudinary, etc.), return as is
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  // Otherwise, it's a local path, prefix with backend URL
  // We use the base URL from environment variables or a fallback
  const backendBase = import.meta.env.VITE_BACKEND_URL;

  // VITE_BACKEND_URL is often http://localhost:3500/api
  // We might need to split it to get just the domain/port for static files if the backend serves them from root
  const baseUrl = backendBase
    ? backendBase.split("/api")[0]
    : "http://localhost:3500";

  // Ensure we don't have double slashes
  const cleanPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;

  return `${baseUrl}${cleanPath}`;
};
