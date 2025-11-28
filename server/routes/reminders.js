const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Reminder = require('../models/Reminder');

// Get all reminders for current user
router.get('/', auth, async (req, res) => {
  try {
    const reminders = await Reminder.find({ userId: req.user.id }).sort({ scheduledTime: 1 });
    const formattedReminders = reminders.map(reminder => ({
      ...reminder.toObject(),
      id: reminder._id,
      _id: undefined
    }));
    res.json(formattedReminders);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Create a reminder
router.post('/', auth, async (req, res) => {
  try {
    const newReminder = new Reminder({
      ...req.body,
      userId: req.user.id,
      createdAt: Date.now()
    });

    const reminder = await newReminder.save();
    res.json({ ...reminder.toObject(), id: reminder._id, _id: undefined });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Update a reminder
router.put('/:id', auth, async (req, res) => {
  try {
    let reminder = await Reminder.findById(req.params.id);

    if (!reminder) return res.status(404).json({ message: 'Reminder not found' });
    if (reminder.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    reminder = await Reminder.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    res.json({ ...reminder.toObject(), id: reminder._id, _id: undefined });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Delete a reminder
router.delete('/:id', auth, async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.id);

    if (!reminder) return res.status(404).json({ message: 'Reminder not found' });
    if (reminder.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await Reminder.findByIdAndDelete(req.params.id);
    res.json({ message: 'Reminder removed' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
