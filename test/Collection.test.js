
const assert = require('assert');
const PouchDB = require('pouchdb');
const PouchCollection = require('../lib/pouch-collection.js');
PouchDB.plugin(PouchCollection);

const PouchMock = require('./PouchMock.js');


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

  let collection = null;
  let db = null;

  //
  beforeEach(function(){

      return PouchMock.create()
        .then(_db=>{
          db = _db;
          collection = db.collection('book');
      });

  });
  // afterEach(()=>{
  //   return db.destroy();
  // });

  /**
   *
   */
  it('id', function(){
      assert.equal( collection.id('book!123'), 'book!123');
      assert.equal( collection.id('123'), 'book!123');
      assert.ok( collection.id().startsWith('book!') );
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
      return collection.save(book)
        .then(doc=>{
          assert.ok(doc._id);
          assert.ok(doc._rev);
          assert.equal(doc.type, 'book');
          assert.equal(doc.title, book.title);
        })
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
        .then(()=>collection.save(book))
        .then(doc=>{
          assert.equal(doc._id, 'book!1');
          assert.ok(doc._rev);
          assert.equal(doc.type, 'book');
          assert.equal(doc.title, book.title);
          assert.ok(!doc.val);
        })
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
          return collection.get('1');
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
          return collection.get('4');
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
          return collection.get(['1', '3']);
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
          return collection.get();
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
          return collection.update('1', function(doc){
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
          return collection.update(4, function(doc){
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
    assert.ok(actualDocs[i]._rev);
    delete actualDocs[i]._rev;

    assert.deepEqual(actualDocs[i], expectedDocs[i]);
  }
}