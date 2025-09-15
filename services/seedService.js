const Product = require('../models/Product');

const products = [
  // Men's Products
  { name: 'Nike Air Max', price: 120, category: 'shoes/Mens/Running', image: 'NikeAir.jpg', createdAt: new Date('2025-09-14T00:00:00Z') },
  { name: 'Ultraboost', price: 220, category: 'shoes/Mens/Running', image: 'ultraboost.jpg', createdAt: new Date('2025-09-13T00:00:00Z') },
  { name: 'Jordans', price: 100, category: 'shoes/Mens/Basketball', image: 'Jordans.webp', createdAt: new Date('2025-09-12T00:00:00Z') },
  // Women's Products
  { name: 'Vomero', price: 160, category: 'shoes/Womens/Running', image: 'Vomero.webp', createdAt: new Date('2025-09-11T00:00:00Z') },
  { name: 'Pegasus Air', price: 210, category: 'shoes/Womens/Running', image: 'Pegasus.webp', createdAt: new Date('2025-09-10T00:00:00Z') },
  // Kids Products
  { name: 'Ultraboost', price: 80, category: 'shoes/Kids/Running', image: 'ultraboostkids.webp', createdAt: new Date('2025-09-09T00:00:00Z') },
  { name: 'Vomero', price: 70, category: 'shoes/Kids/Running', image: 'vomerokids.webp', createdAt: new Date('2025-09-08T00:00:00Z') },
  { name: 'Jordans', price: 50, category: 'shoes/Kids/Basketball', image: 'jordanskids.webp', createdAt: new Date('2025-09-07T00:00:00Z') },
  // Unisex Product
  { name: 'Vans', price: 90, category: 'shoes/Unisex/Casual', image: 'vans.webp', createdAt: new Date('2025-09-06T00:00:00Z') },
];

const seedProjects = async () => {
  await Project.deleteMany({});
  await Project.insertMany(sampleData);
};
module.exports = {seedProjects}; 