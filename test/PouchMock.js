"use strict";
/* jshint esversion: 6 */

const PouchDB = require('pouchdb');

let index = parseInt(Date.now());

/**
 * @name PouchDBMock
 */
module.exports = {
    create:createMock,
    createMock:createMock,
    load:load,
    dump:dump
    // delete:deleteMock

    // TODO: delete mock db on exit. in-memory db will cover this issue
};

/**
 * @param {Array<CouchDoc>} [data]
 * @return {Promise<PouchDB>}
 * @memberOf PouchDBMock#
 * @alias create
 */
function createMock(data){

    // console.log('create ', 'pouch_mock_' + index);
    var db = new PouchDB('mock_' + index++/*, {adapter:'memory'}*/); // TODO: memory is faster =)

    return data ? load(db, data || []) : Promise.resolve(db);
}


/**
 * @param {PouchDB} db
 * @param {Array<CouchDoc>} data
 * @return {Promise<PouchDB>}
 * @memberOf PouchDBMock#
 * @alias create
 */
function load(db, data){
    return db.bulkDocs(data || [])
        .then(()=>db);
}



/**
 * Get all data from pouch db
 * NOTE: this method doesn't fetch _local/* records!
 * @param {PouchDB} db
 * @return {Promise<{CouchDoc}>} id=>val object
 * @memberOf PouchDBMock#
 */
function dump(db){
    return db.allDocs({include_docs:true})
        .then(res=>{
            return res.rows.map(docMeta=>docMeta.doc);
        });
        // .then(res=>{
        //     // make assoc
        //     return res.reduce((result, doc)=>{
        //         result[doc._id] = doc;
        //         return result;
        //     },{});
        // });
}


/**
 * Delete database
 * @param {PouchDB} db
 * @return {Promise}
 */
// function deleteMock(db){
//     return db.destroy();
// }

// function cleanAll(){
//     return new Promise((resolve, reject)=>{
//         /**
//          * @type {IDBRequest}
//          */
//         let req = window.indexedDB.webkitGetDatabaseNames();
//         req.onerror(reject);
//         req.onsuccess(function(e=>{
//             let dbList = e.target.result;
//
//             // TODO: cleanAll incomplete
//         }));
//     });
// }


