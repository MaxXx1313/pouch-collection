

module.exports = {
    extractDocs  : extractDocs,
    defaultValue : defaultValue,
    error       : error,
    notFound    : notFound,
    isObject    : isObject,



};

/**
 *
 * @param {CouchResponse} data
 * @return {Array<CouchDoc>}
 */
function extractDocs(data) {
    var rows = data && data.rows || [];

    return rows.map(function (row) {
        return row.doc;
    }).filter(function (doc) {
        return !!doc;
    });
}


/**
 * Get function, which returns {@link value} instead of 404 error (document not found)
 *
 * @param {CouchDoc|function(CouchError):CouchDoc|function(CouchError):Promise.<CouchDoc>|null} [defaultValue]
 * @return {function(PouchError):CouchDoc}
 *
 * @function
 *
 * @example
 *  defaultDoc = {_id:'someid'};
 *  db.get('someid').catch(nano.defaultValue(defaultDoc))
 *
 */
function defaultValue(defaultValue) {
    if (typeof defaultValue === 'undefined') {
        defaultValue = null;
    }
    return function (e) {
        if (e.status === 404) {
            if(typeof defaultValue === 'function'){
                // we cant move this check outside because it's important to call this fn only when error really happened
                defaultValue = defaultValue();
            }
            return defaultValue;
        }
        else {
            throw e;
        }
    };
}


/**
 * get Pouch-like error
 * @param {int} [code]
 * @param {String} [name]
 * @param {String} [message]
 * @returns {PouchError}
 */
function error(code, name, message) {
    var e = new Error(message || 'unknown');
    e.error = true;
    // e.message = message;
    e.name = name || "error";
    e.reason = e.message;
    e.status = code || 500;
    return e;
}

/**
 * get Pouch-like 404 error
 * @param {string} [target]
 * @returns {PouchError}
 */
function notFound(target) {
    return error(404, "not_found", "missing" + (target ? ' ' + target : ''));
}


/**
 *
 * @param {*} value
 * @returns {boolean}
 */
function isObject(value) {
    return _.isObject(value);
    // alternative:
    // return !!(value && Object.prototype.toString.call(value) === '[object Object]');
}
