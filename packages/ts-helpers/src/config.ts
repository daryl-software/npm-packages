export {};

declare global {
    interface HostPort {
        host: string;
        port: number;
    }

    interface StorageConfig {
        static_domain: string;
        https?: boolean;
        medias: string;
    }
}
