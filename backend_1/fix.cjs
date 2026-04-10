const mongoose = require('mongoose');

async function fix() {
  await mongoose.connect('mongodb://localhost:27017/staygo');
  const db = mongoose.connection.db;
  
  console.log('Deleting duplicate profiles...');
  const res = await db.collection('studentprofiles').deleteMany({ 
      email: 'sujayasamajith2003@gmail.com', 
      userId: { $ne: new mongoose.Types.ObjectId('69ac57df8fc776152574f3fe') } 
  });
  console.log('Deleted duplicate profiles:', res.deletedCount);
  
  process.exit();
}

fix();
