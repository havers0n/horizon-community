import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterData } from "@shared/schema";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Shield } from "lucide-react";

export default function Register() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: ""
    }
  });

  const onSubmit = async (data: RegisterData) => {
    setIsLoading(true);
    try {
      await signUp(data.email, data.password, data.username);
      toast({
        title: "Success",
        description: "Account created successfully! Please check your email for verification."
      });
      setLocation('/dashboard');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Registration failed",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <Shield className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">{t('register.title', 'Create Account')}</CardTitle>
          <CardDescription>
            {t('register.subtitle', 'Join the CAD System to get started')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('register.username', 'Username')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('register.username_placeholder', 'Enter your username')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('register.email', 'Email')}</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder={t('register.email_placeholder', 'Enter your email')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('register.password', 'Password')}</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder={t('register.password_placeholder', 'Enter your password')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? t('register.creating_account', 'Creating Account...') : t('register.create_account', 'Create Account')}
              </Button>
            </form>
          </Form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {t('register.have_account', 'Already have an account?')}{' '}
              <Link href="/login" className="font-medium text-primary hover:text-primary/90">
                {t('register.sign_in', 'Sign in')}
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
