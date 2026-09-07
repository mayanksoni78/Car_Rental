import Notification from '../models/Notification.js';
import transporter from '../config/nodemailer.js';
import logger from '../config/logger.js';

export const createNotification = async ({ user, type, title, message, booking = null, sendEmail = false, emailData = null }) => {
    try {
        const notification = await Notification.create({
            user,
            type,
            title,
            message,
            booking,
            status: "PENDING"
        });

        if (sendEmail && emailData) {
            try {
                const mailOptions = {
                    from: process.env.EMAIL_USER,
                    to: emailData.to,
                    subject: emailData.subject,
                    html: emailData.html
                };

                if (emailData.attachments) {
                    mailOptions.attachments = emailData.attachments;
                }

                await transporter.sendMail(mailOptions);
                
                notification.status = "SENT";
                notification.sentAt = new Date();
                await notification.save();
                
                logger.info("notification.email_sent", { notificationId: notification._id });
            } catch (emailError) {
                logger.error("notification.email_failed", { notificationId: notification._id, error: emailError.message });
                notification.status = "FAILED";
                notification.error = emailError.message;
                await notification.save();
                // IMPORTANT: We do not throw here. Email failure should not rollback the booking transaction!
            }
        } else {
            notification.status = "SENT";
            notification.sentAt = new Date();
            await notification.save();
        }

        return notification;
    } catch (error) {
        logger.error("notification.creation_failed", { error: error.message });
        throw error;
    }
};
