const Message = require('../models/Message');

exports.getAllProjects = async (req, res) => {
  try {
    const projects = await Message.find({});
    res.status(200).json({ data: projects, message: 'Success' });// Successful response
  } catch (error) {
    res.status(500).json({ statusCode: 500, message: 'Error fetching messages' });
  }
  console.log('Fetch projects', projects);
};
