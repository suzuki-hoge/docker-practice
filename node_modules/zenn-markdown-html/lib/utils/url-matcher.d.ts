export declare function isGistUrl(url: string): boolean;
export declare function isTweetUrl(url: string): boolean;
export declare function isStackblitzUrl(url: string): boolean;
export declare function isCodesandboxUrl(url: string): boolean;
export declare function isCodepenUrl(url: string): boolean;
export declare function isJsfiddleUrl(url: string): boolean;
export declare function extractYoutubeVideoParameters(youtubeUrl: string): {
    videoId: string;
    start?: string;
} | undefined;
export declare function isYoutubeUrl(url: string): boolean;
