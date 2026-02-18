/**
 * Supabase Storage Utilities
 * Handles file uploads for voice recordings, signatures, and documents
 */

import { supabase } from '@/lib/supabase'

const BUCKET_NAME = 'applications'

/**
 * Upload a blob to Supabase Storage
 * @param blob - The file blob to upload
 * @param path - The storage path (e.g., 'voice/APP-2026-123456.webm')
 * @returns The public URL of the uploaded file
 */
export async function uploadToStorage(
  blob: Blob,
  path: string
): Promise<string> {
  // Upload the file
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(path, blob, {
      cacheControl: '3600',
      upsert: true,
    })

  if (error) {
    console.error('Storage upload error:', error)
    throw new Error(`Failed to upload file: ${error.message}`)
  }

  // Get the public URL
  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(path)

  return urlData.publicUrl
}

/**
 * Upload voice recording
 * @param audioBlob - The audio blob from MediaRecorder
 * @param applicationNumber - The application number for file naming
 * @returns The public URL of the uploaded audio
 */
export async function uploadVoiceRecording(
  audioBlob: Blob,
  applicationNumber: string
): Promise<string> {
  const timestamp = Date.now()
  const path = `voice/${applicationNumber}-${timestamp}.webm`
  return uploadToStorage(audioBlob, path)
}

/**
 * Upload signature image
 * @param signatureDataUrl - The base64 data URL from canvas
 * @param applicationNumber - The application number for file naming
 * @returns The public URL of the uploaded signature
 */
export async function uploadSignature(
  signatureDataUrl: string,
  applicationNumber: string
): Promise<string> {
  // Convert data URL to blob
  const response = await fetch(signatureDataUrl)
  const blob = await response.blob()

  const timestamp = Date.now()
  const path = `signatures/${applicationNumber}-${timestamp}.png`
  return uploadToStorage(blob, path)
}

/**
 * Upload document (ID, proof of address, etc.)
 * @param dataUrl - The base64 data URL
 * @param type - Document type (id, address, selfie)
 * @param applicationNumber - The application number for file naming
 * @returns The public URL of the uploaded document
 */
export async function uploadDocument(
  dataUrl: string,
  type: 'id' | 'address' | 'selfie',
  applicationNumber: string
): Promise<string> {
  // Convert data URL to blob
  const response = await fetch(dataUrl)
  const blob = await response.blob()

  const timestamp = Date.now()
  const extension = blob.type.includes('pdf') ? 'pdf' : 'jpg'
  const path = `documents/${type}/${applicationNumber}-${timestamp}.${extension}`
  return uploadToStorage(blob, path)
}

/**
 * Generate a temporary application number for uploads before submission
 * @returns A temporary application number
 */
export function generateTempApplicationNumber(): string {
  return `TEMP-${Date.now()}`
}
