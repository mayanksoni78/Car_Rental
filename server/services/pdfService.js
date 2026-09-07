import PDFDocument from 'pdfkit';

/**
 * Generates a high-quality, commercial car-rental receipt / tax invoice.
 * @param {Object} booking Populated booking document with car and user.
 * @returns {Promise<Buffer>} PDF binary buffer
 */
export const generateBookingReceipt = async (booking) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ 
                size: 'A4', 
                margin: 40,
                info: {
                    Title: `CarRental_Invoice_${booking._id}`,
                    Author: 'Car Rental Fleet Services',
                    Subject: 'Official Rental Receipt & Tax Invoice'
                }
            });

            const buffers = [];
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });

            const pageWidth = 595.28; // Standard A4 width in points
            const contentWidth = pageWidth - 80;
            const leftMargin = 40;

            // --- HEADER SECTION ---
            // Top Accent Bar
            doc.rect(leftMargin, 35, contentWidth, 3).fill('#0f766e'); // Teal accent

            // Brand Title
            doc.fillColor('#0f172a')
               .fontSize(18)
               .font('Helvetica-Bold')
               .text('CAR RENTAL FLEET', leftMargin, 50);

            doc.fillColor('#64748b')
               .fontSize(9)
               .font('Helvetica')
               .text('Official Rental Itinerary & Tax Receipt', leftMargin, 72);

            // Right-aligned Invoice metadata
            const invoiceDate = booking.createdAt ? new Date(booking.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : new Date().toLocaleDateString('en-IN');
            
            doc.fillColor('#334155')
               .fontSize(9)
               .font('Helvetica-Bold')
               .text(`RECEIPT REF:`, 360, 50, { width: 195, align: 'right' });
            
            doc.fillColor('#0f172a')
               .font('Helvetica')
               .text(`BKG-${booking._id.toString().toUpperCase()}`, 360, 62, { width: 195, align: 'right' });

            doc.fillColor('#64748b')
               .text(`Issued: ${invoiceDate}`, 360, 74, { width: 195, align: 'right' });

            // Payment Status Badge Box
            const isPaid = (booking.paymentStatus || '').toLowerCase() === 'paid';
            const badgeBg = isPaid ? '#dcfce7' : '#fef3c7';
            const badgeText = isPaid ? '#15803d' : '#b45309';
            const badgeLabel = isPaid ? 'PAYMENT: PAID' : 'PAYMENT: PENDING';

            doc.roundedRect(445, 90, 110, 18, 3).fill(badgeBg);
            doc.fillColor(badgeText)
               .fontSize(8)
               .font('Helvetica-Bold')
               .text(badgeLabel, 445, 95, { width: 110, align: 'center' });

            // Separator line
            doc.moveTo(leftMargin, 115).lineTo(leftMargin + contentWidth, 115).strokeColor('#e2e8f0').lineWidth(1).stroke();

            // --- CUSTOMER & SCHEDULE INFO (TWO COLUMNS) ---
            const colY = 125;
            const colWidth = (contentWidth - 20) / 2;

            // Column 1: Renter Information
            doc.roundedRect(leftMargin, colY, colWidth, 75, 4).fillAndStroke('#f8fafc', '#e2e8f0');
            doc.fillColor('#0f766e').fontSize(9).font('Helvetica-Bold').text('RENTER DETAILS', leftMargin + 12, colY + 10);
            
            doc.fillColor('#0f172a').fontSize(9).font('Helvetica-Bold').text(booking.user?.name || 'Valued Customer', leftMargin + 12, colY + 26);
            doc.fillColor('#475569').font('Helvetica').fontSize(8.5).text(`Email: ${booking.user?.email || 'N/A'}`, leftMargin + 12, colY + 40);
            if (booking.user?.phone_no) {
                doc.text(`Phone: ${booking.user.phone_no}`, leftMargin + 12, colY + 54);
            } else {
                doc.text('Phone: Verified on File', leftMargin + 12, colY + 54);
            }

            // Column 2: Rental Itinerary
            const col2X = leftMargin + colWidth + 20;
            doc.roundedRect(col2X, colY, colWidth, 75, 4).fillAndStroke('#f8fafc', '#e2e8f0');
            doc.fillColor('#0f766e').fontSize(9).font('Helvetica-Bold').text('RENTAL SCHEDULE', col2X + 12, colY + 10);

            const pickupStr = booking.pickupDate ? new Date(booking.pickupDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A';
            const returnStr = booking.returnDate ? new Date(booking.returnDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A';
            const diffDays = Math.max(1, Math.ceil((new Date(booking.returnDate) - new Date(booking.pickupDate)) / (1000 * 60 * 60 * 24))) || 1;

            doc.fillColor('#475569').fontSize(8.5).font('Helvetica')
               .text(`Pick-up: `, col2X + 12, colY + 26, { continued: true })
               .font('Helvetica-Bold').fillColor('#0f172a').text(pickupStr);

            doc.font('Helvetica').fillColor('#475569')
               .text(`Return: `, col2X + 12, colY + 40, { continued: true })
               .font('Helvetica-Bold').fillColor('#0f172a').text(returnStr);

            doc.font('Helvetica').fillColor('#475569')
               .text(`Duration: `, col2X + 12, colY + 54, { continued: true })
               .font('Helvetica-Bold').fillColor('#0f766e').text(`${diffDays} Rental Day(s)`);

            // --- VEHICLE DETAILS BLOCK ---
            const vehY = 210;
            doc.roundedRect(leftMargin, vehY, contentWidth, 68, 4).fillAndStroke('#f1f5f9', '#cbd5e1');
            doc.fillColor('#0f766e').fontSize(9).font('Helvetica-Bold').text('ASSIGNED VEHICLE SPECIFICATIONS', leftMargin + 12, vehY + 10);

            const carBrand = booking.car?.brand || 'Fleet Vehicle';
            const carModel = booking.car?.model || '';
            const carCategory = booking.car?.category || 'Standard';
            const carReg = booking.car?.number || 'Verified Plate';
            const carFuel = booking.car?.fuel_type || 'Petrol';
            const carTrans = booking.car?.transmission || 'Automatic';
            const carSeats = booking.car?.seating_capacity || 5;

            doc.fillColor('#0f172a').fontSize(11).font('Helvetica-Bold').text(`${carBrand} ${carModel}`, leftMargin + 12, vehY + 26);
            doc.fillColor('#64748b').fontSize(8.5).font('Helvetica').text(`Category: ${carCategory} | Registration: ${carReg}`, leftMargin + 12, vehY + 40);
            doc.text(`Fuel: ${carFuel} | Transmission: ${carTrans} | Capacity: ${carSeats} Passengers`, leftMargin + 12, vehY + 52);

            // --- FINANCIAL BREAKDOWN TABLE ---
            const tableY = 290;
            doc.roundedRect(leftMargin, tableY, contentWidth, 22, 2).fill('#0f172a');
            doc.fillColor('#ffffff').fontSize(8.5).font('Helvetica-Bold');
            doc.text('DESCRIPTION / ITEM', leftMargin + 10, tableY + 6);
            doc.text('QTY / DAYS', 290, tableY + 6, { width: 70, align: 'center' });
            doc.text('DAILY RATE', 370, tableY + 6, { width: 80, align: 'right' });
            doc.text('AMOUNT (INR)', 460, tableY + 6, { width: 85, align: 'right' });

            let currentY = tableY + 26;
            const pricePerDay = booking.car?.pricePerDay || (booking.price / diffDays);
            const baseTotal = booking.price || (diffDays * pricePerDay);

            // Row 1: Vehicle Rental
            doc.fillColor('#0f172a').fontSize(8.5).font('Helvetica-Bold')
               .text(`Vehicle Rental: ${carBrand} ${carModel}`, leftMargin + 10, currentY);
            doc.font('Helvetica').fillColor('#475569')
               .text(`${diffDays} Days`, 290, currentY, { width: 70, align: 'center' })
               .text(`INR ${pricePerDay.toLocaleString('en-IN')}`, 370, currentY, { width: 80, align: 'right' })
               .text(`INR ${baseTotal.toLocaleString('en-IN')}`, 460, currentY, { width: 85, align: 'right' });

            currentY += 20;
            doc.moveTo(leftMargin, currentY).lineTo(leftMargin + contentWidth, currentY).strokeColor('#f1f5f9').stroke();
            currentY += 8;

            // Row 2: Comprehensive Protection
            doc.fillColor('#0f172a').fontSize(8.5).font('Helvetica')
               .text('Comprehensive Protection & Breakdown Assistance', leftMargin + 10, currentY);
            doc.fillColor('#16a34a')
               .text('INCLUDED', 460, currentY, { width: 85, align: 'right' });

            currentY += 20;
            doc.moveTo(leftMargin, currentY).lineTo(leftMargin + contentWidth, currentY).strokeColor('#f1f5f9').stroke();
            currentY += 8;

            // Row 3: Applicable Taxes & Dispatch
            doc.fillColor('#0f172a').fontSize(8.5).font('Helvetica')
               .text('Applicable Taxes & Fleet Station Dispatch', leftMargin + 10, currentY);
            doc.fillColor('#16a34a')
               .text('INR 0.00', 460, currentY, { width: 85, align: 'right' });

            currentY += 24;
            doc.moveTo(leftMargin, currentY).lineTo(leftMargin + contentWidth, currentY).strokeColor('#cbd5e1').lineWidth(1).stroke();
            currentY += 10;

            // TOTAL HIGHLIGHT BOX
            doc.roundedRect(320, currentY, 235, 40, 4).fillAndStroke('#042f2e', '#0f766e');
            doc.fillColor('#99f6e4').fontSize(8.5).font('Helvetica-Bold').text('TOTAL SETTLEMENT (INR)', 332, currentY + 8);
            doc.fillColor('#ffffff').fontSize(16).font('Helvetica-Bold').text(`INR ${baseTotal.toLocaleString('en-IN')}`, 332, currentY + 20, { width: 210, align: 'left' });

            currentY += 55;

            // --- PAYMENT & AUDIT INFO ---
            doc.roundedRect(leftMargin, currentY, contentWidth, 60, 4).fillAndStroke('#f8fafc', '#e2e8f0');
            doc.fillColor('#0f766e').fontSize(9).font('Helvetica-Bold').text('TRANSACTION & PAYMENT RECORD', leftMargin + 12, currentY + 10);

            const isOnline = booking.paymentId && booking.paymentId !== 'PAY_LATER';
            const payMethodStr = isOnline ? 'Online Gateway (Razorpay)' : 'Pay at Pick-Up (Key Handover)';
            const payIdStr = booking.paymentId || 'N/A';

            doc.fillColor('#475569').fontSize(8).font('Helvetica')
               .text(`Payment Mode: ${payMethodStr}`, leftMargin + 12, currentY + 26)
               .text(`Transaction / Gateway ID: ${payIdStr}`, leftMargin + 12, currentY + 38)
               .text(`Booking Status: ${(booking.status || 'Confirmed').toUpperCase()}`, 330, currentY + 26)
               .text(`Settlement Status: ${(booking.paymentStatus || 'Pending').toUpperCase()}`, 330, currentY + 38);

            // --- FOOTER & DISCLAIMER ---
            const footerY = 730;
            doc.moveTo(leftMargin, footerY).lineTo(leftMargin + contentWidth, footerY).strokeColor('#e2e8f0').lineWidth(0.8).stroke();

            doc.fillColor('#64748b').fontSize(7.5).font('Helvetica')
               .text('Operator Notice: All drivers must present an active, government-recognized Light Motor Vehicle (LMV) driving license upon vehicle collection.', leftMargin, footerY + 10, { width: contentWidth, align: 'center' })
               .text('Need Assistance? 24/7 Roadside & Fleet Dispatch Support | Email: support@carrentalfleet.com', leftMargin, footerY + 24, { width: contentWidth, align: 'center' })
               .text('Thank you for choosing Car Rental Fleet Services. This is an electronically verified commercial rental invoice.', leftMargin, footerY + 38, { width: contentWidth, align: 'center' });

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};
