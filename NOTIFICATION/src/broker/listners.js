const { subscribeToQueue } = require("./broker");
const { sendEmail } = require("../email");

module.exports = function () {
  subscribeToQueue("AUTH_NOTIFICATION.USER_CREATED", async (data) => {
    const emailHTMLTemplate = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Welcome to AIMart</title>
  </head>
  <body
    style="
      margin: 0;
      padding: 0;
      background-color: #f3f4f6;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    "
  >
    <table
      role="presentation"
      style="
        width: 100%;
        border-collapse: collapse;
        background-color: #f3f4f6;
        padding: 20px 0;
      "
    >
      <tr>
        <td align="center">
          <table
            role="presentation"
            style="
              width: 90%;
              max-width: 600px;
              background-color: #ffffff;
              border-radius: 10px;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
              overflow: hidden;
            "
          >
            <!-- Header -->
            <tr>
              <td
                style="
                  background: linear-gradient(135deg, #6366f1, #8b5cf6);
                  color: white;
                  text-align: center;
                  padding: 25px 0;
                "
              >
                <h1 style="margin: 0; font-size: 28px; letter-spacing: 1px;">
                  Welcome to AIMart 👋
                </h1>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding: 30px; color: #374151;">
                <p style="font-size: 18px; margin: 0 0 10px 0;">
                  Hi <strong>${data.fullName.firstName} ${data.fullName.lastName}</strong>,
                </p>

                <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                  We're excited to welcome you to <strong>AIMart</strong> — your AI-powered
                  digital marketplace built to simplify and empower your experience.
                </p>

                <p style="font-size: 16px; line-height: 1.6;">
                  You can explore a variety of AI tools, products, and resources designed
                  to make your digital journey smarter and faster.
                </p>

                <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
                  If you didn’t create this account, please contact with us.
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td
                style="
                  background-color: #f9fafb;
                  text-align: center;
                  padding: 15px 10px;
                  font-size: 13px;
                  color: #9ca3af;
                "
              >
                <p style="margin: 0;">&copy; 2025 AIMart. All rights reserved.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;

    console.log("run");

    await sendEmail(
      data.email,
      "Welcome to AIMart 🎉",
      "Thank you for registering with us",
      emailHTMLTemplate
    );
  });

  subscribeToQueue("PAYMENT_NOTIFICATION.PAYMENT_INITIATED", async (data) => {
    const emailHTMLTemplate = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Payment Initiated</title>
    <style>
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background-color: #f4f6f8;
        margin: 0;
        padding: 0;
      }
      .email-container {
        max-width: 600px;
        background: #ffffff;
        margin: 40px auto;
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 0 4px 10px rgba(0,0,0,0.08);
      }
      .header {
        background: linear-gradient(135deg, #2563eb, #06b6d4);
        color: white;
        text-align: center;
        padding: 25px 10px;
      }
      .header h1 {
        margin: 0;
        font-size: 22px;
      }
      .content {
        padding: 25px 30px;
        color: #333;
      }
      .content h2 {
        color: #2563eb;
        margin-top: 0;
      }
      .highlight-box {
        background: #f0f7ff;
        border-left: 4px solid #2563eb;
        padding: 12px 16px;
        margin: 15px 0;
        border-radius: 5px;
      }
      .highlight-box p {
        margin: 6px 0;
        font-size: 15px;
      }
      .footer {
        background-color: #f9fafb;
        text-align: center;
        padding: 15px;
        font-size: 13px;
        color: #777;
      }
    </style>
  </head>
  <body>
    <div class="email-container">
      <div class="header">
        <h1>💳 Payment Initiated</h1>
      </div>
      <div class="content">
        <h2>Hello ${data.username},</h2>
        <p>We’ve received your payment request. Here are the details:</p>

        <div class="highlight-box">
          <p><strong>Amount:</strong> ${data.currency} ${data.amount}</p>
          <p><strong>Order ID:</strong> ${data.orderId}</p>
        </div>

        <p>Your payment is currently being processed. We’ll notify you once the transaction is successfully completed.</p>

        <p style="margin-top: 25px;">Thank you for choosing <strong>AI Mart</strong>!</p>
      </div>
      <div class="footer">
        <p>© ${new Date().getFullYear()} AI Mart. All rights reserved.</p>
      </div>
    </div>
  </body>
  </html>
  `;

    await sendEmail(
      data.email,
      "💳 Payment Initiated",
      "Your payment is being processed",
      emailHTMLTemplate
    );
  });

  subscribeToQueue("PAYMENT_NOTIFICATION.PAYMENT_COMPLETED", async (data) => {
    const emailHTMLTemplate = `
        <h1>Payment Successful!</h1>
        <p>Dear ${data.username},</p>
        <p>We have received your payment of ${data.currency} ${data.amount} for the order ID: ${data.orderId}.</p>
        <p>Thank you for your purchase!</p>
        <p>Best regards,<br/>The Team</p>
        `;
    await sendEmail(
      data.email,
      "Payment Successful",
      "We have received your payment",
      emailHTMLTemplate
    );
  });

  subscribeToQueue("PAYMENT_NOTIFICATION.PAYMENT_FAILED", async (data) => {
    const emailHTMLTemplate = `
        <h1>Payment Failed</h1>
        <p>Dear ${data.username},</p>
        <p>Unfortunately, your payment for the order ID: ${data.orderId} has failed.</p>
        <p>Please try again or contact support if the issue persists.</p>
        <p>Best regards,<br/>The Team</p>
        `;
    await sendEmail(
      data.email,
      "Payment Failed",
      "Your payment could not be processed",
      emailHTMLTemplate
    );
  });

  subscribeToQueue("PRODUCT_NOTIFICATION.PRODUCT_CREATED", async (data) => {
    const emailHTMLTemplate = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>New Product Created</title>
    <style>
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background-color: #f4f6f8;
        margin: 0;
        padding: 0;
      }
      .email-container {
        max-width: 600px;
        background: #ffffff;
        margin: 40px auto;
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 0 4px 10px rgba(0,0,0,0.1);
      }
      .header {
        background: linear-gradient(135deg, #4f46e5, #06b6d4);
        color: white;
        text-align: center;
        padding: 25px 10px;
      }
      .header h1 {
        margin: 0;
        font-size: 22px;
      }
      .content {
        padding: 25px 30px;
        color: #333;
      }
      .content h2 {
        color: #4f46e5;
        margin-top: 0;
      }
      .btn {
        display: inline-block;
        padding: 10px 18px;
        margin-top: 15px;
        background: #4f46e5;
        color: white;
        text-decoration: none;
        border-radius: 6px;
        font-weight: 500;
      }
      .footer {
        background-color: #f1f5f9;
        text-align: center;
        padding: 15px;
        font-size: 13px;
        color: #777;
      }
    </style>
  </head>
  <body>
    <div class="email-container">
      <div class="header">
        <h1>🎉 Product Created Successfully!</h1>
      </div>
      <div class="content">
        <h2>Hello ${data.username},</h2>
        <p>Congratulations! You’ve just created a new product in your dashboard. 🎊</p>
        <p>Take a quick look to make sure everything looks perfect.</p>
        <a href="http://localhost:3001/api/products/${
          data.productId
        }" class="btn" target="_blank">View Product</a>
        <p style="margin-top: 25px;">Thank you for using <strong>AI Mart</strong>!</p>
      </div>
      <div class="footer">
        <p>© ${new Date().getFullYear()} AI Mart. All rights reserved.</p>
      </div>
    </div>
  </body>
  </html>
  `;

    await sendEmail(
      data.email,
      "🎉 Your Product Has Been Created!",
      "Check out your new product",
      emailHTMLTemplate
    );
  });
};
