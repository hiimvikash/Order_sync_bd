import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

// ✅ Create a single transporter instance
const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.FROM_EMAIL, // Load from environment variable
    pass: process.env.EMAIL_PASS, // Use App Password
  },
});

// ✅ Reusable function to send emails
export const sendMail = async (to: string[], subject: string, html: string) => {
  try {
    const mailOptions = {
      from: {
        name: "Needibay Support",
        address: process.env.FROM_EMAIL!,
      },
      to,
      subject,
      text:html,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("📧 Email sent:", info.messageId);
    return info;
  } catch (error: any) {
    console.error("❌ Error sending email:", error);
    // Detect invalid email (Response from SMTP)
    if (error.response && error.response.includes("550")) {
      return { success: false, message: "Invalid email address" };
    }
    throw new Error("Failed to send email");
  }
};
