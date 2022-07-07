export {};

interface IDuration {
    SECOND: number;
    MINUTE: number;
    HOUR: number;
    DAY: number;
    WEEK: number;
    MONTH: number;
    YEAR: number;
    MS: Omit<IDuration, 'MS'>;
}

declare global {
    const DURATION: IDuration;

    interface Date {
        toMysqlUTCString(): string;
        days(): number;
        hours(): number;
        mins(): number;
        secs(): number;
        minus(date: Date | number, abs?: boolean): Date;
    }
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
global.DURATION = {
    SECOND: 1,
    MINUTE: 60,
    HOUR: 60 * 60,
    DAY: 24 * 3600,
    WEEK: 7 * 24 * 3600,
    MONTH: 30 * 24 * 3600,
    YEAR: 365 * 24 * 3600,
    MS: {
        SECOND: 1000,
        MINUTE: 60 * 1000,
        HOUR: 60 * 60 * 1000,
        DAY: 24 * 3600 * 1000,
        WEEK: 7 * 24 * 3600 * 1000,
        MONTH: 30 * 24 * 3600 * 1000,
        YEAR: 365 * 24 * 3600 * 1000,
    },
};

Date.prototype.toMysqlUTCString = function () {
    return this.toISOString().slice(0, 19).replace('T', ' ');
};

Date.prototype.days = function () {
    return this.getTime() / 1000 / 60 / 60 / 24;
};

Date.prototype.hours = function () {
    return this.getTime() / 1000 / 60 / 60;
};

Date.prototype.mins = function () {
    return this.getTime() / 1000 / 60;
};

Date.prototype.secs = function () {
    return this.getTime() / 1000;
};

Date.prototype.minus = function (date: Date | number, abs = false) {
    const time = typeof date === 'number' ? Math.abs(date) : date.getTime();
    const dTime = this.getTime() - time;

    this.setTime(abs ? Math.abs(dTime) : dTime);
    return this;
};
