
var extractDocs = require('./pouch-tools').extractDocs;
var uuid = require('./pouch-tools').uuid;

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
 * @param {string} [id]
 * @return {string} prefixed id for the collection
 */
PouchCollection.prototype.id = function(id){
  var prefix = this._opts.prefix + PREFIX_SEPARATOR;
  if(!id){
    return prefix + uuid();
  }
  return (''+id).startsWith(prefix) ? id : prefix + id;
};


/**
 * @param {object} obj
 * @return {PouchDoc} saved pouch doc (with updated id/rev)
 */
PouchCollection.prototype.save = function(obj){
  obj._id = this.id( obj._id );
  obj.type = this._opts.prefix;

  var self = this;
  return this._db.put(obj)
    .then(result=>{
      obj._id = result.id;
      obj._rev = result.rev;
      return obj;
    })

    .catch(err=>{
      if(err.status==409){
        return self.update(obj._id, doc=>obj);
      }else{
        return Promise.reject(err);
      }
    });
};

/**
 * @param {string|array<string>} [ids]
 * @return {Array<PouchDoc>}
 */
PouchCollection.prototype.get = function(ids){

  var params = {
    include_docs : true
  };
  if(typeof ids === "undefined" ){
    // search all
    var prefix = this._opts.prefix + PREFIX_SEPARATOR;

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
 * @param {string} id
 * @param {function(PouchDoc):PouchDoc} updateFn
 * @return {Promise<PouchDoc>} updated doc
 */
PouchCollection.prototype.update = function(id, updateFn){
  var self = this;
  id = this.id(id);
  var rev = null;
  var doc = null;

  return self._db.get(id)
    .then(doc=>{
      // save rev before calling updateFn
      rev = doc._rev;
      return doc;
    })
    .catch(err=>{
      if(err.status === 404){
        return {_id:id, type: self._opts.prefix};
      } else {
        return Promise.reject(err);
      }
    })
    .then(function(doc){
      return updateFn(doc);
    })
    .then(function(newDoc){
      // restore id, rev, type
      newDoc._id  = id;
      newDoc._rev = rev;
      newDoc.type = self._opts.prefix;

      doc = newDoc;
      return self._db.put(newDoc);
    })
    .then(result=>{
      doc._id  = result.id;
      doc._rev = result.rev;
      return doc;
    });
};





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