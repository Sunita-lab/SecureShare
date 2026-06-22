const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');

let bucket;

const initGridFS = () => {
  const db = mongoose.connection.db;
  bucket = new GridFSBucket(db, { bucketName: 'uploads' });
  console.log('GridFS initialized!');
};

const getBucket = () => {
  if (!bucket) throw new Error('GridFS not initialized');
  return bucket;
};

module.exports = { initGridFS, getBucket };