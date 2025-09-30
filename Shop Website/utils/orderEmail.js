const nodemailer = require('nodemailer');

// Create email transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/**
 * Send order confirmation email
 * @param {string} toEmail - Customer email
 * @param {object} order - Order object with items and customerInfo
 */
async function sendOrderConfirmationEmail(toEmail, order) {
  try {
    // Ensure items is always an array
    const items = Array.isArray(order.items) ? order.items : [];

    // Generate items HTML safely
    const itemsHtml = items.map(item => {
      const name = item.name || item.productId?.name || 'Unnamed Product';
      const quantity = item.quantity || 1;
      const price = (item.price != null ? item.price : 0).toFixed(2);
      return `<li>${name} x ${quantity} - $${price}</li>`;
    }).join('');

    // Generate total safely
    const totalAmount = order.total != null ? order.total.toFixed(2) : '0.00';

    // Demo tracking link
    const trackingLink = `http://demo-logistics.com/track/${order.orderNumber || 'N/A'}`;

    // Compose email
    const mailOptions = {
      to: toEmail,
      subject: `Order Confirmation - ${order.orderNumber || 'N/A'}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Thank you for your order!</h2>
          <p>Dear ${order.customerInfo?.firstName || 'Customer'},</p>
          <p>Your order <strong>${order.orderNumber || 'N/A'}</strong> has been successfully placed.</p>
          <h3>Order Details:</h3>
          <ul>${itemsHtml}</ul>
          <p><strong>Total:</strong> $${totalAmount}</p>
          <p>You can track your shipment using the following link (demo):</p>
          <p><a href="${trackingLink}">${trackingLink}</a></p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #777; font-size: 12px;">This is an automated message from MystiKraft. Please do not reply.</p>
        </div>
      `
    };

    // Send email
    await transporter.sendMail(mailOptions);
    console.log(`Order confirmation email sent to ${toEmail}`);
  } catch (error) {
    console.error('Failed to send confirmation email:', error);
  }
}

module.exports = { sendOrderConfirmationEmail };
