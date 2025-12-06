// src/app/api/upload/image/route.js
import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { requireRole, ROLES } from '@/lib/roles';

export async function POST(req) {
  // Require auth: STAF or ADMIN
  const { ok } = await requireRole(req, [ROLES.STAF, ROLES.ADMIN]);
  if (!ok) {
    return NextResponse.json({
      success: false,
      message: 'Unauthorized'
    }, { status: 403 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({
        success: false,
        message: 'No file uploaded'
      }, { status: 400 });
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid file type. Only JPG, PNG, and WEBP are allowed.'
      }, { status: 400 });
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({
        success: false,
        message: 'File too large. Maximum size is 5MB.'
      }, { status: 400 });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    const extension = file.name.split('.').pop();
    const filename = `cover_${timestamp}_${random}.${extension}`;

    // Create upload directory if not exists
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'covers');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Save file
    const filepath = path.join(uploadDir, filename);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Return URL (relative to public folder)
    const url = `/uploads/covers/${filename}`;

    console.log('✅ Image uploaded:', filename);

    return NextResponse.json({
      success: true,
      url: url,
      filename: filename,
      size: file.size,
      type: file.type
    });

  } catch (error) {
    console.error('❌ Upload error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to upload file',
      error: error.message
    }, { status: 500 });
  }
}

// DELETE endpoint untuk hapus gambar
export async function DELETE(req) {
  const { ok } = await requireRole(req, [ROLES.STAF, ROLES.ADMIN]);
  if (!ok) {
    return NextResponse.json({
      success: false,
      message: 'Unauthorized'
    }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const filename = searchParams.get('filename');

    if (!filename) {
      return NextResponse.json({
        success: false,
        message: 'Filename is required'
      }, { status: 400 });
    }

    // Delete file
    const filepath = path.join(process.cwd(), 'public', 'uploads', 'covers', filename);

    if (existsSync(filepath)) {
      const { unlink } = await import('fs/promises');
      await unlink(filepath);
      console.log('✅ Image deleted:', filename);

      return NextResponse.json({
        success: true,
        message: 'Image deleted successfully'
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'File not found'
      }, { status: 404 });
    }

  } catch (error) {
    console.error('❌ Delete error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to delete file',
      error: error.message
    }, { status: 500 });
  }
}