const neo4j = require('neo4j-driver');

const uri = "neo4j+s://aa78aa83.databases.neo4j.io";
const user = "neo4j";
const password = "e67mDYFfelqkYtC0kw6JocaRbFrSTaOAWl-u7FUDt4Y";

const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));

async function main() {
    try {
        const serverInfo = await driver.getServerInfo();
        console.log('Connection successful!');
        console.log("Protocol:", serverInfo.protocolVersion);
        console.log("Address:", serverInfo.address);
    } catch (err) {
        console.error('Connection error:');
        console.error(err);
    } finally {
        await driver.close();
    }
}

main();
