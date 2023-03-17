import {
  Link,
  useSearchParams,
  useRouteLoaderData,
  useNavigate,
} from "@remix-run/react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./Dropdown";
import { SunMedium, Moon, Laptop } from "lucide-react";
import { Theme, useTheme } from "~/utils/theme-provider";
import type { loader } from "~/root";

import { Preview } from "./Preview";
import type { SerializeFrom } from "@remix-run/server-runtime";

const currentYear = new Date().getFullYear();

function CommandMenu({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const [value, setValue] = React.useState("");
  const { posts } = useRouteLoaderData("root") as SerializeFrom<typeof loader>;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const filteredPosts =
    value === ""
      ? posts.blogPostCollection?.items.slice(0, 5)
      : posts.blogPostCollection?.items.filter((post) =>
          post?.title?.toLowerCase().includes(value.toLowerCase())
        );

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        value={value}
        onValueChange={setValue}
        placeholder="Search posts..."
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          {filteredPosts?.map((post) => (
            <CommandItem
              onSelect={(v) => {
                const targetPost = posts.blogPostCollection?.items.find(
                  (p) => p?.title?.trim().toLowerCase() === v
                );

                if (!targetPost) return;

                navigate(`/${targetPost.slug}/?${searchParams.toString()}`);

                setOpen(false);
              }}
              key={post?.slug}
            >
              <span className="truncate">{post?.title}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = React.useState(false);
  const [, setTheme] = useTheme();
  const [searchParams] = useSearchParams();
  const { preview } = useRouteLoaderData("root") as SerializeFrom<
    typeof loader
  >;

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
          <Link
            to={`/?${searchParams.toString()}`}
            className="flex max-w-none items-center space-x-2"
          >
            <img src={CompassLogo} alt="Compass Logo" />
            <img
              src={CompassText}
              alt="Compass Text Logo"
              className="hidden dark:invert sm:inline-block"
            />
          </Link>
          <div className="ml-4 flex flex-1 items-center justify-end space-x-4">
            <button
              onClick={() => setOpen(true)}
              className="group relative inline-flex h-9 w-full items-center justify-start rounded-md border border-night-200 bg-transparent py-2 px-4 text-sm font-medium text-night-400 transition-colors hover:bg-night-100 focus:outline-none focus:ring-2 focus:ring-night-400 focus:ring-offset-2 active:scale-95 dark:border-night-700 dark:hover:bg-night-800/50 dark:focus:ring-night-600 sm:pr-12 md:w-48 lg:w-64"
            >
              <span className="font-medium transition-colors dark:text-night-600 dark:group-hover:text-night-400">
                Search posts...
              </span>
              <kbd className="pointer-events-none absolute right-1.5 flex h-5 select-none items-center gap-1 rounded border border-night-100 bg-night-100 px-1.5 font-mono text-[10px] font-medium text-night-600 dark:border-night-700 dark:bg-transparent">
                <span className="text-xs">⌘</span>K
              </kbd>
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="inline-flex h-9 items-center justify-center rounded-md bg-transparent px-2 text-sm font-medium transition-colors hover:bg-night-100 focus:outline-none focus:ring-2 focus:ring-night-400 focus:ring-offset-2 active:scale-95 disabled:pointer-events-none disabled:opacity-50 data-[state=open]:bg-night-100 data-[state=open]:bg-transparent dark:text-night-100 dark:hover:bg-night-800 dark:hover:text-night-100 dark:focus:ring-night-400 dark:focus:ring-offset-night-900 dark:data-[state=open]:bg-night-800 dark:data-[state=open]:bg-transparent">
                  <SunMedium className="rotate-0 scale-100 text-black transition-all hover:text-night-900 dark:-rotate-90 dark:scale-0 dark:text-night-400 dark:hover:text-night-100" />
                  <Moon className="absolute rotate-90 scale-0 transition-all hover:text-night-900 dark:rotate-0 dark:scale-100 dark:text-night-400 dark:hover:text-night-100" />
                  <span className="sr-only">Toggle theme</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" forceMount>
                <DropdownMenuItem onClick={() => setTheme(Theme.LIGHT)}>
                  <SunMedium className="mr-2 h-4 w-4" />
                  <span>Light</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme(Theme.DARK)}>
                  <Moon className="mr-2 h-4 w-4" />
                  <span>Dark</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme(Theme.SYSTEM)}>
                  <Laptop className="mr-2 h-4 w-4" />
                  <span>System</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      <div className="relative flex-1">
        {preview ? <Preview /> : null}
        {children}
      </div>
      <footer className="container mt-8">
        <div className="flex h-24">
          <Link
            to={`/?${searchParams.toString()}`}
            className="flex max-w-none items-center space-x-2"
          >
            <img src={CompassLogo} alt="Compass Logo" />
            <img
              src={CompassText}
              alt="Compass Text Logo"
              className="hidden dark:invert sm:inline-block"
            />
          </Link>
          <div className="flex flex-1 items-center justify-end">
            <p className="text-xs text-night-700 dark:text-night-400 sm:text-sm">
              &copy; 2021-{currentYear} Treasure. All Rights Reserved.
            </p>
          </div>
        </div>
      </footer>
      <CommandMenu open={open} setOpen={setOpen} />
    </div>
  );
};
