import { createClient } from '@supabase/supabase-js';
import { TeachingMaterial, MaterialSource, MaterialAttachment } from '@/types';
import { INITIAL_MATERIALS } from './mock-data';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ngreirksuoraurufzftn.supabase.co';
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'sb_publishable_Tj16Oq3f9BqbVj35Le-7bQ_avuh1PjD';

export function getSupabaseClient() {
  return createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false },
  });
}

const SOURCES_MARKER_START = '<!--EDU_MATERIAL_SOURCES_META:';
const SOURCES_MARKER_END = ':EDU_MATERIAL_SOURCES_META-->';

export interface MaterialMetadataPayload {
  sources?: MaterialSource[];
  attachments?: MaterialAttachment[];
  targetClassId?: string;
  targetClassName?: string;
  categoryId?: string;
  categoryName?: string;
  topic?: string;
  learningObjectives?: string[];
  pdfUrl?: string;
  videoUrl?: string;
  orderIndex?: number;
  status?: 'published' | 'draft' | 'archived';
  slug?: string;
}

/**
 * Encapsulate extended metadata (sources, attachments, class mapping)
 * safely into content_text so it's 100% durable in Supabase `materials` table.
 */
export function embedMetadataInContent(rawContent: string, meta: MaterialMetadataPayload): string {
  // Strip any existing metadata marker
  let cleanContent = rawContent;
  const startIdx = cleanContent.indexOf(SOURCES_MARKER_START);
  const endIdx = cleanContent.indexOf(SOURCES_MARKER_END);
  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    cleanContent = (
      cleanContent.slice(0, startIdx) +
      cleanContent.slice(endIdx + SOURCES_MARKER_END.length)
    ).trim();
  }

  const encoded = Buffer.from(JSON.stringify(meta)).toString('base64');
  return `${cleanContent}\n\n${SOURCES_MARKER_START}${encoded}${SOURCES_MARKER_END}`;
}

/**
 * Extract encapsulated metadata from content_text
 */
export function extractMetadataFromContent(contentWithMeta: string): {
  cleanContent: string;
  meta: MaterialMetadataPayload;
} {
  if (!contentWithMeta) {
    return { cleanContent: '', meta: {} };
  }

  const startIdx = contentWithMeta.indexOf(SOURCES_MARKER_START);
  const endIdx = contentWithMeta.indexOf(SOURCES_MARKER_END);

  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    const cleanContent = (
      contentWithMeta.slice(0, startIdx) +
      contentWithMeta.slice(endIdx + SOURCES_MARKER_END.length)
    ).trim();

    const base64Str = contentWithMeta.slice(
      startIdx + SOURCES_MARKER_START.length,
      endIdx
    );

    try {
      const parsed = JSON.parse(Buffer.from(base64Str, 'base64').toString('utf8'));
      return { cleanContent, meta: parsed || {} };
    } catch {
      return { cleanContent, meta: {} };
    }
  }

  return { cleanContent: contentWithMeta, meta: {} };
}

/**
 * Convert a Supabase `materials` row into full `TeachingMaterial` object.
 */
export function parseSupabaseMaterialRow(row: Record<string, unknown>): TeachingMaterial {
  const contentText = String(row.content_text || '');
  const { cleanContent, meta } = extractMetadataFromContent(contentText);

  const isPublished = Boolean(row.is_published);
  const status: 'published' | 'draft' | 'archived' =
    meta.status || (isPublished ? 'published' : 'draft');

  // Primary URL detection
  const fileUrl = (row.file_url ? String(row.file_url) : '') || meta.pdfUrl || '';
  const isPdf = fileUrl.toLowerCase().includes('.pdf') || fileUrl.includes('drive.google.com');

  const sources: MaterialSource[] = meta.sources || [];
  const attachments: MaterialAttachment[] = meta.attachments || [];

  return {
    id: String(row.id),
    title: String(row.title || 'Materi Tanpa Judul'),
    slug:
      String(row.slug || meta.slug || '') ||
      String(row.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    description: String(row.description || ''),
    categoryId: String(row.category_id || meta.categoryId || 'cat-dasar'),
    categoryName: String(row.category || meta.categoryName || 'Dasar-Dasar Agribisnis Tanaman'),
    targetClassId: String(row.class_target || row.target_class_id || meta.targetClassId || 'all'),
    targetClassName: meta.targetClassName || String(row.class_target || 'Semua Kelas'),
    topic: String(row.chapter || row.topic || meta.topic || row.title || ''),
    learningObjectives: Array.isArray(meta.learningObjectives) ? meta.learningObjectives : [],
    content: cleanContent,
    imageUrl: row.cover_url ? String(row.cover_url) : undefined,
    videoUrl: (row.video_url ? String(row.video_url) : '') || meta.videoUrl || undefined,
    pdfUrl: isPdf ? fileUrl : meta.pdfUrl,
    attachments,
    sources,
    orderIndex: Number(row.duration_minutes || meta.orderIndex || 1),
    status,
    createdAt: String(row.created_at || new Date().toISOString()),
    updatedAt: String(row.updated_at || new Date().toISOString()),
  };
}

/**
 * Fetch all materials from Supabase with graceful fallback to INITIAL_MATERIALS.
 */
export async function getMaterialsFromSupabase(): Promise<TeachingMaterial[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('materials')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !data || data.length === 0) {
    if (error) {
      console.warn('Supabase fetch materials warning:', error.message);
    }
    return INITIAL_MATERIALS;
  }

  const result: TeachingMaterial[] = data.map((row) => parseSupabaseMaterialRow(row as Record<string, unknown>));

  // Merge any INITIAL_MATERIALS that are not present in Supabase
  const existingIds = new Set(result.map((m) => m.id));
  for (const initMat of INITIAL_MATERIALS) {
    if (!existingIds.has(initMat.id)) {
      result.push(initMat);
    }
  }

  return result;
}

