import { supabase } from "./supabase";

// ─── Bucket names ─────────────────────────────────────────────────────────────
// Single source of truth — always use these constants, never hardcode strings.

export const BUCKETS = {
  // Products & inventory
  productImages: "product-images",   // Product listing photos

  // Seller / farm profile
  sellerLogos:   "seller-logos",     // Farm logo (was: farm-logos)
  sellerBanners: "seller-banners",   // Farm hero banner (was: farm-banners)
  farmImages:    "farm-images",      // General farm photography (was: farm-images)

  // Content
  postImages:    "post-images",      // Farm blog / post cover images

  // Customer
  profileAvatars: "profile-avatars", // Customer profile pictures (was: user-avatars)

  // Reviews & platform
  reviewImages:   "review-images",   // Photos attached to product reviews
  platformAssets: "platform-assets", // Logos, banners, static platform media
} as const;

export type BucketName = typeof BUCKETS[keyof typeof BUCKETS];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Upload a file to a storage bucket.
 * Returns the public URL on success.
 *
 * @param bucket  - One of the BUCKETS constants
 * @param path    - Storage path, e.g. "{userId}/avatar.jpg"
 * @param file    - File or Blob to upload
 * @param options - Optional upsert / content-type overrides
 */
export async function uploadFile(
  bucket: BucketName,
  path: string,
  file: File | Blob,
  options: { upsert?: boolean; contentType?: string } = {}
): Promise<string> {
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      upsert: options.upsert ?? true,
      contentType: options.contentType,
    });

  if (error) throw error;

  return getPublicUrl(bucket, path);
}

/**
 * Get the public URL for a stored file.
 */
export function getPublicUrl(bucket: BucketName, path: string): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Delete a file from storage.
 */
export async function deleteFile(bucket: BucketName, path: string): Promise<void> {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw error;
}

/**
 * Delete multiple files from storage.
 */
export async function deleteFiles(bucket: BucketName, paths: string[]): Promise<void> {
  if (paths.length === 0) return;
  const { error } = await supabase.storage.from(bucket).remove(paths);
  if (error) throw error;
}

// ─── Typed upload shortcuts ───────────────────────────────────────────────────

export async function uploadProductImage(sellerId: string, file: File): Promise<string> {
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${sellerId}/${Date.now()}.${ext}`;
  return uploadFile(BUCKETS.productImages, path, file);
}

export async function uploadSellerLogo(sellerId: string, file: File): Promise<string> {
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${sellerId}/logo.${ext}`;
  return uploadFile(BUCKETS.sellerLogos, path, file, { upsert: true });
}

export async function uploadSellerBanner(sellerId: string, file: File): Promise<string> {
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${sellerId}/banner.${ext}`;
  return uploadFile(BUCKETS.sellerBanners, path, file, { upsert: true });
}

export async function uploadFarmImage(sellerId: string, file: File): Promise<string> {
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${sellerId}/${Date.now()}.${ext}`;
  return uploadFile(BUCKETS.farmImages, path, file);
}

export async function uploadPostImage(sellerId: string, file: File): Promise<string> {
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${sellerId}/${Date.now()}.${ext}`;
  return uploadFile(BUCKETS.postImages, path, file);
}

export async function uploadProfileAvatar(userId: string, file: File): Promise<string> {
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${userId}/avatar.${ext}`;
  return uploadFile(BUCKETS.profileAvatars, path, file, { upsert: true });
}

export async function uploadReviewImage(userId: string, file: File): Promise<string> {
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${userId}/${Date.now()}.${ext}`;
  return uploadFile(BUCKETS.reviewImages, path, file);
}
