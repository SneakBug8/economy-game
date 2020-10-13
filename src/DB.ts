//import sqlite3 = require('sqlite3').sqlite3.verbose();
import * as knex from "knex";

export const Connection = knex({
    client: "sqlite3",
    connection: {
        filename: "../db.db",
    }
});


/*export const Connection = new sqlite3.Database("./db.db", (err) =>
{
    if (err) {
        return console.error(err.message);
    }
});

export const getAsync = (query, args) => {
    return new Promise<any>((resolve, reject) => {
        Connection.get(query, args, (err, row) => {
            if (err) {
                reject(err);
            }

            resolve(row);
        });
})};

export const allAsync = (query, args) => {
    return new Promise<any>((resolve, reject) => {
        Connection.all(query, args, (err, row) => {
            if (err) {
                reject(err);
            }

            resolve(row);
        });
})};

export const runAsync = (query, args) => {
    return new Promise<any>((resolve, reject) => {
        Connection.run(query, args, (err, row) => {
            if (err) {
                reject(err);
            }

            resolve(row);
        });
})};
*/