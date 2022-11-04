import { hostname } from 'os';
import { Snitch } from './snitch';
import '@ezweb/ts-helpers';

type Log3rdArg = {
    plain: boolean;
    raw: boolean;
    where?: string;
    showWarnings: boolean;
    hooks: true;
    rejectOnEmpty: false;
    originalAttributes: string[];
    attributes: (string[] | string)[];
    tableNames: string[];
    type: string;
};

export class DBSnitch {
    private readonly tags: { host: string; component: string };
    private queriesSent: Record<string, { n: number; time: number }> = {};
    private querySent = 0;
    private errors = 0;
    private timeSpent = 0;
    private threshold = 1000;

    private slowQueryBuffer: string[] = [];

    constructor(snitch: Snitch, component: string) {
        this.tags = {
            host: hostname(),
            component,
        };

        snitch.addDatasource(() => {
            if (!this.querySent) {
                return [];
            }

            const fields = {
                requests: this.querySent,
                errors: this.errors,
                response_time: this.timeSpent / this.querySent,
                slow_queries: this.slowQueryBuffer.length,
            };
            // if (fields.slow_queries > 0) {
            //     this.logger.warn(`🐌 Slow queries : ${fields.slow_queries}\n${this.slowQueryBuffer.unique().join('\n')}`);
            // }
            const entries = Object.entries(this.queriesSent).map(([type, value]) => ({
                measurement: 'node_sequelize_types',
                tags: { ...this.tags, type },
                fields: {
                    requests: value.n,
                    response_time: value.time / value.n,
                },
            }));

            // if (!isProd) {
            //     logger.warn(`🤯 Sequelize ${component} made ${fields.requests} queries`);
            // }
            this.reset();

            return [
                {
                    measurement: 'node_sequelize',
                    tags: this.tags,
                    fields,
                },
                ...entries,
            ];
        });
    }

    reset() {
        this.errors = 0;
        this.querySent = 0;
        this.queriesSent = {};
        this.timeSpent = 0;
        this.slowQueryBuffer = [];
    }

    logging(query: string, time: number | undefined) {
        // eslint-disable-next-line prefer-rest-params
        const data = arguments[2] as Log3rdArg;

        time = time ?? 0;
        if (!this.queriesSent[data.type]) {
            this.queriesSent[data.type] = { n: 1, time };
        } else {
            this.queriesSent[data.type].n++;
            this.queriesSent[data.type].time += time;
        }
        this.querySent++;
        this.timeSpent += time;
        if (time > this.threshold && this.tags.component !== 'msr_stats') {
            this.slowQueryBuffer.push(`${this.tags.component} - ${query.replace(/^Executed[^:]+?: /, '').replace(/(\d{4,},?(\s*))+(\s?)/g, 'N$2')}`);
        }
    }

    error() {
        this.errors++;
    }
}
