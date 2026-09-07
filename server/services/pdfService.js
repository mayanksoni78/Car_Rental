import PDFDocument from 'pdfkit';

export const generateBookingReceipt = async (booking) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50 });
            const buffers = [];

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });

            // Company Header
            doc.fontSize(20).text('CAR RENTAL', { align: 'center' });
            doc.fontSize(10).text('Rental Receipt', { align: 'center' });
            doc.moveDown();

            // Booking Information
            doc.fontSize(14).text('Booking Information');
            doc.fontSize(10);
            doc.text(`Booking ID: ${booking._id}`);
            doc.text(`Booking Status: ${booking.status.toUpperCase()}`);
            doc.text(`Booking Date: ${new Date(booking.createdAt).toLocaleDateString()}`);
            doc.text(`Pickup Date: ${new Date(booking.pickupDate).toLocaleDateString()}`);
            doc.text(`Return Date: ${new Date(booking.returnDate).toLocaleDateString()}`);
            
            const days = Math.ceil((new Date(booking.returnDate) - new Date(booking.pickupDate)) / (1000 * 60 * 60 * 24));
            doc.text(`Rental Duration: ${days} days`);
            doc.moveDown();

            // Customer Information
            doc.fontSize(14).text('Customer Information');
            doc.fontSize(10);
            doc.text(`Name: ${booking.user.name}`);
            doc.text(`Email: ${booking.user.email}`);
            if (booking.user.phone_no) doc.text(`Phone: ${booking.user.phone_no}`);
            doc.moveDown();

            // Vehicle Information
            doc.fontSize(14).text('Vehicle Information');
            doc.fontSize(10);
            doc.text(`Brand & Model: ${booking.car.brand} ${booking.car.model}`);
            doc.text(`Registration Number: ${booking.car.number}`);
            doc.text(`Category: ${booking.car.category}`);
            doc.text(`Transmission: ${booking.car.transmission}`);
            doc.text(`Fuel Type: ${booking.car.fuel_type}`);
            doc.moveDown();

            // Pricing
            doc.fontSize(14).text('Rental Pricing');
            doc.fontSize(10);
            doc.text(`Price per day: Rs ${booking.car.pricePerDay}`);
            doc.text(`Base rental amount: Rs ${booking.price}`);
            doc.text(`--------------------------------`);
            doc.text(`Final amount: Rs ${booking.price}`);
            doc.moveDown();

            // Payment Information
            doc.fontSize(14).text('Payment Information');
            doc.fontSize(10);
            doc.text(`Payment Status: ${booking.paymentStatus.toUpperCase()}`);
            if (booking.paymentId) doc.text(`Payment ID: ${booking.paymentId}`);
            
            if (booking.paymentStatus === 'paid') {
                doc.text(`Amount Paid: Rs ${booking.price}`);
            } else {
                doc.text(`Amount Due: Rs ${booking.price}`);
            }

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};
