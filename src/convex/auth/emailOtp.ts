import { Email } from "@convex-dev/auth/providers/Email";
import { RandomReader, generateRandomString } from "@oslojs/crypto/random";

export const emailOtp = Email({
  id: "email-otp",
  maxAge: 60 * 15, // 15 minutes
  // This function can be asynchronous
  async generateVerificationToken() {
    const random: RandomReader = {
      read(bytes: Uint8Array) {
        crypto.getRandomValues(bytes);
      },
    };
    const alphabet = "0123456789";
    return generateRandomString(random, alphabet, 6);
  },
  async sendVerificationRequest({ identifier: email, token }) {
    // Local OTP delivery — logs the code to console for demo purposes
    console.log(`[pulseflow.ai] OTP for ${email}: ${token}`);
    // Store in localStorage for the Auth page to verify locally
    if (typeof window !== "undefined") {
      localStorage.setItem("pulseflow_otp", token);
      localStorage.setItem("pulseflow_otp_email", email);
    }
  },
});
