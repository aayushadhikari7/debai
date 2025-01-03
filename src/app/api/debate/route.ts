import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { prompt } = body;

  const response = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama3.1',
      prompt: `You are a debate assistant. Respond logically and persuasively.  User: ${prompt}`,
      stream: false,
    }),
  });

  if (!response.ok) {
    return NextResponse.json({ response: 'Error generating response.' }, { status: 500 });
  }

  const data = await response.json();
  return NextResponse.json({ response: data.response });
}