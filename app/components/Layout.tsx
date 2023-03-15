import { Link } from "@remix-run/react";
import React from "react";
import CompassLogo from "~/assets/CompassLogo.svg";
import CompassText from "~/assets/CompassText.svg";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/Command";

const currentYear = new Date().getFullYear();

function CommandMenu({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <CommandItem>Calendar</CommandItem>
          <CommandItem>Search Emoji</CommandItem>
          <CommandItem>Calculator</CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && e.metaKey) {
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <div className="flex min-h-full flex-col">
      <header className="container">
        <div className="flex h-24">
          <Link to="/" className="flex max-w-none items-center space-x-2">
            <img src={CompassLogo} alt="Compass Logo" />
            <img
              src={CompassText}
              alt="Compass Text Logo"
              className="hidden sm:inline-block"
            />
          </Link>
          <div className="flex flex-1 items-center justify-end">
            <button className="relative inline-flex h-9 w-full items-center justify-start rounded-md border border-night-200 bg-transparent py-2 px-4 text-sm font-medium text-night-400 transition-colors hover:bg-night-100 focus:outline-none focus:ring-2 focus:ring-night-400 focus:ring-offset-2 active:scale-95 sm:pr-12 md:w-40 lg:w-64">
              <span className="font-medium">Search posts...</span>
              <kbd className="pointer-events-none absolute right-1.5 flex h-5 select-none items-center gap-1 rounded border border-night-100 bg-night-100 px-1.5 font-mono text-[10px] font-medium text-night-600">
                <span className="text-xs">⌘</span>K
              </kbd>
            </button>
          </div>
        </div>
      </header>
      <div className="flex flex-1">{children}</div>
      <footer className="container">
        <div className="flex h-24">
          <Link to="/" className="flex max-w-none items-center space-x-2">
            <img src={CompassLogo} alt="Compass Logo" />
            <img
              src={CompassText}
              alt="Compass Text Logo"
              className="hidden sm:inline-block"
            />
          </Link>
          <div className="flex flex-1 items-center justify-end">
            <p className="text-sm text-night-700">
              &copy; 2021-{currentYear} Treasure. All Rights Reserved.
            </p>
          </div>
        </div>
      </footer>
      <CommandMenu open={open} setOpen={setOpen} />
    </div>
  );
};
