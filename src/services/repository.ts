import PouchDB from 'pouchdb-browser';

import Database = PouchDB.Database;

// Generic repository for a PouchDB based storage - creates a new database
export class Repository {

  private db : Database;
  private remoteDb : Database;
  private liveSync : PouchDB.Core.Listener.OnEvent;

  constructor(private type : string, private remoteUrl : string = null) {
    this.db = new PouchDB(this.type);

    if(remoteUrl != null) {
      this.remoteDb = new PouchDB(remoteUrl + "/" + this.type);
    }
  }

  // the local db - the one to use for all db logic
  get local() {return this.db}

  // the remote db - only used for data synchronization / replication
  get remote() {return this.remoteDb}

  // initializes the db and starts the synchronization if specified
  init(startSync = false) : Promise<any> {
    // ensure that the local db exists
    let dbInitPromises = [this.db.info()];
    if(startSync) {
      // ensure that the remote db exists / is created
      dbInitPromises = [...dbInitPromises, this.remoteDb.info().catch(err => {
        console.log("Failed to access remote database")
      })];
    }
    return Promise.all(dbInitPromises).then(()=>{
      if(startSync && this.local && this.remote) {
        // both databases exist, so start syncing the local with the remote
        this.liveSync = this.db.sync(this.remoteDb, {live: true, retry: true});
      }
    }).catch(err=>{
      console.log("failed to init repository: ", err)
    })
  }

  // stops the synchronization to/from a remote
  stopSync() {
    // stop the synchronization
    if(this.liveSync) {
      this.liveSync.cancel();
    }
  }

  // gets all the items
  getAll() {
    // get all the documents from the local pouch db
    return this.db.allDocs({include_docs: true})
      .then(db => db.rows.map(row => row.doc));
  }

  // gets an item by id
  get(id) {
    return this.db.get(id);
  }

  // gets an item by id, or creates a new item if doesn't exist
  getOrCreate(id, item) {
    return this.db.get(id).then(existingItem=>existingItem).catch(err=> {
      // the items doesn't exist, so create it
      if(item) {
        // only update an item if it already exists - now update the item and insert it back
        Object.assign(item, {_id: id});
        return this.add(item)
      } else {
        Promise.reject("No item to save")
      }
    })
  }

  // create or update an item by id
  save(itemOrId, item = null) {
    // item is optional...
    if(!item) {
      item = itemOrId
    } else {
      // update the id on the item
      Object.assign(item, {_id: itemOrId});
    }

    // if item has "_id", it should be the doc
    if(item._id) {
      return this.update(item);
    } else {
      this.add(item);
    }
  }

  // try adding a new item
  add(itemOrId, item = null) {
    // item is optional...
    if(!item) {
      item = itemOrId
    } else {
      // update the id on the item
      Object.assign(item, {_id: itemOrId});
    }
    return this.db.post(item);
  }

  // try updating an item
  update(item) {
    return this.db.get(item._id).then(updatingItem => {
      // only update an item if it already exists - now update the item and insert it back
      Object.assign(updatingItem, item);
      return this.db.put(updatingItem);
    }).catch(err=> {
      //failed the get
      return this.add(item)
    })
  }

  // try removing an item
  remove(itemOrId : any) {
    var id = itemOrId._id;
    if(!id) {
      id = itemOrId;
    }
    return this.db.get(id).then(item => {
      // only remove an item if it already exists
      return this.db.remove(item);
    });
  }
}

// Generic repository for a PouchDB based storage bound to a specific user - creates a new database
export class UserRepository extends Repository {
  constructor(type: string, userId : string, remoteUrl : string) {
    // db name pattern:
    // user_123_contacts
    super("user_" + userId + "_" + type, remoteUrl)
  }
}
