import express from 'express';
import { protect } from '../middlewares/auth.js';
import Notification from '../models/Notification.js';

const router = express.Router();

router.get('/', protect, async (req, res) => {
    try {
        const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json({ success: true, notifications });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/unread', protect, async (req, res) => {
    try {
        const count = await Notification.countDocuments({ user: req.user._id, status: { $ne: "READ" } });
        res.json({ success: true, count });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.patch('/:id/read', protect, async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            { status: "READ" },
            { new: true }
        );
        res.json({ success: true, notification });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.patch('/read-all', protect, async (req, res) => {
    try {
        await Notification.updateMany(
            { user: req.user._id, status: { $ne: "READ" } },
            { status: "READ" }
        );
        res.json({ success: true, message: "All notifications marked as read" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
