export function blocksToTiptapDoc(blocks: any[]): any {
	const tiptapContent: any[] = []

	if (Array.isArray(blocks)) {
		for (const block of blocks) {
			if (!block || typeof block !== 'object') continue
			switch (block.type) {
				case 'heading': {
					const text = typeof block.text === 'string' ? block.text : ''
					const textAlign = block.align === 'center' || block.align === 'right' ? block.align : 'left'
					tiptapContent.push({
						type: 'heading',
						attrs: { level: 2, textAlign },
						content: text ? [{ type: 'text', text }] : undefined,
					})
					break
				}
				case 'paragraph': {
					const text = typeof block.text === 'string' ? block.text : ''
					const textAlign = block.align === 'center' || block.align === 'right' ? block.align : 'left'
					tiptapContent.push({
						type: 'paragraph',
						attrs: { textAlign },
						content: text ? [{ type: 'text', text }] : undefined,
					})
					break
				}
				case 'code': {
					const text = typeof block.text === 'string' ? block.text : ''
					tiptapContent.push({
						type: 'codeBlock',
						content: text ? [{ type: 'text', text }] : undefined,
					})
					break
				}
				case 'image': {
					const src = typeof block.src === 'string' ? block.src : ''
					const alt = typeof block.alt === 'string' ? block.alt : ''
					if (src) {
						tiptapContent.push({
							type: 'image',
							attrs: { src, alt },
						})
					}
					break
				}
				default: {
					// Неизвестный тип — сохраняем как параграф с текстовым представлением, чтобы ничего не потерять
					try {
						const text = typeof (block as any).text === 'string' ? (block as any).text : JSON.stringify(block)
						tiptapContent.push({ type: 'paragraph', content: text ? [{ type: 'text', text }] : undefined })
					} catch {
						tiptapContent.push({ type: 'paragraph' })
					}
					break
				}
			}
		}
	}

	return {
		type: 'doc',
		content: tiptapContent.length > 0 ? tiptapContent : [{ type: 'paragraph' }],
	}
}

export function loadInitialTiptapDoc(content: any): any {
	if (content?.type === 'tiptap' && content.doc) return content.doc
	if (content?.type === 'doc' && Array.isArray(content.blocks)) return blocksToTiptapDoc(content.blocks)
	return { type: 'doc', content: [{ type: 'paragraph' }] }
}
