// utils/sendEmail.js
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Kirim email menggunakan Resend
 * @param {string} to - alamat email tujuan
 * @param {string} subject - subjek email
 * @param {string} html - konten HTML email
 */
export const sendEmail = async (to, subject, html) => {
  try {
    const data = await resend.emails.send({
      from: "onboarding@resend.dev", // Ganti dengan domain yg sudah diverifikasi di Resend
      to,
      subject,
      html,
    });

    console.log("✅ Email terkirim ke:", to, "Resend ID:", data.id);
    return data;
  } catch (error) {
    console.error("❌ Gagal mengirim email:", error);
    throw error;
  }
};
