import dns from 'dns';
import { promisify } from 'util';

const dnsLookup = promisify(dns.lookup);

export type DetectedSourceType = 'pdf' | 'document' | 'youtube' | 'gdrive' | 'webpage';

export interface UrlVerificationResult {
  isValid: boolean;
  normalizedUrl: string;
  sourceType: DetectedSourceType;
  titleSuggestion: string;
  previewUrl?: string;
  canEmbed: boolean;
  fileSize?: string;
  mimeType?: string;
  statusMessage: string;
  warning?: string;
}

/**
 * Check whether an IP string is private, loopback, link-local, or cloud metadata.
 * Strictly prevents Server-Side Request Forgery (SSRF).
 */
export function isPrivateIp(ip: string): boolean {
  // IPv4 checks
  if (ip === '127.0.0.1' || ip === '0.0.0.0' || ip === 'localhost') return true;
  if (ip.startsWith('127.')) return true;

  // 10.0.0.0/8
  if (ip.startsWith('10.')) return true;

  // 172.16.0.0/12 (172.16.0.0 - 172.31.255.255)
  const parts = ip.split('.').map(Number);
  if (parts.length === 4) {
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
    // 192.168.0.0/16
    if (parts[0] === 192 && parts[1] === 168) return true;
    // 169.254.0.0/16 (Link-local & AWS/GCP/Azure metadata 169.254.169.254)
    if (parts[0] === 169 && parts[1] === 254) return true;
    // 100.64.0.0/10 (Carrier grade NAT)
    if (parts[0] === 100 && parts[1] >= 64 && parts[1] <= 127) return true;
  }

  // IPv6 checks
  const lowerIp = ip.toLowerCase();
  if (lowerIp === '::1' || lowerIp === '::') return true;
  if (lowerIp.startsWith('fe80:')) return true; // Link-local
  if (lowerIp.startsWith('fc') || lowerIp.startsWith('fd')) return true; // Unique local address (fc00::/7)

  return false;
}

/**
 * Validate URL structure and block dangerous protocols or local hosts.
 */
export function validateUrlSyntax(rawUrl: string): { ok: boolean; error?: string; url?: URL } {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { ok: false, error: 'URL tidak boleh kosong.' };
  }

  const trimmed = rawUrl.trim();

  // Explicitly reject dangerous or malicious schemes
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('data:') ||
    lower.startsWith('file:') ||
    lower.startsWith('vbscript:') ||
    lower.startsWith('blob:')
  ) {
    return { ok: false, error: 'Protokol URL tidak diizinkan demi keamanan.' };
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { ok: false, error: 'Format URL tidak valid. Pastikan menyertakan http:// atau https://.' };
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { ok: false, error: 'Hanya protokol HTTP atau HTTPS yang didukung.' };
  }

  const hostname = parsed.hostname.toLowerCase();

  // Block localhost, .local, internal domains
  if (
    hostname === 'localhost' ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal') ||
    hostname.endsWith('.lan')
  ) {
    return { ok: false, error: 'URL tujuan lokal/internal tidak diizinkan.' };
  }

  // Direct IP check
  if (isPrivateIp(hostname)) {
    return { ok: false, error: 'Alamat IP privat atau jaringan internal tidak diizinkan.' };
  }

  return { ok: true, url: parsed };
}

/**
 * Extract YouTube Video ID and construct safe privacy-enhanced embed URL
 */
