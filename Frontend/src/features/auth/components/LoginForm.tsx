import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useNavigate } from "react-router-dom"
import { Loader2 } from "lucide-react"

import { useAuthStore } from "@/stores/useAuthStore"
import { authApi } from "../api/authApi"

// Import components của shadcn
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

// 1. Định nghĩa Schema (Luật validate) bằng Zod
const formSchema = z.object({
  Email: z.string().email({ message: "Email không hợp lệ." }),
  Password: z.string().min(6, { message: "Mật khẩu phải có ít nhất 6 ký tự." }),
})

export function LoginForm() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [globalError, setGlobalError] = useState<string>("")

  // 2. Khởi tạo form với React Hook Form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      Email: "",
      Password: "",
    },
  })

  // 3. Hàm xử lý khi Submit (Chỉ chạy khi Validate thành công)
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setGlobalError("")
    try {
      const response = await authApi.login(values)
      console.log("Đăng nhập thành công:", response)
      login(
        { id: response.data.id, email: response.data.email, displayName: response.data.displayName },
        response.data.token,
        response.data.refreshToken
      )
      navigate("/")
    } catch (error: any) {
      setGlobalError(error?.message || "Đăng nhập thất bại.")
    }
  }

  const isLoading = form.formState.isSubmitting

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        
        {/* Hiển thị lỗi từ server (nếu có) */}
        {globalError && (
          <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
            {globalError}
          </div>
        )}

        {/* Field Email */}
        <FormField
          control={form.control}
          name="Email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="dev@example.com" {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage /> {/* Tự động hiện lỗi validation */}
            </FormItem>
          )}
        />

        {/* Field Password */}
        <FormField
          control={form.control}
          name="Password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mật khẩu</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••" {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang xử lý...
            </>
          ) : (
            "Đăng nhập"
          )}
        </Button>
      </form>
    </Form>
  )
}