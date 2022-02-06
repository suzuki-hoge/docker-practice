import type Token from 'markdown-it/lib/token';
export declare const containerDetailsOptions: {
    validate: (params: string) => boolean;
    render: (tokens: Token[], idx: number) => string;
};
export declare const containerMessageOptions: {
    validate: (params: string) => boolean;
    render: (tokens: Token[], idx: number) => string;
};
