export abstract class JsonError extends Error {
    abstract toJSON(): { message: string; code: string };
}
