import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useAuth } from "@/hooks/use-auth";
import {
  ArrowRight,
  Loader2,
  Mail,
  Eye,
  EyeOff,
  User,
  Shield,
} from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";

interface AuthProps {
  redirectAfterAuth?: string;
}

// Demo credentials
const DEMO_USERS: Record<string, { password: string; name: string; role: string }> = {
  "admin@pulseflow.ai": { password: "admin123", name: "System Admin", role: "Administrator" },
  "ops@pulseflow.ai": { password: "ops123", name: "ED Operations Manager", role: "Operations" },
  "capacity@pulseflow.ai": { password: "capacity123", name: "Capacity Coordinator", role: "Capacity" },
  "demo@pulseflow.ai": { password: "demo", name: "Demo User", role: "Viewer" },
};

function resolveRedirectAfterAuth(
  returnTo: string | null,
  fallback = "/dashboard",
) {
  if (returnTo?.startsWith("/") && !returnTo.startsWith("//")) {
    return returnTo;
  }
  return fallback;
}

type AuthStep =
  | "choose"
  | "password"
  | "otp"
  | "otp-verify"
  | "google"
  | "microsoft";

function Auth({ redirectAfterAuth }: AuthProps = {}) {
  const { isLoading: authLoading, isAuthenticated, signIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = resolveRedirectAfterAuth(
    searchParams.get("returnTo"),
    redirectAfterAuth,
  );

  const [step, setStep] = useState<AuthStep>("choose");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpEmail, setOtpEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate(redirect);
    }
  }, [authLoading, isAuthenticated, navigate, redirect]);

  // ---- Password login ----
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const user = DEMO_USERS[email.toLowerCase()];
    if (user && user.password === password) {
      // Store session locally
      localStorage.setItem(
        "pulseflow_session",
        JSON.stringify({ email, name: user.name, role: user.role, ts: Date.now() }),
      );
      // Use anonymous sign-in for Convex (local demo)
      try {
        await signIn("anonymous");
      } catch {
        // If Convex auth fails, still navigate (local session is enough)
      }
      navigate(redirect);
    } else {
      setError("Invalid email or password. Try demo@pulseflow.ai / demo");
      setIsLoading(false);
    }
  };

  // ---- OTP flow (local simulation) ----
  const handleOtpSend = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    // Simulate sending OTP locally — store a fixed code for demo
    const demoCode = "123456";
    localStorage.setItem("pulseflow_otp", demoCode);
    localStorage.setItem("pulseflow_otp_email", email);
    setOtpEmail(email);
    setStep("otp-verify");
    setIsLoading(false);
  };

  const handleOtpVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    const stored = localStorage.getItem("pulseflow_otp");
    if (otp === stored) {
      localStorage.removeItem("pulseflow_otp");
      localStorage.removeItem("pulseflow_otp_email");
      localStorage.setItem(
        "pulseflow_session",
        JSON.stringify({ email: otpEmail, name: otpEmail.split("@")[0], role: "Viewer", ts: Date.now() }),
      );
      try {
        signIn("anonymous");
      } catch {
        // Continue
      }
      navigate(redirect);
    } else {
      setError("Incorrect code. For demo, use 123456.");
      setIsLoading(false);
      setOtp("");
    }
  };

  // ---- OAuth stubs (simulate locally) ----
  const handleOAuth = async (provider: "google" | "microsoft") => {
    setIsLoading(true);
    setError(null);
    // Simulate OAuth flow locally
    await new Promise((r) => setTimeout(r, 800));
    const name = provider === "google" ? "Google User" : "Microsoft User";
    const emailAddr = provider === "google" ? "user@gmail.com" : "user@outlook.com";
    localStorage.setItem(
      "pulseflow_session",
      JSON.stringify({ email: emailAddr, name, role: "Viewer", ts: Date.now(), provider }),
    );
    try {
      await signIn("anonymous");
    } catch {
      // Continue
    }
    navigate(redirect);
  };

  // ---- Guest ----
  const handleGuest = async () => {
    setIsLoading(true);
    setError(null);
    localStorage.setItem(
      "pulseflow_session",
      JSON.stringify({ email: "guest@pulseflow.ai", name: "Guest", role: "Viewer", ts: Date.now(), guest: true }),
    );
    try {
      await signIn("anonymous");
    } catch {
      // Continue
    }
    navigate(redirect);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          {/* Brand */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
            </div>
            <h1 className="text-2xl font-[family-name:var(--font-playfair)] font-bold">
              pulseflow.ai
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Capacity Intelligence Platform
            </p>
          </div>

          <Card className="border shadow-sm">
            {step === "choose" && (
              <>
                <CardHeader className="text-center">
                  <CardTitle className="text-lg">Sign In</CardTitle>
                  <CardDescription>
                    Authorized personnel only. Choose a sign-in method.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* OAuth buttons */}
                  <button
                    onClick={() => handleOAuth("google")}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-lg border border-border bg-card hover:bg-accent/5 transition-colors text-sm font-medium cursor-pointer disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Continue with Google
                  </button>

                  <button
                    onClick={() => handleOAuth("microsoft")}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-lg border border-border bg-card hover:bg-accent/5 transition-colors text-sm font-medium cursor-pointer disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 21 21">
                      <rect x="1" y="1" width="9" height="9" fill="#F25022"/>
                      <rect x="11" y="1" width="9" height="9" fill="#7FBA00"/>
                      <rect x="1" y="11" width="9" height="9" fill="#00A4EF"/>
                      <rect x="11" y="11" width="9" height="9" fill="#FFB900"/>
                    </svg>
                    Continue with Microsoft
                  </button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">
                        or
                      </span>
                    </div>
                  </div>

                  {/* Email + Password form */}
                  <form onSubmit={handlePasswordLogin} className="space-y-3">
                    <div>
                      <Label htmlFor="email" className="text-xs">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="password" className="text-xs">Password</Label>
                      <div className="relative mt-1">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          disabled={isLoading}
                          required
                          className="pr-9"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    {error && (
                      <p className="text-sm text-destructive">{error}</p>
                    )}
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <ArrowRight className="w-4 h-4 mr-2" />
                      )}
                      Sign In
                    </Button>
                  </form>

                  {/* OTP option */}
                  <div className="text-center">
                    <button
                      onClick={() => { setStep("otp"); setError(null); }}
                      className="text-xs text-accent hover:underline cursor-pointer"
                    >
                      Sign in with a one-time code instead
                    </button>
                  </div>

                  {/* Guest */}
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleGuest}
                    disabled={isLoading}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Continue as Guest
                  </Button>

                  {/* Demo hint */}
                  <div className="p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground text-center">
                    <p className="font-medium text-foreground/70 mb-1">Demo Credentials</p>
                    <p>demo@pulseflow.ai / demo</p>
                    <p>admin@pulseflow.ai / admin123</p>
                  </div>
                </CardContent>
              </>
            )}

            {step === "otp" && (
              <>
                <CardHeader className="text-center">
                  <CardTitle className="text-lg">One-Time Code</CardTitle>
                  <CardDescription>
                    Enter your email and we will send you a verification code.
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleOtpSend}>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="otp-email" className="text-xs">Email</Label>
                      <div className="relative mt-1">
                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="otp-email"
                          type="email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-9"
                          disabled={isLoading}
                          required
                        />
                      </div>
                    </div>
                    {error && (
                      <p className="text-sm text-destructive">{error}</p>
                    )}
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Mail className="w-4 h-4 mr-2" />
                      )}
                      Send Code
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full"
                      onClick={() => { setStep("choose"); setError(null); }}
                    >
                      Back to sign-in
                    </Button>
                  </CardContent>
                </form>
              </>
            )}

            {step === "otp-verify" && (
              <>
                <CardHeader className="text-center">
                  <CardTitle className="text-lg">Enter Code</CardTitle>
                  <CardDescription>
                    A code was sent to {otpEmail}. For this demo, use <strong>123456</strong>.
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleOtpVerify}>
                  <CardContent className="space-y-4">
                    <div className="flex justify-center">
                      <InputOTP
                        value={otp}
                        onChange={setOtp}
                        maxLength={6}
                        disabled={isLoading}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && otp.length === 6 && !isLoading) {
                            const form = (e.target as HTMLElement).closest("form");
                            if (form) form.requestSubmit();
                          }
                        }}
                      >
                        <InputOTPGroup>
                          {Array.from({ length: 6 }).map((_, i) => (
                            <InputOTPSlot key={i} index={i} />
                          ))}
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                    {error && (
                      <p className="text-sm text-destructive text-center">{error}</p>
                    )}
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading || otp.length !== 6}
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <ArrowRight className="w-4 h-4 mr-2" />
                      )}
                      Verify Code
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full"
                      onClick={() => { setStep("choose"); setError(null); setOtp(""); }}
                    >
                      Back to sign-in
                    </Button>
                  </CardContent>
                </form>
              </>
            )}

            {/* Footer */}
            <div className="py-3 px-6 text-xs text-center text-muted-foreground bg-muted border-t rounded-b-lg">
              Secured by pulseflow.ai
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage(props: AuthProps) {
  return (
    <Suspense>
      <Auth {...props} />
    </Suspense>
  );
}
