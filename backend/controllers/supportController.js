const Support = require('../models/Support');

const createTicket = async (req, res) => {
  try {
    const { subject, message } = req.body;
    const support = await Support.create({
      user: req.user._id, subject, message
    });
    res.status(201).json({ success: true, data: support });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { createTicket };
