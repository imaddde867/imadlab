export const expandTagVariants = (tags: string[]) => {
  const output = new Set<string>();

  for (const raw of tags) {
    if (!raw) continue;
    const tag = raw.trim();
    if (!tag) continue;

    output.add(tag);
    output.add(tag.replace(/-/g, ' '));
    output.add(tag.replace(/\s+/g, '-'));
  }

  return Array.from(output).filter(Boolean);
};

