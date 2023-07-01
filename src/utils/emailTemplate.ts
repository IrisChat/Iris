import fs from "fs";
import path from "path";

export default function EmailTemplate(
  email_type: string,
  name: string | null,
  token: string | any
): void {
  let title,
    body,
    subtitle = "";
  switch (email_type) {
    case "ACTIVATE":
      const VerificationTemplate = fs.readFileSync(
        path.join(__dirname, "verify.html")
      );
      // These are used in the template ------------------------------------
      const VerificationLink = `https://iris-app.fly.dev/auth/verify?activation_token=${token}`;
      title = "";
      body =
        "In order finish creating your Iris account and help us verify that you're human, we need to verify your email address.";
      subtitle =
        "You're receiving this email because you recently created a new Iris account. If this wasn't you, please ignore this email.";
      // ---------------------------------------------------
      return eval("`" + VerificationTemplate.toString() + "`"); // Evaluate the template and return it

    case "PASSWORD_RESET":
      const PasswordTemplate = fs.readFileSync(
        path.join(__dirname, "reset.html")
      );
      // These are used in the template ------------------------------------
      title =
        "Hi, it seems as if you requested a password reset link. Here you go! Please do not share this link with anyone. If you did not request this email, please ignore it.";
      body = `<br/>
        <a href="https://iris-app.fly.dev/auth/reset?reset_token=${token}">https://iris-app.fly.dev/auth/reset?reset_token=${token}</a>`;
      subtitle = "";
      // ---------------------------------------------------
      return eval("`" + PasswordTemplate.toString() + "`"); // Evaluate the template and return it
  }
}
