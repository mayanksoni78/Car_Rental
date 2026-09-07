/**
 * Timezone and Payment Deadline Utility
 * Business Rule:
 * For Pay Later / unpaid bookings:
 * - Payment must be completed NO LATER THAN 23:59:59.999 of the day before scheduled pickup date.
 * - When the pickup date begins (00:00:00 in application timezone), if still unpaid, booking must be cancelled.
 */

// Application business timezone (default: Asia/Kolkata / UTC+05:30)
export const APP_TIMEZONE = process.env.APP_TIMEZONE || 'Asia/Kolkata';

/**
 * Returns a Date object representing the start of day (00:00:00.000) for a given date in business timezone
 * @param {Date|string} dateInput 
 * @returns {Date}
 */
export const getStartOfDayInAppTimezone = (dateInput) => {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) {
        throw new Error("Invalid date provided for timezone calculation");
    }

    // Format into ISO year-month-day in the configured timezone
    const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: APP_TIMEZONE,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
    
    const parts = formatter.formatToParts(d);
    const year = parts.find(p => p.type === 'year').value;
    const month = parts.find(p => p.type === 'month').value;
    const day = parts.find(p => p.type === 'day').value;

    // Construct start of day UTC string based on timezone offset
    // To be strictly consistent: pickup day starts at 00:00:00.000 local time
    const localMidnightString = `${year}-${month}-${day}T00:00:00.000`;
    
    // Parse in app timezone
    const tempDate = new Date(`${year}-${month}-${day}T00:00:00.000Z`);
    // Adjust by timezone offset difference
    const tzOffsetMs = getTimezoneOffsetMs(APP_TIMEZONE, tempDate);
    return new Date(tempDate.getTime() - tzOffsetMs);
};

/**
 * Calculates the exact payment deadline (23:59:59.999 of the day before pickup)
 * @param {Date|string} pickupDateInput 
 * @returns {Date}
 */
export const calculatePaymentDeadline = (pickupDateInput) => {
    const pickupStart = getStartOfDayInAppTimezone(pickupDateInput);
    // Deadline is 1 millisecond before pickup day starts
    return new Date(pickupStart.getTime() - 1);
};

/**
 * Checks if the payment deadline for a booking has expired
 * @param {Date|string} pickupDate 
 * @param {Date|string} [paymentDeadline] 
 * @param {Date} [currentTime] 
 * @returns {boolean}
 */
export const isDeadlineExpired = (pickupDate, paymentDeadline, currentTime = new Date()) => {
    const now = currentTime.getTime();
    if (paymentDeadline) {
        const deadlineTime = new Date(paymentDeadline).getTime();
        if (!isNaN(deadlineTime) && now > deadlineTime) {
            return true;
        }
    }
    
    // Fallback: check if pickup day has started in business timezone
    const pickupStart = getStartOfDayInAppTimezone(pickupDate).getTime();
    return now >= pickupStart;
};

/**
 * Formats a deadline for customer UI presentation in business timezone
 * @param {Date|string} deadline 
 * @returns {string}
 */
export const formatDeadlineForDisplay = (deadline) => {
    const d = new Date(deadline);
    if (isNaN(d.getTime())) return '';
    return new Intl.DateTimeFormat('en-IN', {
        timeZone: APP_TIMEZONE,
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(d);
};

/**
 * Internal helper to compute timezone offset in milliseconds for an arbitrary IANA timezone
 */
function getTimezoneOffsetMs(timeZone, date) {
    const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
    const tzDate = new Date(date.toLocaleString('en-US', { timeZone }));
    return tzDate.getTime() - utcDate.getTime();
}
