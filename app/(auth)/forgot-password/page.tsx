"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import {
  PasswordResetRequestSchema,
  PasswordResetRequestType,
} from "@/types/auth";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Moon, Sun, ArrowLeft } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";

const PasswordResetRequest = () => {
  const { setTheme } = useTheme();
  const router = useRouter();

  const form = useForm<PasswordResetRequestType>({
    resolver: zodResolver(PasswordResetRequestSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: PasswordResetRequestType) => {
    try {
      toast.success("Password reset link sent to your email!");
      console.log("form data :", data);
      setTimeout(() => {
        router.push("/sign-in");
      }, 3000);
    } catch (error) {
      toast.error("Failed to send reset link. Please try again.");
      console.error("Password reset error:", error);
    }
  };

  return (
    <div className="w-full max-w-lg">
      <Button
        variant="outline"
        size="icon"
        onClick={() => router.back()}
        className="mb-10"
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>

      <div className="flex items-center justify-between pb-10">
        <div>
          <h2 className="text-[#3A3A3A] font-bold text-[24px]  dark:text-white">
            Reset Password
          </h2>
          <h2 className="text-[#3A3A3A]  font-regular text-[14px] dark:text-gray-500">
            Enter your email to receive a password reset link.
          </h2>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme("light")}>
              Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>
              System
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Card className="bg-primary-foreground">
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="enter your email"
                        {...field}
                        className="py-5"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                disabled={form.formState.isSubmitting}
                type="submit"
                className="mt-4 py-5 w-full bg-[#FAB435] text-[#3A3A3A] dark:hover:text-[#3A3A3A] hover:text-white"
              >
                {form.formState.isSubmitting ? "Sending..." : "Send Reset Link"}
              </Button>
              <div className="text-center">
                <Link
                  href="/sign-in"
                  className="text-sm underline-offset-4 text-[#FAB435] hover:underline"
                >
                  Back to Sign In
                </Link>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PasswordResetRequest;
