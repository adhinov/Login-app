import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async (to, subject, html) => {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });

    if (error) {
      console.error("Email error:", error);
      return false;
    }

    console.log("Email sent:", data);
    return true;
  } catch (err) {
    console.error("Email exception:", err);
    return false;
  }
};
