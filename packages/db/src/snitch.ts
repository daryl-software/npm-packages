import { hostname } from 'os';
import { inspect } from 'util';
import { InfluxDB, IPoint } from 'influx';

type DataSource = () => IPoint[];

export class Snitch {
    private datasources: DataSource[] = [];
    private readonly timer: NodeJS.Timeout;

    constructor(private influx: InfluxDB) {
        this.timer = setInterval(this.fire.bind(this), 60 * 1000);
    }

    fire(): Promise<unknown> {
        const points = this.datasources.map((source) => source()).flat();
        return points.length
            ? this.influx.writePoints(points).catch((e) => {
                  console.error(inspect(e));
              })
            : Promise.resolve(undefined);
    }

    addDatasource(source: DataSource) {
        this.datasources.push(source);
    }

    quit() {
        // eslint-disable-next-line no-console
        console.log('Closing snitch');
        clearTimeout(this.timer);
        return this.fire().then(() => {
            // eslint-disable-next-line no-console
            console.log('Closed snitch');
        });
    }

    snitchServerBoot(status: 'start' | 'stop', tags: { mode: string; env: string }) {
        return this.influx.writePoints([
            {
                measurement: 'node-boot',
                tags: {
                    host: hostname(),
                    status,
                    ...tags,
                },
                fields: {
                    value: 1,
                },
            },
        ]);
    }
}
