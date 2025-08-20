// Normalize Editor.js body data to ensure tables are single blocks with 2D content
export function normalizeEditorJsBody(body) {
  if (!body || !Array.isArray(body.blocks)) return body;

  const to2D = (content) => {
    if (!Array.isArray(content)) return [];
    if (Array.isArray(content[0])) return content; // already 2D
    return [content]; // wrap single row
  };

  const mergedBlocks = [];
  let pendingTable = null;

  for (const block of body.blocks) {
    if (block?.type === "table") {
      const content2D = to2D(block?.data?.content);
      const withHeadings = !!block?.data?.withHeadings;

      if (pendingTable) {
        pendingTable.data = pendingTable.data || {};
        const existing = to2D(pendingTable.data.content);
        pendingTable.data.content = [...existing, ...content2D];
        if (withHeadings) pendingTable.data.withHeadings = true;
      } else {
        pendingTable = {
          ...block,
          data: {
            ...(block.data || {}),
            content: content2D,
          },
        };
        if (withHeadings) pendingTable.data.withHeadings = true;
      }
      continue;
    }

    if (pendingTable) {
      mergedBlocks.push(pendingTable);
      pendingTable = null;
    }
    mergedBlocks.push(block);
  }

  if (pendingTable) mergedBlocks.push(pendingTable);

  return { ...body, blocks: mergedBlocks };
}
