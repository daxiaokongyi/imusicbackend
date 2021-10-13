const {BadRequestError} = require('../expressError');

const sqlForPartialUpdate = (dataToUpdate, jsToSql) => {
    const keys = Object.keys(dataToUpdate);

    // check if data exists, throw an error if not
    if (keys.length === 0) throw new BadRequestError("No data");

    // {firstName: "Jason", age: 32} => ['"first_name"=$1', '"age"=$2']
    const cols = keys.map((colName, idx) => {
        return `"${jsToSql[colName] || colName}"=$${idx + 1}`;
    });

    return {
        setCols: cols.join(", "),
        values: Object.values(dataToUpdate),
    }
}

module.exports = {sqlForPartialUpdate};
