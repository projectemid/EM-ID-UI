"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { FcGoogle } from "@react-icons/all-files/fc/FcGoogle"

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters long" }),
})

const signupSchema = loginSchema.extend({
  preferredName: z.string().min(2, { message: "Preferred name must be at least 2 characters long" }),
  password: z.string().regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]).{8,}$/,
    { message: "Password must be at least 8 characters with an uppercase, a lowercase, and a number or special character" }
  ),
})

type LoginFormValues = z.infer<typeof loginSchema>
type SignupFormValues = z.infer<typeof signupSchema>

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login")
  const router = useRouter()
  
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  })

  const onSubmit = async (data: LoginFormValues | SignupFormValues) => {
    setIsLoading(true)
    // Here you would typically send the data to your authentication API
    console.log(data)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    if ('email' in data && data.email === "jdmoutran@gmail.com" && data.password === "CreateX2024") {
      localStorage.setItem("isAuthenticated", "true")
      router.push("/dashboard")
    } else {
      alert("Invalid credentials")
    }
    
    setIsLoading(false)
  }

  const handleGoogleAuth = async () => {
    setIsLoading(true)
    // Here you would typically initiate Google OAuth flow
    console.log("Initiating Google Auth")
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsLoading(false)
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome to the EM-ID Portal</CardTitle>
          <CardDescription>Sign up or log in to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "login" | "signup")} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <form onSubmit={loginForm.handleSubmit(onSubmit)}>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="login-email">Email</Label>
                    <Input id="login-email" type="email" {...loginForm.register("email")} />
                    {loginForm.formState.errors.email && (
                      <p className="text-sm text-red-500 mt-1">{loginForm.formState.errors.email.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="login-password">Password</Label>
                    <Input id="login-password" type="password" {...loginForm.register("password")} />
                    {loginForm.formState.errors.password && (
                      <p className="text-sm text-red-500 mt-1">{loginForm.formState.errors.password.message}</p>
                    )}
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Logging in..." : "Log in"}
                  </Button>
                </div>
              </form>
            </TabsContent>
            <TabsContent value="signup">
              <form onSubmit={signupForm.handleSubmit(onSubmit)}>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="signup-name">Preferred Name</Label>
                    <Input id="signup-name" type="text" {...signupForm.register("preferredName")} />
                    {signupForm.formState.errors.preferredName && (
                      <p className="text-sm text-red-500 mt-1">{signupForm.formState.errors.preferredName.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="signup-email">Email</Label>
                    <Input id="signup-email" type="email" {...signupForm.register("email")} />
                    {signupForm.formState.errors.email && (
                      <p className="text-sm text-red-500 mt-1">{signupForm.formState.errors.email.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="signup-password">Password</Label>
                    <Input id="signup-password" type="password" {...signupForm.register("password")} />
                    {signupForm.formState.errors.password && (
                      <p className="text-sm text-red-500 mt-1">{signupForm.formState.errors.password.message}</p>
                    )}
                    <p className="text-sm text-gray-500 mt-1">
                      Must be at least 8 characters with an uppercase, a lowercase, and a number or special character.
                    </p>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Signing up..." : "Sign up"}
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter>
          <div className="w-full space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Or continue with</span>
              </div>
            </div>
            <Button variant="outline" className="w-full" onClick={handleGoogleAuth} disabled={isLoading}>
              {isLoading ? (
                "Processing..."
              ) : (
                <>
                  <FcGoogle className="mr-2 h-5 w-5" />
                  Google
                </>
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}