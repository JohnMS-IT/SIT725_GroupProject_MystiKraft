const connectDB = require('../config/db');
const { seedProjects } = require('../services/seedService');


const seedDB = async () => {
  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await Product.deleteMany({});
    await Product.insertMany(products);
    console.log('Data seeded successfully');
    mongoose.connection.close();
  } catch (err) {
    console.error('Error seeding data:', err.message);
    mongoose.connection.close();
  }
};

seedDB();