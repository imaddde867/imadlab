// Validates the small XML subset emitted by our sitemap and RSS writers.
// Do not add permissive HTML parsing here: malformed XML must fail the build.
export function assertWellFormedXml(xml, expectedRoot) {
  if (typeof xml !== 'string' || /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(xml)) {
    throw new Error('Invalid XML characters');
  }
  if (!/^<\?xml\s+version=(?:"1\.0"|'1\.0')\s+encoding=(?:"UTF-8"|'UTF-8')\s*\?>/.test(xml)) {
    throw new Error('Missing XML declaration');
  }
  let i = xml.indexOf('?>') + 2;
  const stack = [];
  let rootSeen = false;
  let rootClosed = false;
  const checkEntities = (value) => {
    if (/&(?!(?:amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);)/.test(value)) {
      throw new Error('Unescaped XML entity');
    }
  };

  while (i < xml.length) {
    if (xml.startsWith('<![CDATA[', i)) {
      if (!stack.length) throw new Error('CDATA outside XML root');
      const end = xml.indexOf(']]>', i + 9);
      if (end === -1) throw new Error('Unterminated XML CDATA');
      i = end + 3;
      continue;
    }
    if (xml[i] !== '<') {
      const end = xml.indexOf('<', i);
      const text = xml.slice(i, end === -1 ? xml.length : end);
      if (!stack.length && text.trim()) throw new Error('Text outside XML root');
      if (text.includes(']]>')) throw new Error('Invalid XML text sequence');
      checkEntities(text);
      i = end === -1 ? xml.length : end;
      continue;
    }
    if (xml.startsWith('<!', i) || xml.startsWith('<?', i)) {
      throw new Error('Unexpected XML declaration/doctype');
    }
    const end = (() => {
      let quote = null;
      for (let j = i + 1; j < xml.length; j++) {
        const c = xml[j];
        if (quote) { if (c === quote) quote = null; }
        else if (c === '"' || c === "'") quote = c;
        else if (c === '>') return j;
      }
      return -1;
    })();
    if (end < 0) throw new Error('Unterminated XML tag');
    const raw = xml.slice(i + 1, end).trim();
    const closing = raw.startsWith('/');
    const selfClosing = !closing && raw.endsWith('/');
    const clean = closing ? raw.slice(1).trim() : selfClosing ? raw.slice(0, -1).trim() : raw;
    const name = clean.match(/^[A-Za-z_][\w.:-]*/)?.[0];
    if (!name) throw new Error('Invalid XML tag');
    const attributes = clean.slice(name.length);
    if (closing && attributes.trim()) throw new Error('Invalid closing XML tag');
    if (!closing) {
      let remaining = attributes;
      const names = new Set();
      while (remaining.trim()) {
        const match = remaining.match(/^\s+([A-Za-z_:][\w.:-]*)\s*=\s*("[^"]*"|'[^']*')/);
        if (!match || names.has(match[1])) throw new Error('Invalid or duplicate XML attribute');
        names.add(match[1]);
        checkEntities(match[2].slice(1, -1));
        remaining = remaining.slice(match[0].length);
      }
      if (!stack.length) {
        if (rootSeen || name !== expectedRoot) throw new Error('Unexpected XML root');
        rootSeen = true;
      }
      if (!selfClosing) stack.push(name);
      else if (!stack.length) rootClosed = true;
    } else {
      if (stack.pop() !== name) throw new Error('Mismatched XML closing tag');
      if (!stack.length) rootClosed = true;
    }
    i = end + 1;
  }
  if (!rootSeen || !rootClosed || stack.length) throw new Error('Unclosed XML document');
}
