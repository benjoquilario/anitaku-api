declare type track = {
    file: string;
    kind: string;
    label?: string;
    default?: boolean;
};
declare type intro_outro = {
    start: number;
    end: number;
};
declare type unencryptedSrc = {
    file: string;
    type: string;
};
declare type extractedSrc = {
    sources: string | unencryptedSrc[];
    tracks: track[];
    encrypted: boolean;
    intro: intro_outro;
    outro: intro_outro;
    server: number;
};
interface ExtractedData extends Pick<extractedSrc, "intro" | "outro" | "tracks"> {
    sources: {
        url: string;
        type: string;
    }[];
}
declare class MegaCloud {
    private serverName;
    extract(videoUrl: URL): Promise<ExtractedData>;
    extractVariables(text: string): number[][];
    getSecret(encryptedString: string, values: number[][]): {
        secret: string;
        encryptedSource: string;
    };
    decrypt(encrypted: string, keyOrSecret: string, maybe_iv?: string): string;
    matchingKey(value: string, script: string): string;
}
export default MegaCloud;
