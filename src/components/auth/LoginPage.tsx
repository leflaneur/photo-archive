import { useState } from 'react';
import { Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface LoginPageProps {
  onLogin: () => void;
}

export const LoginPage = ({ onLogin }: LoginPageProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    // Simulate login delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    onLogin();
  };

  return (
    <div className="min-h-screen bg-black flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:flex-1 relative overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-purple-500/10" />
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }} />

        <div className="relative z-10 flex flex-col justify-center px-12 lg:px-20">
          {/* Logo */}
          <div className="flex items-center gap-4 mb-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/40 to-primary/10 backdrop-blur-xl flex items-center justify-center border border-white/10 shadow-glow">
              <Camera className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-semibold text-white tracking-tight">Flaneur</h1>
              <p className="text-lg text-primary/80 font-medium">Photo Archive</p>
            </div>
          </div>

          {/* Tagline */}
          <div className="max-w-lg">
            <h2 className="text-5xl font-bold text-white mb-6 leading-[1.1] tracking-tight">
              Your personal digital asset management
            </h2>
            <p className="text-xl text-white/50 leading-relaxed">
              Organise, curate, and publish your photography collection. 
              From film scans to digital captures, all in one place.
            </p>
          </div>

          {/* Stats */}
          <div className="mt-16 flex gap-12">
            <div>
              <p className="text-4xl font-bold text-white">25,000+</p>
              <p className="text-sm text-white/40 mt-1">Images archived</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-white">1900s</p>
              <p className="text-sm text-white/40 mt-1">To present day</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-white">∞</p>
              <p className="text-sm text-white/40 mt-1">Possibilities</p>
            </div>
          </div>
        </div>

        {/* Decorative gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-black/40 to-transparent" />
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-b from-black to-zinc-950">
        <div className="w-full max-w-sm space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/40 to-primary/10 flex items-center justify-center border border-white/10">
              <Camera className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-white tracking-tight">Flaneur</h1>
              <p className="text-sm text-primary/80 font-medium">Photo Archive</p>
            </div>
          </div>

          {/* Welcome text */}
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-semibold text-white tracking-tight">Welcome back</h2>
            <p className="text-white/50 mt-3 text-lg">
              Sign in to access your photo archive
            </p>
          </div>

          {/* Glass card for login */}
          <div className="p-6 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] shadow-glass">
            {/* Google Sign In Button */}
            <Button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              variant="outline"
              className={cn(
                "w-full h-14 rounded-xl",
                "bg-white/[0.05] border-white/[0.1] hover:bg-white/[0.1] hover:border-white/20",
                "flex items-center justify-center gap-3",
                "text-white font-medium text-base",
                "transition-all duration-300"
              )}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {/* Google Icon */}
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Sign in with Google
                </>
              )}
            </Button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/[0.08]" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-black/80 text-white/40 rounded-full">
                  Secure authentication
                </span>
              </div>
            </div>

            {/* Info text */}
            <p className="text-center text-xs text-white/30 leading-relaxed">
              By signing in, you agree to our Terms of Service and Privacy Policy.
              Your data is stored securely and never shared.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
