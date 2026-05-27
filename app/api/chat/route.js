import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(request) {
  try {
    const { messages, systemPrompt } = await request.json()

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: systemPrompt,
    })

    // Build chat history (exclude last user message)
    const history = messages.slice(0, -1).filter(m => m.role !== 'assistant' || messages.indexOf(m) !== 0).map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }))

    const chat = model.startChat({ history })

    // Send the last user message
    const lastMessage = messages[messages.length - 1]
    const result = await chat.sendMessage(lastMessage.content)
    const reply = result.response.text()

    return Response.json({ reply })
  } catch (error) {
    console.error('Chat API error:', error)
    return Response.json(
      { error: 'Failed to get response' },
      { status: 500 }
    )
  }
}