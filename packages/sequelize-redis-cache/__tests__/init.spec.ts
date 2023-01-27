import {Sequelize} from "@sequelize/core";
import {Cluster} from "ioredis";
import config from "./config.json";

export let queryCount = 0;
export const sequelize = new Sequelize("sqlite::memory:", {
    logging: () => {
        queryCount++;
        // console.log('SQL Query', query);
    }
});

export let redisCluster: Cluster;

beforeAll(async () => {
    console.log("beforeAll called");
    redisCluster = new Cluster(
        config.rediscluster.servers.map((server) => {
            if (process.env["USE_LOCALHOST"] === "yes" || 1) {
                server.host = "localhost";
            }
            return server;
        }), {
            keyPrefix: "test:" + Date.now() + ":"
        }
    );
    return true
});

afterAll(async () => {
    Promise.all([redisCluster.disconnect(), sequelize.close()]);
});

test("test", () => {
    expect(redisCluster.isCluster).toBe(true);
});

