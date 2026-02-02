import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { Home, Menu } from 'lucide-react';
import Tabs from './Tabs';
import { NavItem } from './nav-item';
import Image from 'next/image';
import Link from 'next/link';
import Providers from '../providers';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { User } from '../user';
import DarkMode from '@/components/DarkMode';

const labelsAndLinks = {
  deliveries: {
    label: 'Home',
    link: '/dashboard'
  }
};

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <main className="flex h-full w-full flex-col max-w-full">
        <DesktopNav />
        <div className="flex flex-col flex-1 min-h-0 sm:gap-4 sm:py-4 sm:pl-14">
          <header className="sticky top-0 z-30 flex h-14 items-center border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 justify-between">
            <MobileNav />
            <div className="ml-auto flex items-center gap-4">
              <DarkMode />
              <User />
            </div>
          </header>
          <main className="flex flex-col flex-1 min-h-0 gap-2 p-4 sm:px-6 sm:py-0 md:gap-4">
            <Tabs defaultValue="users">{children}</Tabs>
          </main>
        </div>
      </main>
    </Providers>
  );
}

function DesktopNav() {
  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
      <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
        <Image
          src="/images/logo_dark_black.png"
          alt="CC Catarina"
          width={32}
          height={32}
          className="transition-all group-hover:scale-110 dark:invert"
        ></Image>
        <span className="sr-only">CC Catarina</span>
        <NavItem
          href={labelsAndLinks.deliveries.link}
          label={labelsAndLinks.deliveries.label}
        >
          <Home className="h-5 w-5" />
        </NavItem>
      </nav>
    </aside>
  );
}

function MobileNav() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="icon" variant="outline" className="sm:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="sm:max-w-xs">
        <SheetHeader>
          <VisuallyHidden>
            <SheetTitle>Menu</SheetTitle>
          </VisuallyHidden>
        </SheetHeader>
        <nav className="grid gap-6 text-lg font-medium">
          <Image
            src="/images/logo_dark_black.png"
            alt="CC Catarina"
            width={32}
            height={32}
            className="transition-all group-hover:scale-110 dark:invert"
          ></Image>
          <span className="sr-only">CC Catarina</span>
          <Link
            href={labelsAndLinks.deliveries.link}
            className="flex items-center gap-4 px-2.5 text-foreground"
            prefetch={true}
            passHref
          >
            <Home className="h-5 w-5" />
            {labelsAndLinks.deliveries.label}
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
