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
};
