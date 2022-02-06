import MarkdownIt from 'markdown-it';
export declare function parseInfo(str: string): {
    hasDiff: boolean;
    langName: string;
    fileName?: string;
};
export declare function mdRendererFence(md: MarkdownIt): void;
