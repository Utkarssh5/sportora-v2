import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

const MAX_FILE_SIZE = 50 * 1024 * 1024;

const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'video/mp4',
  'video/quicktime',
  'video/webm',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
]);

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;

    if (!accessToken) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized: Please login first',
        },
        { status: 401 },
      );
    }

    const formData = await req.formData();
    const files = formData.getAll('files').filter(
      (value): value is File => value instanceof File,
    );

    if (files.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Please attach at least one completion proof.',
        },
        { status: 400 },
      );
    }

    if (files.length > 5) {
      return NextResponse.json(
        {
          success: false,
          error: 'You can attach a maximum of 5 proof files.',
        },
        { status: 400 },
      );
    }

    const uploadDir = path.join(
      process.cwd(),
      'public',
      'uploads',
      'crew-completion',
    );

    await mkdir(uploadDir, { recursive: true });

    const uploadedFiles: Array<{
      url: string;
      name: string;
      type: string;
      size: number;
    }> = [];

    for (const file of files) {
      if (!ALLOWED_TYPES.has(file.type)) {
        return NextResponse.json(
          {
            success: false,
            error: `Unsupported file type: ${file.name}`,
          },
          { status: 400 },
        );
      }

      if (file.size <= 0 || file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          {
            success: false,
            error: `${file.name} must be between 1 byte and 50 MB.`,
          },
          { status: 400 },
        );
      }

      const extension = path.extname(file.name).toLowerCase();
      const filename = `${randomUUID()}${extension}`;
      const filepath = path.join(uploadDir, filename);

      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(filepath, buffer);

      uploadedFiles.push({
        url: `/uploads/crew-completion/${filename}`,
        name: file.name,
        type: file.type,
        size: file.size,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Completion evidence uploaded successfully.',
      data: uploadedFiles,
    });
  } catch (error) {
    console.error('Crew completion proof upload error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Unable to upload completion evidence.',
      },
      { status: 500 },
    );
  }
}
