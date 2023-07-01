import User from "../database/model/User";
import jsonwebtoken from "jsonwebtoken";

export default async function generateToken(email: string) {
  const user = await User.findOne({
    email: email.toLowerCase(),
  });

  if (!user) {
    return "-1";
  }

  const ActivationKey = jsonwebtoken.sign(email, "epicgames");
  user.activation_token = ActivationKey;
  user.save();
  return ActivationKey;
}
