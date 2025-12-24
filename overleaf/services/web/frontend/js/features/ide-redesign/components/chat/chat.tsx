import { useCallback, useMemo, useRef, useState } from 'react'
import { postJSON } from '@/infrastructure/fetch-json'
import { useEditorOpenDocContext } from '@/features/ide-react/context/editor-open-doc-context'
import { useEditorSelectionContext } from '@/shared/context/editor-selection-context'
import { useEditorViewContext } from '@/features/ide-react/context/editor-view-context'
import getMeta from '@/utils/meta'
import RailPanelHeader from '../rail/rail-panel-header'
import MaterialIcon from '@/shared/components/material-icon'

type AiTurn = {
  id: string
  role: 'user' | 'assistant'
  content: string
  insert?: string | null
  replace_selection?: string | null
}

export const ChatIndicator = () => null

export const ChatPane = () => {
  const projectId = getMeta('ol-project_id') as string | undefined
  const { openDocName } = useEditorOpenDocContext()
  const { editorSelection } = useEditorSelectionContext()
  const { view } = useEditorViewContext()

  const [turns, setTurns] = useState<AiTurn[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'InkVell AI (Claude) is ready. Ask anything about your document, then apply edits with **Insert** or **Replace selection**.',
      insert: null,
      replace_selection: null,
    },
  ])
  const [prompt, setPrompt] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const selectionRange = useMemo(() => {
    const sel = editorSelection?.main
    if (!sel) return null
    return { from: sel.from, to: sel.to, head: sel.head }
  }, [editorSelection])

  const selectionText = useMemo(() => {
    if (!view || !selectionRange) return ''
    const { from, to } = selectionRange
    if (from === to) return ''
    return view.state.sliceDoc(from, to)
  }, [view, selectionRange])

  const docText = useMemo(() => {
    if (!view) return ''
    // Bound size for safety
    const text = view.state.doc.toString()
    return text.length > 60_000 ? text.slice(0, 60_000) : text
  }, [view])

  const send = useCallback(async () => {
    const trimmed = prompt.trim()
    if (!trimmed || isLoading) return

    setError(null)
    setIsLoading(true)

    const userTurn: AiTurn = {
      id: `u_${Date.now()}`,
      role: 'user',
      content: trimmed,
    }
    setTurns(prev => [...prev, userTurn])
    setPrompt('')

    const controller = new AbortController()
    abortRef.current = controller

    try {
      const messages = [...turns, userTurn]
        .filter(t => t.role === 'user' || t.role === 'assistant')
        .map(t => ({ role: t.role, content: t.content }))

      const response = await postJSON<{
        reply_markdown: string
        insert: string | null
        replace_selection: string | null
      }>('/api/ai/chat', {
        signal: controller.signal,
        body: {
          messages,
          context: {
            projectId,
            docName: openDocName,
            selectionText,
            docText,
          },
        },
      })

      const assistantTurn: AiTurn = {
        id: `a_${Date.now()}`,
        role: 'assistant',
        content: response.reply_markdown,
        insert: response.insert,
        replace_selection: response.replace_selection,
      }

      setTurns(prev => [...prev, assistantTurn])
    } catch (e: any) {
      setError(e?.message || 'AI request failed')
    } finally {
      setIsLoading(false)
      abortRef.current = null
    }
  }, [prompt, isLoading, turns, projectId, openDocName, selectionText, docText])

  const stop = useCallback(() => {
    abortRef.current?.abort()
  }, [])

  const applyInsert = useCallback(
    (text: string) => {
      if (!view) return
      const head = selectionRange?.head ?? view.state.selection.main.head
      view.dispatch({ changes: { from: head, to: head, insert: text } })
      view.focus()
    },
    [view, selectionRange]
  )

  const applyReplaceSelection = useCallback(
    (text: string) => {
      if (!view) return
      const range = selectionRange ?? view.state.selection.main
      const from = 'from' in range ? range.from : view.state.selection.main.from
      const to = 'to' in range ? range.to : view.state.selection.main.to
      view.dispatch({ changes: { from, to, insert: text } })
      view.focus()
    },
    [view, selectionRange]
  )

  return (
    <div className="ai-panel">
      <RailPanelHeader title="InkVell AI" />

      <div className="ai-panel-body">
        <div className="ai-messages" role="log" aria-live="polite">
          {turns.map(turn => (
            <div
              key={turn.id}
              className={`ai-turn ai-turn-${turn.role}`}
              data-role={turn.role}
            >
              <div className="ai-turn-header">
                <span className="ai-turn-role">
                  {turn.role === 'user' ? 'You' : 'Claude'}
                </span>
              </div>

              <div className="ai-turn-content">
                <pre className="ai-turn-pre">{turn.content}</pre>
              </div>

              {turn.role === 'assistant' &&
                (turn.insert || turn.replace_selection) && (
                  <div className="ai-turn-actions">
                    {turn.insert ? (
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => applyInsert(turn.insert!)}
                      >
                        <MaterialIcon type="input" />
                        Insert
                      </button>
                    ) : null}

                    {turn.replace_selection ? (
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() =>
                          applyReplaceSelection(turn.replace_selection!)
                        }
                        disabled={!selectionRange || selectionRange.from === selectionRange.to}
                      >
                        <MaterialIcon type="edit" />
                        Replace selection
                      </button>
                    ) : null}
                  </div>
                )}
            </div>
          ))}
        </div>

        {error ? <div className="ai-error">{error}</div> : null}

        <div className="ai-composer">
          <textarea
            className="form-control ai-input"
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="Ask InkVell AI… (it can insert/replace your selection)"
            rows={3}
          />
          <div className="ai-composer-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={stop}
              disabled={!isLoading}
            >
              Stop
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={send}
              disabled={isLoading || !prompt.trim()}
            >
              {isLoading ? 'Thinking…' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
