'use client'

import { useState } from 'react'
import { User, Mail, Lock, MapPin, Calendar, Users } from 'lucide-react'
import { useAuth, UserType } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface AuthDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  language: 'en' | 'es'
}

export function AuthDialog({ open, onOpenChange, language }: AuthDialogProps) {
  const { login, signup } = useAuth()
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Login form state
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Signup form state
  const [signupName, setSignupName] = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [signupUserType, setSignupUserType] = useState<UserType>('guest')
  const [signupLocation, setSignupLocation] = useState('')
  const [signupPartner, setSignupPartner] = useState('')
  const [signupWeddingDate, setSignupWeddingDate] = useState('')

  const t = language === 'en' ? {
    login: 'Login',
    signup: 'Sign Up',
    email: 'Email',
    password: 'Password',
    name: 'Full Name',
    userType: 'I am a...',
    'professional-writer': 'Professional Writer',
    officiant: 'Officiant',
    guest: 'Guest',
    location: 'Location',
    partner: 'Partner Name',
    weddingDate: 'Wedding Date',
    loginButton: 'Sign In',
    signupButton: 'Create Account',
    loginError: 'Invalid email or password',
    signupError: 'Email already exists',
    loginSuccess: 'Successfully logged in!',
    signupSuccess: 'Account created successfully!',
    loginDescription: 'Welcome back! Please sign in to your account.',
    signupDescription: 'Create an account to save your favorites and purchases.',
    optional: 'Optional',
    demoCredentials: 'Demo: sarah@example.com / password123'
  } : {
    login: 'Iniciar Sesión',
    signup: 'Registrarse',
    email: 'Correo Electrónico',
    password: 'Contraseña',
    name: 'Nombre Completo',
    userType: 'Soy...',
    'professional-writer': 'Escritor Profesional',
    officiant: 'Oficiante',
    guest: 'Invitado',
    location: 'Ubicación',
    partner: 'Nombre de Pareja',
    weddingDate: 'Fecha de Boda',
    loginButton: 'Iniciar Sesión',
    signupButton: 'Crear Cuenta',
    loginError: 'Correo o contraseña inválidos',
    signupError: 'El correo ya existe',
    loginSuccess: '¡Sesión iniciada con éxito!',
    signupSuccess: '¡Cuenta creada con éxito!',
    loginDescription: '¡Bienvenido de nuevo! Por favor inicia sesión.',
    signupDescription: 'Crea una cuenta para guardar tus favoritos y compras.',
    optional: 'Opcional',
    demoCredentials: 'Demo: sarah@example.com / password123'
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const success = await login(loginEmail, loginPassword)
      if (success) {
        onOpenChange(false)
        setLoginEmail('')
        setLoginPassword('')
      } else {
        setError(t.loginError)
      }
    } catch (err) {
      setError(t.loginError)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const success = await signup({
        name: signupName,
        email: signupEmail,
        password: signupPassword,
        userType: signupUserType,
        location: signupLocation || undefined,
        partner: signupPartner || undefined,
        weddingDate: signupWeddingDate || undefined
      })

      if (success) {
        onOpenChange(false)
        // Reset form
        setSignupName('')
        setSignupEmail('')
        setSignupPassword('')
        setSignupUserType('guest')
        setSignupLocation('')
        setSignupPartner('')
        setSignupWeddingDate('')
      } else {
        setError(t.signupError)
      }
    } catch (err) {
      setError(t.signupError)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {activeTab === 'login' ? t.login : t.signup}
          </DialogTitle>
          <DialogDescription>
            {activeTab === 'login' ? t.loginDescription : t.signupDescription}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'login' | 'signup')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">{t.login}</TabsTrigger>
            <TabsTrigger value="signup">{t.signup}</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">{t.email}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="you@example.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password">{t.password}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md text-sm">
                {t.demoCredentials}
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90"
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : t.loginButton}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup" className="space-y-4">
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-name">{t.name}</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="John Doe"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email">{t.email}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="you@example.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password">{t.password}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-usertype">{t.userType}</Label>
                <Select value={signupUserType} onValueChange={(v: UserType) => setSignupUserType(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="guest">{t.guest}</SelectItem>
                    <SelectItem value="professional-writer">{t['professional-writer']}</SelectItem>
                    <SelectItem value="officiant">{t.officiant}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-location">{t.location} ({t.optional})</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="signup-location"
                    type="text"
                    placeholder="City, State"
                    value={signupLocation}
                    onChange={(e) => setSignupLocation(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {signupUserType === 'professional-writer' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="signup-partner">{t.partner} ({t.optional})</Label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="signup-partner"
                        type="text"
                        placeholder="Partner's name"
                        value={signupPartner}
                        onChange={(e) => setSignupPartner(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-weddingdate">{t.weddingDate} ({t.optional})</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="signup-weddingdate"
                        type="date"
                        value={signupWeddingDate}
                        onChange={(e) => setSignupWeddingDate(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90"
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : t.signupButton}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
