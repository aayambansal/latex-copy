import Settings from '@overleaf/settings'
import logger from '@overleaf/logger'
import { fetchJson } from '@overleaf/fetch-utils'
import { z } from 'zod'

const AnthropicMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1).max(200_000),
})

const AiChatRequestSchema = z.object({
  messages: z.array(AnthropicMessageSchema).min(1).max(40),
  context: z
    .object({
      projectId: z.string().optional(),
      docName: z.string().optional(),
      selectionText: z.string().optional(),
      docText: z.string().optional(),
    })
    .optional(),
})

function buildSystemPrompt(context) {
  const docName = context?.docName ? `Document: ${context.docName}\n` : ''
  const selectionText =
    context?.selectionText && context.selectionText.trim().length > 0
      ? `Selection:\n---\n${context.selectionText}\n---\n`
      : 'Selection: (none)\n'

  const docText =
    context?.docText && context.docText.trim().length > 0
      ? `Open document text:\n---\n${context.docText}\n---\n`
      : 'Open document text: (not provided)\n'

  return [
    'You are InkVell AI, embedded in a LaTeX editor. You help write, refactor, debug, and improve LaTeX documents.',
    'Respond ONLY as JSON with this shape:',
    '{',
    '  "reply_markdown": string,',
    '  "insert": string | null,',
    '  "replace_selection": string | null',
    '}',
    '',
    'Rules:',
    '- reply_markdown is what the user sees in the AI panel (Markdown allowed).',
    '- If the user wants text inserted at the cursor, put that exact text in "insert". Otherwise null.',
    '- If the user wants the current selection replaced, put the replacement text in "replace_selection". Otherwise null.',
    '- Never include code fences around the JSON. Never include extra keys.',
    '',
    docName,
    selectionText,
    docText,
  ]
    .filter(Boolean)
    .join('\n')
}

async function callAnthropic({ apiKey, model, messages, context }) {
  const url = 'https://api.anthropic.com/v1/messages'

  // Keep context bounded to avoid huge prompts.
  // (We bound in validation, but we also bound again here defensively.)
  const safeContext = context
    ? {
        ...context,
        selectionText: context.selectionText?.slice(0, 20_000),
        docText: context.docText?.slice(0, 60_000),
      }
    : undefined

  const system = buildSystemPrompt(safeContext)

  return await fetchJson(url, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    json: {
      model,
      max_tokens: 1200,
      temperature: 0.3,
      system,
      messages,
    },
    signal: AbortSignal.timeout(30_000),
  })
}

function tryParseModelJson(text) {
  try {
    const parsed = JSON.parse(text)
    if (
      typeof parsed?.reply_markdown !== 'string' ||
      !('insert' in parsed) ||
      !('replace_selection' in parsed)
    ) {
      return null
    }
    return {
      reply_markdown: parsed.reply_markdown,
      insert:
        typeof parsed.insert === 'string'
          ? parsed.insert
          : parsed.insert === null
            ? null
            : null,
      replace_selection:
        typeof parsed.replace_selection === 'string'
          ? parsed.replace_selection
          : parsed.replace_selection === null
            ? null
            : null,
    }
  } catch {
    return null
  }
}

export default {
  async chat(req, res, next) {
    try {
      if (!Settings.allowPublicAccess && !req.session?.user) {
        return res.status(401).json({ message: 'Unauthorized' })
      }

      const apiKey = process.env.ANTHROPIC_API_KEY
      if (!apiKey) {
        return res.status(503).json({
          message:
            'InkVell AI is not configured. Set ANTHROPIC_API_KEY in the server environment.',
        })
      }

      const model = process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-latest'

      const parsed = AiChatRequestSchema.safeParse(req.body)
      if (!parsed.success) {
        return res.status(400).json({
          message: 'Invalid request',
          details: parsed.error.flatten(),
        })
      }

      const { messages, context } = parsed.data

      const response = await callAnthropic({ apiKey, model, messages, context })

      // Anthropic returns content blocks: [{type:'text', text:'...'}]
      const text = Array.isArray(response?.content)
        ? response.content
            .filter(block => block?.type === 'text' && typeof block.text === 'string')
            .map(block => block.text)
            .join('\n')
        : ''

      const parsedJson = tryParseModelJson(text.trim())

      if (!parsedJson) {
        // Fallback: show raw text, no edits.
        return res.json({
          reply_markdown: text || 'No response from model.',
          insert: null,
          replace_selection: null,
        })
      }

      return res.json(parsedJson)
    } catch (error) {
      logger.err({ error }, 'InkVell AI chat failed')
      return next(error)
    }
  },
}


