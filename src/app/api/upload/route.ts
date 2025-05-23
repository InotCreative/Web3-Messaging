import { NextResponse } from 'next/server';
import { Web3Storage } from 'web3.storage';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const client = new Web3Storage({
      token: process.env.WEB3_STORAGE_TOKEN || '',
    });

    const cid = await client.put([file]);
    const ipfsHash = `ipfs://${cid}/${file.name}`;

    return NextResponse.json({ ipfsHash });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Error uploading file' },
      { status: 500 }
    );
  }
} 