export function parseYouTubeUrl(url: URL): { isYouTube: boolean; videoId?: string; embedUrl?: string } {
  const host = url.hostname.toLowerCase();
  const isYt =
    host === 'youtube.com' ||
    host === 'www.youtube.com' ||
    host === 'm.youtube.com' ||
    host === 'youtu.be' ||
    host === 'www.youtube-nocookie.com';

  if (!isYt) return { isYouTube: false };

  let videoId: string | undefined;

  if (host === 'youtu.be') {
    videoId = url.pathname.slice(1).split('/')[0]?.split('?')[0];
  } else if (url.pathname.startsWith('/watch')) {
    videoId = url.searchParams.get('v') || undefined;
  } else if (url.pathname.startsWith('/shorts/')) {
    videoId = url.pathname.replace('/shorts/', '').split('/')[0]?.split('?')[0];
  } else if (url.pathname.startsWith('/embed/')) {
    videoId = url.pathname.replace('/embed/', '').split('/')[0]?.split('?')[0];
  }

  // Sanitize YouTube video ID (must be standard alphanumeric, hyphen, underscore, typically 11 chars)
  if (videoId && /^[a-zA-Z0-9_-]{10,14}$/.test(videoId)) {
    return {
      isYouTube: true,
      videoId,
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}`,
    };
  }

  return { isYouTube: true };
}

/**
 * Extract Google Drive file/doc ID and construct safe preview URL
 */
export function parseGoogleDriveUrl(url: URL): {
  isGDrive: boolean;
  fileId?: string;
  previewUrl?: string;
  docType?: 'file' | 'document' | 'presentation' | 'spreadsheets';
} {
  const host = url.hostname.toLowerCase();
  const isDrive = host === 'drive.google.com' || host === 'docs.google.com';

  if (!isDrive) return { isGDrive: false };

  const path = url.pathname;
  let fileId: string | undefined;
  let docType: 'file' | 'document' | 'presentation' | 'spreadsheets' = 'file';

  // Pattern: /file/d/{id}
  const fileMatch = path.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch) {
    fileId = fileMatch[1];
    docType = 'file';
  }

  // Pattern: /document/d/{id}
  const docMatch = path.match(/\/document\/d\/([a-zA-Z0-9_-]+)/);
  if (docMatch) {
    fileId = docMatch[1];
    docType = 'document';
  }

  // Pattern: /presentation/d/{id}
  const presMatch = path.match(/\/presentation\/d\/([a-zA-Z0-9_-]+)/);
  if (presMatch) {
    fileId = presMatch[1];
    docType = 'presentation';
  }

  // Pattern: /spreadsheets/d/{id}
  const sheetMatch = path.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
  if (sheetMatch) {
    fileId = sheetMatch[1];
    docType = 'spreadsheets';
  }

  // Pattern: ?id={id}
  if (!fileId && url.searchParams.has('id')) {
    const rawId = url.searchParams.get('id') || '';
    if (/^[a-zA-Z0-9_-]{15,60}$/.test(rawId)) {
      fileId = rawId;
    }
  }

  if (fileId) {
    let previewUrl = `https://drive.google.com/file/d/${fileId}/preview`;
    if (docType === 'document') {
      previewUrl = `https://docs.google.com/document/d/${fileId}/preview`;
    } else if (docType === 'presentation') {
      previewUrl = `https://docs.google.com/presentation/d/${fileId}/preview`;
    } else if (docType === 'spreadsheets') {
      previewUrl = `https://docs.google.com/spreadsheets/d/${fileId}/preview`;
    }

    return {
      isGDrive: true,
      fileId,
      previewUrl,
      docType,
    };
  }

  return { isGDrive: true };
}

/**
 * Format raw bytes into human readable string (KB, MB)
 */
