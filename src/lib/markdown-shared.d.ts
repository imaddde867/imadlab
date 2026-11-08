import type { Schema } from 'hast-util-sanitize';
export declare const markdownSanitizeSchema: Schema;
export declare function normalizeMathBlocks(source: string, enableMath: boolean): string;
export declare function selectProjectMarkdown(project: { full_description?: string | null; description?: string | null } | null | undefined): string;
