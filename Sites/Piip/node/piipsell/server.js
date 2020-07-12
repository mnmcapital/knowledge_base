const knex = require('knex') ({
    client: 'mysql',
    connection: {
        host: '127.0.0.1',
        user: 'root',
        password: 'Xing4922',
        database: 'locales'
    }
})

module.exports = {
    knex: knex
}