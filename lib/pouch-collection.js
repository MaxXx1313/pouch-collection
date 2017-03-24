
var extractDocs = require('./pouch-tools').extractDocs;

module.exports = PouchCollectionPlugin;

/**
 *
 */
function PouchCollectionPlugin(PouchDB) {
  // PouchDB._collections = {};

  PouchDB.prototype.collection = function(name, opts){
    // if(!PouchDB._collections[name]){
    //   PouchDB._collections[name] = new PouchCollection(this, name, opts);
    // }
    // return PouchDB._collections[name];
    return new PouchCollection(this, name, opts);
  };
};


const PREFIX_SEPARATOR = '!';
const COUCH_ASTERISK = '\uffff';

/**
 * @param {string} name
 * @param {object} [opts]
 * @return {PouchCollection}
 */
function PouchCollection(db, name, opts){
  this._db = db;

  if(!name){
    throw new Error('collection: "name" is required');
  }

  this._opts = opts || {};
  this._opts.prefix = this._opts.prefix || name;
}

/**
 *
 */
PouchCollection.prototype.id = function(id){
  let prefix = this._opts.prefix + PREFIX_SEPARATOR;
  if(!id){
    return  prefix + uuid();
  }
  return id.startsWith(prefix) ? id : prefix + id;
};


/**
 *
 */
PouchCollection.prototype.save = function(obj){
  obj._id = this.id( obj._id );
  obj.type = this._opts.prefix;

  return this._db.put(obj)
    .then(result=>{
      obj._id = result.id;
      obj._rev = result.rev;
      return obj;
    })
};

/**
 * @param {string|array<string>} [ids]
 */
PouchCollection.prototype.find = function(ids){

  let params = {
    include_docs : true
  };
  if(typeof ids === "undefined" ){
    // search all
    let prefix = this._opts.prefix + PREFIX_SEPARATOR;

    params.startkey = prefix;
    params.endkey   = prefix + COUCH_ASTERISK;

  } else {
    ids = Array.isArray(ids)?ids:[ids];
    ids = ids.map(id=>this.id(id));

    params.keys = ids;
  }

  return this._db.allDocs(params)
    .then(extractDocs);
};



/**
 * Get new guid
 * @return {string}
 *
 * @more based on http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
 */
function uuid() {

    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }

    // return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    return s4() + s4() + s4() + s4() + s4() + s4() + s4() + s4();
}




// /////////////////////////////////////////////////////////////////////////
// // pouch extensions
// /**
//  * @param {object} [opts]
//  * @return {Promise<[CouchDoc]>}
//  */
// CustomPouchDB.prototype.getAll = function pouchGetAll(opts) {
//     opts = opts || {};
//     opts.include_docs = true; // jshint ignore:line
//     return this.allDocs(opts) // jshint ignore:line
//         .then(tools.pouch.extractDocs);
// };

// /**
//  * @param {Array<string>} keys
//  * @return {Promise<[CouchDoc]>}
//  */
// CustomPouchDB.prototype.getByKeys = function pouchGetByKeys(keys) {
//     return this.getAll({keys: keys}); // jshint ignore:line
// };

  // /**
  //    * @param {string} prefix
  //    * @return {Promise<[CouchDoc]>}
  //    */
  //   CustomPouchDB.prototype.getAllByPrefix = function pouchGetAllByPrefix(prefix) {
  //       return this.getAll({startkey: prefix, endkey: prefix + '\uffff'}); // jshint ignore:line
  //   };


// * [Collection](#store)
//   * [Collection.save(:object [,...])](#store-store)
//   * [Collection.find(:id)](#store-find-id)
//   * [Collection.find(:query)](#store-find-query)
//   * [Collection.find()](#store-find-all)
//   * [Collection.remove(:item [,...])](#store-remove-item)
//   * [Collection.removeAll()](#store-remove-all)


// PouchCollection.prototype.store
// PouchCollection.prototype.add
// PouchCollection.prototype.find
// PouchCollection.prototype.remove