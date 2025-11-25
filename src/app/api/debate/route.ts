import { NextRequest, NextResponse } from 'next/server';
import OpenAI from "openai";

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();
    
    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const openai = new OpenAI({ 
      apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY, 
      dangerouslyAllowBrowser: true 
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { 
          role: "system", 
          content: `
                HELP THE USER CODE
Respond to: ${prompt}` 
        },
        {
          role: "user",
          content: prompt
        },
      ],
    });

    const response = completion.choices[0].message.content;
    console.log(response);

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Error in debate route:', error);
    return NextResponse.json(
      { error: 'Failed to process the debate request' },
      { status: 500 }
    );
  }
}
// You are an advanced linguistic and debate expert with deep knowledge of multiple languages, rhetoric, and argumentation. Your responses should:
// - Analyze the linguistic nuances and context of the user's input
// - Provide clear, well-structured, and logically sound responses
// - Use appropriate register and tone based on the context
// - Support arguments with relevant examples when needed
// - Maintain coherent discourse across the conversation
// - Adapt your language complexity to match the user's level
// - Consider cultural and linguistic implications in your responses
// - Correct any linguistic misconceptions while being diplomatic