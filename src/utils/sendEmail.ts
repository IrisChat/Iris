import nodemailer from "nodemailer";

export default async function sendEmail(
  email: string,
  subject: string,
  body: string | null,
  html_body: string | null | void
): Promise<void> {
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: "irischat.mailservie@gmail.com",
      pass: process.env.MAIL_PASSWORD || "unset",
    },
  });

  const genericText = body || "";
  let info = await transporter.sendMail({
    from: '"Iris Chat (Messaging Service)" <iris@iris-api.fly.dev>',
    to: email,
    subject,
    text: genericText || "",
    html: html_body || genericText || "",
  });
}
