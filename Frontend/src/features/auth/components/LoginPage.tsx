import { Link } from "react-router-dom"
import { LoginForm } from "./LoginForm"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const LoginPage = () => {
  return (
      <Card className="w-auto shadow-lg h-[500px] sm:h-auto md:h-1/2 lg:h-2/3">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Đăng nhập</CardTitle>
          <CardDescription className="text-center">
            Nhập email và mật khẩu để truy cập workspace
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <LoginForm />
        </CardContent>
        
        <CardFooter className="flex flex-col gap-4">
          <div className="relative w-full">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Hoặc
              </span>
            </div>
          </div>
          
          <div className="text-center text-sm text-gray-600">
            Chưa có tài khoản?{" "}
            <Link to="/register" className="text-primary font-medium hover:underline">
              Đăng ký ngay
            </Link>
          </div>
        </CardFooter>
      </Card>
  )
}

export default LoginPage