export function formatContentLength(bytes: number): string {
  if (bytes <= 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Full server-side URL verification with SSRF prevention and source categorization.
 */
export async function verifyMaterialUrlServerSide(rawUrl: string): Promise<UrlVerificationResult> {
  const syntax = validateUrlSyntax(rawUrl);
  if (!syntax.ok || !syntax.url) {
    return {
      isValid: false,
      normalizedUrl: rawUrl,
      sourceType: 'webpage',
      titleSuggestion: '',
      canEmbed: false,
      statusMessage: syntax.error || 'URL tidak valid.',
    };
  }

  const url = syntax.url;
  const hostname = url.hostname;

  // 1. DNS resolving check for SSRF
  try {
    const resolved = await dnsLookup(hostname);
    if (resolved && isPrivateIp(resolved.address)) {
      return {
        isValid: false,
        normalizedUrl: url.toString(),
        sourceType: 'webpage',
        titleSuggestion: '',
        canEmbed: false,
        statusMessage: 'Akses ke alamat IP jaringan internal ditolak.',
      };
    }
  } catch (dnsErr) {
    // If DNS cannot be resolved, the domain does not exist or is unreachable
    return {
      isValid: false,
      normalizedUrl: url.toString(),
      sourceType: 'webpage',
      titleSuggestion: '',
      canEmbed: false,
      statusMessage: `Domain ${hostname} tidak dapat ditemukan atau tidak terdaftar.`,
    };
  }

  // 2. Check for YouTube
  const yt = parseYouTubeUrl(url);
  if (yt.isYouTube) {
    if (yt.videoId && yt.embedUrl) {
      return {
        isValid: true,
        normalizedUrl: url.toString(),
        sourceType: 'youtube',
        titleSuggestion: `Video YouTube (${yt.videoId})`,
        previewUrl: yt.embedUrl,
        canEmbed: true,
        statusMessage: 'Tautan video YouTube valid dan siap disematkan.',
      };
    }
    return {
      isValid: true,
      normalizedUrl: url.toString(),
      sourceType: 'youtube',
      titleSuggestion: 'Video YouTube',
      canEmbed: false,
      statusMessage: 'Tautan YouTube dikenali (akan dibuka melalui tombol Buka di YouTube).',
    };
  }

  // 3. Check for Google Drive
  const gdrive = parseGoogleDriveUrl(url);
  if (gdrive.isGDrive) {
    if (gdrive.fileId && gdrive.previewUrl) {
      return {
        isValid: true,
        normalizedUrl: url.toString(),
        sourceType: 'gdrive',
        titleSuggestion: `Dokumen Google Drive (${gdrive.docType || 'File'})`,
        previewUrl: gdrive.previewUrl,
        canEmbed: true,
        statusMessage: 'Tautan Google Drive valid dengan penampil pratinjau.',
        warning: 'Pastikan izin berbagi file di Google Drive diatur ke "Siapa saja yang memiliki tautan" agar siswa dapat membukanya.',
      };
    }
    return {
      isValid: true,
      normalizedUrl: url.toString(),
      sourceType: 'gdrive',
      titleSuggestion: 'Dokumen Google Drive',
      canEmbed: false,
      statusMessage: 'Tautan Google Drive dikenali.',
      warning: 'Pastikan akses berbagi file terbuka untuk siswa.',
    };
  }

  // 4. Check for direct PDF extension in path
  const pathLower = url.pathname.toLowerCase();
  const isPdfExtension = pathLower.endsWith('.pdf');
  const filename = pathLower.split('/').filter(Boolean).pop() || '';
  const cleanTitle = filename.replace(/\.pdf$/i, '').replace(/[-_+]/g, ' ');

  // 5. Limited HTTP check to determine Content-Type & Embedding Permissions
  let detectedType: DetectedSourceType = isPdfExtension ? 'pdf' : 'webpage';
  let canEmbed = isPdfExtension; // PDFs are generally embeddable in standard browsers unless blocked
  let fileSizeStr = '';
  let contentType = '';
  let statusMessage = 'Tautan URL valid dan siap digunakan.';

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    // Try HEAD first with no-credentials
    let response = await fetch(url.toString(), {
      method: 'HEAD',
      headers: {
        'User-Agent': 'EduATPH-LinkVerifier/1.0',
        Accept: '*/*',
      },
      redirect: 'follow',
      signal: controller.signal,
    }).catch(() => null);

    // If HEAD failed with 405 or 403, try limited GET (range 0-1024)
    if (!response || response.status === 405 || response.status === 403) {
      response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'User-Agent': 'EduATPH-LinkVerifier/1.0',
          Range: 'bytes=0-1024',
          Accept: '*/*',
        },
        redirect: 'follow',
        signal: controller.signal,
      }).catch(() => null);
    }

    clearTimeout(timeout);

    if (response) {
      contentType = (response.headers.get('content-type') || '').toLowerCase();
      const contentLength = Number(response.headers.get('content-length') || '0');
      if (contentLength > 0) {
        fileSizeStr = formatContentLength(contentLength);
      }

      const xFrameOptions = (response.headers.get('x-frame-options') || '').toLowerCase();
      const csp = (response.headers.get('content-security-policy') || '').toLowerCase();

      // Check if site explicitly blocks framing
      if (
        xFrameOptions.includes('deny') ||
        xFrameOptions.includes('sameorigin') ||
        csp.includes('frame-ancestors')
      ) {
        canEmbed = false;
      }

      if (contentType.includes('application/pdf')) {
        detectedType = 'pdf';
        canEmbed = true; // browser built-in PDF viewer
        statusMessage = `Dokumen PDF terverifikasi (${fileSizeStr || 'tersedia'}).`;
      } else if (
        contentType.includes('word') ||
        contentType.includes('officedocument') ||
        contentType.includes('excel') ||
        contentType.includes('powerpoint')
      ) {
        detectedType = 'document';
        statusMessage = 'Dokumen perkantoran/modul digital.';
      } else if (contentType.includes('text/html')) {
        detectedType = 'webpage';
        statusMessage = canEmbed
          ? 'Halaman web aktif (dapat dibuka siswa).'
          : 'Halaman web aktif (akan dibuka langsung di tab baru).';
      }
    }
  } catch {
    // Network timeout or blocked by target firewall: does not mean URL is invalid.
    statusMessage = 'Tautan URL valid (pemeriksaan server selesai, dapat dibuka siswa).';
  }

  const titleSuggestion = cleanTitle
    ? cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1)
    : `${hostname} (${detectedType.toUpperCase()})`;

  return {
    isValid: true,
    normalizedUrl: url.toString(),
    sourceType: detectedType,
    titleSuggestion,
    previewUrl: detectedType === 'pdf' ? url.toString() : undefined,
    canEmbed,
    fileSize: fileSizeStr,
    mimeType: contentType,
    statusMessage,
  };
}
