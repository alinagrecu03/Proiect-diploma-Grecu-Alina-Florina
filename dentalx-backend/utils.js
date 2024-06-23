const { pool } = require('./configuration');

const costResponse = (costKey, response) => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT * FROM stock WHERE stock.id=$1`, [costKey])
        .then((findStock) => {
            const costVal = +(response?.costs_used?.[costKey] ?? 0);
            pool.query(`UPDATE stock SET quantity=$1 WHERE stock.id=$2 RETURNING *`, [(findStock?.rows?.[0]?.quantity - costVal), costKey])
            .then(() => {
                resolve(response);
            }).catch(errorStock => {
                reject(errorStock)
            });
        }).catch(error => {
            reject(error);
        });
    });
};

module.exports = {
    costResponse
}