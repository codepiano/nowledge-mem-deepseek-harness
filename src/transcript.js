/** DSH user-role rows include injected context; only `user` is human input. */
export function isHumanInput(message, excludedUserRpcIdPattern) {
  return message?.source?.kind === 'user'
    && !(typeof message.source.rpcId === 'string' && excludedUserRpcIdPattern?.test(message.source.rpcId))
}

/**
 * Export the conversation, not the model execution trace. Tool-call steps can
 * contain narration as well as arguments; neither is a completed reply.
 * Use structured tags, never text patterns that could erase a real question.
 */
export function transcriptMessage(event, excludedUserRpcIdPattern) {
  if (event.type === 'user/message') return isHumanInput(event.data, excludedUserRpcIdPattern) ? event.data : undefined
  if (event.type !== 'assistant/message') return undefined
  const message = event.data.message
  if (message.content.some(block => block.type === 'tool-call')) return undefined
  return message
}

export function transcriptText(message) {
  return message.content.map(block => {
    if (block.type === 'text') return block.text
    if (block.type === 'image') return '[image attachment]'
    return ''
  }).filter(text => text.trim() !== '').join('\n')
}