/**
 * Save (insert or update) material permanently in Supabase.
 * Checks and handles database errors strictly.
 */
export async function saveMaterialToSupabase(
  material: TeachingMaterial,
  authorName = 'Guru ATPH'
): Promise<{ success: boolean; material: TeachingMaterial; error?: string }> {
  const supabase = getSupabaseClient();

  // 1. Determine primary file_url and pdfUrl
  let primaryFileUrl = material.pdfUrl || '';
  if (!primaryFileUrl && material.sources && material.sources.length > 0) {
    const pdfSrc = material.sources.find((s) => s.sourceType === 'pdf');
    if (pdfSrc) {
      primaryFileUrl = pdfSrc.url;
    } else {
      primaryFileUrl = material.sources[0].url;
    }
  }

  // 2. Prepare encapsulated metadata
  const metadata: MaterialMetadataPayload = {
    sources: material.sources || [],
    attachments: material.attachments || [],
    targetClassId: material.targetClassId || 'all',
    targetClassName: material.targetClassName || 'Semua Kelas',
    categoryId: material.categoryId || '',
    categoryName: material.categoryName || 'Dasar-Dasar Agribisnis Tanaman',
    topic: material.topic || '',
    learningObjectives: material.learningObjectives || [],
    pdfUrl: material.pdfUrl || (primaryFileUrl.toLowerCase().includes('.pdf') ? primaryFileUrl : undefined),
    videoUrl: material.videoUrl,
    orderIndex: material.orderIndex || 1,
    status: material.status,
    slug: material.slug,
  };

  const durableContent = embedMetadataInContent(material.content || '', metadata);

  // 3. Build database record for Supabase `materials` table
  const nowIso = new Date().toISOString();
  const dbRecord: Record<string, unknown> = {
    id: material.id,
    title: material.title.trim(),
    subject: 'Dasar-Dasar Agribisnis Tanaman',
    category: material.categoryName || 'Dasar-Dasar Agribisnis Tanaman',
    class_target: material.targetClassId || 'all',
    chapter: material.topic || material.title,
    description: material.description || '',
    content_text: durableContent,
    file_url: primaryFileUrl || null,
    cover_url: material.imageUrl || null,
    duration_minutes: material.orderIndex || 45,
    is_published: material.status === 'published',
    author_name: authorName,
    updated_at: nowIso,
  };

  // 4. Execute upsert in Supabase
  const { data: upsertData, error: upsertErr } = await supabase
    .from('materials')
    .upsert(dbRecord, { onConflict: 'id' })
    .select();

  if (upsertErr) {
    console.error('Supabase save material failed:', upsertErr);
    return {
      success: false,
      material,
      error: `Gagal menyimpan ke database Supabase: ${upsertErr.message}`,
    };
  }

  // 5. Also upsert into `material_sources` table if it exists
  if (material.sources && material.sources.length > 0) {
    try {
      const sourceRows = material.sources.map((s, idx) => ({
        id: s.id || `src-${material.id}-${idx}`,
        material_id: material.id,
        title: s.title,
        url: s.url,
        source_type: s.sourceType,
        preview_url: s.previewUrl || null,
        file_size: s.fileSize || null,
        can_embed: s.canEmbed ?? true,
        order_index: s.orderIndex ?? idx,
        updated_at: nowIso,
      }));

      await supabase.from('material_sources').upsert(sourceRows, { onConflict: 'id' });
    } catch {
      // Table material_sources may not yet exist before migration 006,
      // but metadata is already 100% persisted safely in materials.content_text.
    }
  }

  const savedMaterial: TeachingMaterial = {
    ...material,
    updatedAt: nowIso,
  };

  return {
    success: true,
    material: savedMaterial,
  };
}

/**
 * Delete a material from Supabase
 */
export async function deleteMaterialFromSupabase(materialId: string): Promise<boolean> {
  const supabase = getSupabaseClient();

  const { error } = await supabase.from('materials').delete().eq('id', materialId);
  if (error) {
    console.error('Supabase delete material failed:', error);
    return false;
  }

  try {
    await supabase.from('material_sources').delete().eq('material_id', materialId);
  } catch {
    // Ignore if table does not exist
  }

  return true;
}
