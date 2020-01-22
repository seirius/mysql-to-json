#!/usr/bin/env node

const commandLineArgs = require("command-line-args");
const chalk = require("chalk");
const { createConnection } = require("mysql");
const { promises } = require("fs");

const options = [
    {
        name: "host",
        alias: "h",
        type: String,
        defaultValue: "localhost",
    },
    {
        name: "port",
        alias: "p",
        type: Number,
        defaultValue: 3306,
    },
    {
        name: "database",
        alias: "d",
        type: String,
    },
    {
        name: "table",
        alias: "t",
        type: String,
    },
    {
        name: "user",
        alias: "u",
        type: String,
    },
    {
        name: "password",
        alias: "w",
        type: String,
    },
    {
        name: "out",
        alias: "o",
        type: String,
    },
    {
        name: "help",
        type: String,
    },
    {
        name: "print",
        alias: "r",
        type: String,
    },
    {
        name: "limit",
        alias: "l",
        type: Number,
    }
];

async function run () {
    let connection;
    try {
        let {host, port, database, table, user, password, out, help, print, limit} = commandLineArgs(options);

        if (help !== undefined) {
            console.log(chalk.yellow(`
            --host,     -h Database's host
            --port,     -p Database's port
            --database, -d Database's schema
            --table,    -t Database's table
            --user,     -u Database's user
            --password, -w Database's password
            --out,      -o Where to write the json
            --print,    -r Prints the result in the console
            --limit,    -l Sets a result limit to the query
            --help         Show help
            `));
            return;
        }
        if (!database) {
            throw "No database defined";
        }

        if (!table) {
            throw "No table defined";
        }

        if (!user) {
            throw "No user defined";
        }

        if (!out) {
            out = table + ".json";
        }

        connection = createConnection({ host, port, database, user, password });

        connection.connect();

        const json = JSON.stringify(await getTableJson({connection, database, table, limit}), null, 2);

        if (print !== undefined) {
            console.log(json);
        } else {
            promises.writeFile(out, json);
        }

    } catch (error) {
        console.log(chalk.red(error));
    } finally {
        if (connection && connection.end) {
            connection.end();
        }
    }
}

function getTableJson({connection, table, database, limit}) {
    return new Promise((resolve, reject) => {
        try {
            let query = `
                SELECT *
                FROM ${database}.${table}
            `;
            if (limit !== undefined && limit !== null) {
                query += ` LIMIT ${limit} `;
            }
            connection.query(query, (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results.map((row) => {
                        const parsedRow = {};
                        Object.entries(row).forEach(([key, value]) => {
                            if (value instanceof Date) {
                                value = value.toISOString();
                            }
                            parsedRow[key] = value;
                        });
                        return parsedRow;
                    }));
                }
            });
        } catch (error) {
            reject(error);
        }
    });
}

run();