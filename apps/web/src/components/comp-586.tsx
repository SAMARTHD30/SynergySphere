import Link from "next/link"

import Logo from "@/components/logo"
import ThemeToggle from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"

export default function Component() {
  return (
    <header className="border-b px-4 md:px-6">
      <div className="flex h-16 items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex-1">
          <Link href="/" className="text-primary hover:text-primary/90">
            <Logo />
          </Link>
        </div>
        {/* Right side */}
        <div className="flex flex-1 items-center justify-end gap-2">
          <Button asChild variant="ghost" size="sm" className="text-sm">
            <Link href="/login">Sign In</Link>
          </Button>
          <Button asChild size="sm" className="text-sm">
            <Link href="/signup">Get Started</Link>
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
