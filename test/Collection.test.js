/* jshint esversion: 6 */

const assert = require('assert');
const PouchMock = require('./PouchMock.js');

// const PouchDB = require('pouchdb');
const PouchDB = require('./PouchMock.js').PouchDB;

const PouchCollection = require('../lib/pouch-collection.js');
PouchDB.plugin(PouchCollection);



// * [Collection](#store)
//   * [Collection.save(:object [,...])](#store-store)
//   * [Collection.find(:id)](#store-find-id)
//   * [Collection.find(:query)](#store-find-query)
//   * [Collection.find()](#store-find-all)
//   * [Collection.remove(:item [,...])](#store-remove-item)
//   * [Collection.removeAll()](#store-remove-all)

/**
 *
 */
describe('Collection', function(){

  let bookCollection = null;
  let db = null;

  //
  beforeEach(function(){

      return PouchMock.create()
        .then(_db=>{
          db = _db;
          bookCollection = db.collection('book');
      });

  });
  // afterEach(()=>{
  //   return db.destroy();
  // });

  /**
   *
   */
  it('id', function(){
      assert.equal( bookCollection.id('book!123'), 'book!123');
      assert.equal( bookCollection.id('123'), 'book!123');
      assert.ok( bookCollection.id().startsWith('book!') );
  });

  /**
   *
   */
  describe('save', function(){

    /**
     *
     */
    it('single doc', function(){
      var book = {title:'Me'};
      return bookCollection.save(book)
        .then(doc=>{
          assert.ok(doc._id);
          assert.ok(doc._rev);
          assert.equal(doc.type, 'book');
          assert.equal(doc.title, book.title);
        });
    });

    /**
     *
     */
    it('existed doc', function(){
      let data = [
        {_id:'book!1', type:'book', val:1},
        {_id:'book!2', type:'book', val:2},
        {_id:'book!3', type:'book', val:3},
      ];
      var book = {_id:1, title:'Me'};

      return PouchMock.load(db, data)
        .then(()=>bookCollection.save(book))
        .then(doc=>{
          assert.equal(doc._id, 'book!1');
          assert.ok(doc._rev);
          assert.equal(doc.type, 'book');
          assert.equal(doc.title, book.title);
          assert.ok(!doc.val);
        });
    });


  });


  describe('get', function(){

    //
    it('single argument', function(){
      let data = [
        {_id:'book!1', type:'book', val:1},
        {_id:'book!2', type:'book', val:2},
        {_id:'book!3', type:'book', val:3},
      ];

      return PouchMock.load(db, data)
        .then(()=>{
          return bookCollection.get('1');
        }).then(docs=>{
          pouchAssertDocs(docs, [data[0]]);
        });
    });

    //
    it('single non-existed', function(){
      let data = [
        {_id:'book!1', type:'book', val:1},
        {_id:'book!2', type:'book', val:2},
        {_id:'book!3', type:'book', val:3},
      ];

      return PouchMock.load(db, data)
        .then(()=>{
          return bookCollection.get('4');
        }).then(docs=>{
          pouchAssertDocs(docs, []);
        });
    });

    //
    it('multiple arguments', function(){
      let data = [
        {_id:'book!1', type:'book', val:1},
        {_id:'book!2', type:'book', val:2},
        {_id:'book!3', type:'book', val:3},
      ];

      return PouchMock.load(db, data)
        .then(()=>{
          return bookCollection.get(['1', '3']);
        }).then(docs=>{
          pouchAssertDocs(docs, [data[0], data[2]]);
        });
    });

    //
    it('all', function(){
      let data = [
        {_id:'book!1', type:'book', val:1},
        {_id:'book!2', type:'book', val:2},
        {_id:'note!3', type:'note', val:3},
      ];

      return PouchMock.load(db, data)
        .then(()=>{
          return bookCollection.get();
        }).then(docs=>{
          pouchAssertDocs(docs, [data[0], data[1]]);
        });
    });

  });


  describe('update', function(){
    //
    it('single doc', function(){
      let data = [
        {_id:'book!1', type:'book', val:1},
        {_id:'book!2', type:'book', val:2},
        {_id:'book!3', type:'book', val:3},
      ];

      return PouchMock.load(db, data)
        .then(()=>{
          return bookCollection.update('1', function(doc){
            doc.val = 11;
            doc._id = 'book!12'; // it shouldn't affect
            doc._rev = 'asdasd'; // it shouldn't affect
            doc.type = 'asdasd'; // it shouldn't affect
            return doc;
          });
        }).then(doc=>{
          assert.equal(doc._id, 'book!1');
          assert.ok(doc._rev);
          assert.equal(doc.type, 'book');
          assert.equal(doc.val, 11);
        });
    });

    //
    it('non-existed doc', function(){
      let data = [
        {_id:'book!1', type:'book', val:1},
        {_id:'book!2', type:'book', val:2},
        {_id:'book!3', type:'book', val:3},
      ];

      return PouchMock.load(db, data)
        .then(()=>{
          return bookCollection.update(4, function(doc){
            doc.val = 14;
            doc._id = 'book!12'; // it shouldn't affect
            doc._rev = 'asdasd'; // it shouldn't affect
            doc.type = 'asdasd'; // it shouldn't affect
            return doc;
          });
        }).then(doc=>{
          assert.equal(doc._id, 'book!4');
          assert.ok(doc._rev);
          assert.equal(doc.type, 'book');
          assert.equal(doc.val, 14);
        });
    });

  });


});



function pouchAssertDocs(actualDocs, expectedDocs){
  assert.equal(actualDocs.length, expectedDocs.length);

  for (var i = actualDocs.length - 1; i >= 0; i--) {
    // has revision
    assert.ok(actualDocs[i]._rev);
    delete actualDocs[i]._rev;
    // match rest data
    assert.deepEqual(actualDocs[i], expectedDocs[i]);
  }
}