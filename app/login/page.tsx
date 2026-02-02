import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import DarkMode from '@/components/DarkMode';
import AuthActions from './authActions';
export default function LoginPage() {
  return (
    <div className="min-h-screen relative p-4 md:p-8">
      <div className="absolute top-4 right-4">
        <DarkMode />
      </div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-center md:h-screen space-y-8 md:space-y-0 md:space-x-16">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold">catarina</h1>
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Login</CardTitle>
            <CardDescription>Utilize suas credenciais</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <AuthActions />
          </CardContent>
          <CardFooter>
            <p className="text-xs text-muted-foreground text-center w-full">
              Financial Management System
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
