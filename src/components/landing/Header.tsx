
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';

const Header = () => {
  const navLinks = [
    { title: "Features", href: "#features" },
    { title: "Testimonials", href: "#testimonials" },
    { title: "Pricing", href: "#pricing" },
    { title: "FAQ", href: "#faq" },
    { title: "Contact", href: "#contact" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link to="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold">ClickDown</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {navLinks.map(link => (
              <a key={link.title} href={link.href} className="transition-colors hover:text-foreground/80 text-foreground/60">{link.title}</a>
            ))}
          </nav>
        </div>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <nav className="grid gap-6 text-lg font-medium mt-6">
                    <Link to="/" className="flex items-center gap-2 text-lg font-semibold">
                        ClickDown
                    </Link>
                    {navLinks.map(link => (
                      <a key={link.title} href={link.href} className="text-muted-foreground hover:text-foreground">{link.title}</a>
                    ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
          <nav className="flex items-center gap-2">
            <Button variant="ghost" asChild>
                <Link to="/auth">Login</Link>
            </Button>
            <Button asChild>
              <Link to="/auth">Get Started</Link>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
