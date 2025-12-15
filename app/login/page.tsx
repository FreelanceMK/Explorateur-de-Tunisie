"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Mail, Lock, MapPin, ArrowRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { validateCredentials, createSession, isAuthenticated } from "@/lib/auth"
import { translations as t } from "@/lib/translations"
import { toast } from "sonner"

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated()) {
      router.push("/")
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate network delay for better UX
    await new Promise((resolve) => setTimeout(resolve, 800))
    
    if (validateCredentials(email, password)) {
      createSession(email, rememberMe)
      toast.success(t.login.loginSuccess)
      setIsLeaving(true)
      await new Promise((resolve) => setTimeout(resolve, 200))
      router.push("/")
    } else {
      toast.error(t.login.invalidCredentials)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 lg:px-16 xl:px-24 bg-background relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-accent/5 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div
          className={cn(
            "relative z-10 w-full max-w-md mx-auto transition-all duration-200",
            isLeaving && "opacity-0 translate-y-1",
          )}
        >
          {/* Logo & Header */}
          <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="flex items-center gap-3 mb-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/25">
                <MapPin className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {t.login.title}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">{t.login.welcomeBack}</h1>
            <p className="text-muted-foreground text-lg">{t.login.signInDescription}</p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150"
          >
            {/* Email Field */}
            <div className="space-y-2 group">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">
                {t.login.emailLabel}
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <Input
                  id="email"
                  type="email"
                  placeholder={t.login.emailPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-11 h-12 bg-secondary/50 border-border/50 focus:border-primary focus:ring-primary/20 transition-all"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2 group">
              <Label htmlFor="password" className="text-sm font-medium text-foreground">
                {t.login.passwordLabel}
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t.login.passwordPlaceholder}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-11 pr-11 h-12 bg-secondary/50 border-border/50 focus:border-primary focus:ring-primary/20 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <Label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
                {t.login.rememberMe}
              </Label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className={cn(
                "w-full h-14 bg-gradient-to-r from-primary via-primary to-accent text-primary-foreground font-semibold text-lg",
                "shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40",
                "transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
                "rounded-xl",
              )}
            >
              {isLoading ? (
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  <span>{t.login.signingIn}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>{t.login.signInButton}</span>
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </div>
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-12 flex items-center justify-center gap-2 text-sm text-muted-foreground/80 animate-in fade-in duration-700 delay-300">
            <Sparkles className="h-4 w-4" />
            <span>{t.login.discoverPlaces}</span>
          </div>
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden lg:block lg:flex-1 relative overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('/beautiful-tunisian-architecture-sidi-bou-said-blue.jpg')`,
          }}
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-primary/50 to-accent/80" />

        {/* Animated Floating Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-white/10 rounded-full blur-3xl animate-float-delayed" />
        </div>

        {/* Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
          <div className="animate-in fade-in slide-in-from-right-8 duration-1000">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white/90 text-sm mb-6">
                <MapPin className="h-4 w-4" />
                <span>{t.login.exploreTitle}</span>
              </div>
              <h2 className="text-4xl xl:text-5xl font-bold text-white mb-4 text-balance">
                {t.login.discoverBeauty}
              </h2>
              <p className="text-lg text-white/80 max-w-md mx-auto text-pretty">
                {t.login.discoverDescription}
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-12">
              <div className="text-center">
                <div className="text-3xl xl:text-4xl font-bold text-white">1K+</div>
                <div className="text-sm text-white/70">{t.login.statsPlaces}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl xl:text-4xl font-bold text-white">24</div>
                <div className="text-sm text-white/70">{t.login.statsGovernorates}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl xl:text-4xl font-bold text-white">50K+</div>
                <div className="text-sm text-white/70">{t.login.statsReviews}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Pattern */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/20 to-transparent" />
      </div>
    </div>
  )
}
