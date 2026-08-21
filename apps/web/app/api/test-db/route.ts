import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    const db = await connectToDatabase();
    return NextResponse.json({
      success: true,
      message: 'Successfully connected to MongoDB Atlas Cluster! 🚀',
      readyState: db.connection.readyState
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
