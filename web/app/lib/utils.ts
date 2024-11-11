export function formatFileSize(bytes: number): string {
  const KB = 1024;
  const MB = KB * 1024;
  const GB = MB * 1024;
  const TB = GB * 1024;

  if (bytes < KB) {
    return `${bytes} Bytes`;
  } else if (bytes < MB) {
    return `${(bytes / KB).toFixed(2)} KB`;
  } else if (bytes < GB) {
    return `${(bytes / MB).toFixed(2)} MB`;
  } else if (bytes < TB) {
    return `${(bytes / GB).toFixed(2)} GB`;
  } else {
    return `${(bytes / TB).toFixed(2)} TB`;
  }
}
