function visit(node, callback) {
  if (node.type === "code") callback(node);
  if (Array.isArray(node.children)) node.children.forEach((child) => visit(child, callback));
}

export default function codeMeta() {
  return (tree) => {
    visit(tree, (node) => {
      const match = node.meta?.match(/title=["']([^"']+)["']/);
      if (match)
        node.data = {
          ...node.data,
          hProperties: { ...node.data?.hProperties, "data-code-title": match[1] },
        };
    });
  };
}
