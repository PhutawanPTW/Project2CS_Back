import mysql from "mysql";
import util from "util";


export const conn = mysql.createConnection({
  host: "202.28.34.197",
  user: "web66_65011212025",
  password: "65011212025@csmsu",
  database: "web66_65011212025",
});

export const queryAsync = util.promisify(conn.query).bind(conn);
