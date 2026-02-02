import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { Menu, Wallet, Settings, Home, Kanban } from 'lucide-react';
import { NavItem } from './nav-item';
import Image from 'next/image';
import Link from 'next/link';
import Providers from '../providers';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { User } from '../user';
import DarkMode from '@/components/DarkMode';
import { auth } from '@/lib/auth';

const labelsAndLinks = {
  kanban: {
    label: 'kanban',
    link: '/dashboard/kanban'
  },
  settings: {
    label: 'Configurações',
    link: '/settings'
  },
  home: {
    label: 'Início',
    link: '/dashboard'
  }
};

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const role = session?.user?.role;
  return (
    <Providers>
      <main className="flex h-full w-full flex-col max-w-full">
        <DesktopNav role={role} />
        <div className="flex flex-col flex-1 min-h-0 sm:gap-4 sm:py-4 sm:pl-14">
          <header className="sticky top-0 z-30 flex h-14 items-center border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 justify-between">
            <MobileNav role={role} />
            <div className="ml-auto flex items-center gap-4">
              <DarkMode />
              <User />
            </div>
          </header>
          <main className="flex flex-col flex-1 min-h-0 gap-2 p-4 sm:px-6 sm:py-0 md:gap-4">
            {children}
          </main>
        </div>
      </main>
    </Providers>
  );
}

function DesktopNav(props: { role?: string }) {
  const { role } = props;
  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
      <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
        <Image
          src="/images/logo_dark_black.png"
          alt="CC Ohno"
          width={32}
          height={32}
          className="transition-all group-hover:scale-110 dark:invert"
        ></Image>
        <span className="sr-only">CC Ohno</span>
        <NavItem
          href={labelsAndLinks.home.link}
          label={labelsAndLinks.home.label}
        >
          <Home className="h-5 w-5 " />
        </NavItem>
        <NavItem
          href={labelsAndLinks.kanban.link}
          label={labelsAndLinks.kanban.label}
        >
          <Kanban className="h-5 w-5 " />
        </NavItem>
        {role === 'ADMIN' && (
          <NavItem
            href={labelsAndLinks.kanban.link}
            label={labelsAndLinks.kanban.label}
          >
            <Wallet className="h-5 w-5" />
          </NavItem>
        )}
      </nav>
      {role === 'ADMIN' && (
        <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
          <NavItem
            href={labelsAndLinks.settings.link}
            label={labelsAndLinks.settings.label}
          >
            <Settings className="h-5 w-5 " />
          </NavItem>
        </nav>
      )}
    </aside>
  );
}

function MobileNav(props: { role?: string }) {
  const { role } = props;
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="icon" variant="outline" className="sm:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
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
            alt="CC Ohno"
            width={32}
            height={32}
            className="transition-all group-hover:scale-110 dark:invert"
          ></Image>
          <span className="sr-only">CC Ohno</span>
          {role === 'ADMIN' && (
            <Link
              href={labelsAndLinks.kanban.link}
              className="flex items-center gap-4 px-2.5 text-foreground"
              prefetch={true}
              passHref
            >
              <Wallet className="h-5 w-5" />
              {labelsAndLinks.kanban.label}
            </Link>
          )}
          {role === 'ADMIN' && (
            <Link
              href={labelsAndLinks.settings.link}
              className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
              prefetch={true}
              passHref
            >
              <Settings className="h-5 w-5" />
              {labelsAndLinks.settings.label}
            </Link>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
