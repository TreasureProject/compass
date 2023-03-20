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

import Card1 from "~/assets/card1.webp";
import Card2 from "~/assets/card2.webp";

const TwitterIcon = ({ className }: { className?: string }) => (
  <svg fill="currentColor" viewBox="0 0 24 24" className={className}>
    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
  </svg>
);

const DiscordIcon = ({ className }: { className?: string }) => (
  <svg
    fill="currentColor"
    width="30pt"
    height="24pt"
    viewBox="0 0 30 24"
    className={className}
  >
    <g id="surface1">
      <path d="M 25.394531 2.136719 C 23.484375 1.230469 21.433594 0.5625 19.289062 0.179688 C 19.25 0.175781 19.210938 0.191406 19.191406 0.230469 C 18.929688 0.714844 18.636719 1.34375 18.429688 1.84375 C 16.125 1.484375 13.832031 1.484375 11.574219 1.84375 C 11.367188 1.335938 11.066406 0.714844 10.800781 0.230469 C 10.78125 0.195312 10.742188 0.175781 10.703125 0.179688 C 8.558594 0.5625 6.507812 1.230469 4.597656 2.136719 C 4.578125 2.144531 4.566406 2.15625 4.554688 2.171875 C 0.667969 8.171875 -0.398438 14.027344 0.125 19.808594 C 0.125 19.835938 0.140625 19.863281 0.164062 19.878906 C 2.730469 21.824219 5.214844 23.007812 7.652344 23.789062 C 7.691406 23.800781 7.734375 23.789062 7.757812 23.753906 C 8.335938 22.941406 8.851562 22.082031 9.292969 21.179688 C 9.316406 21.128906 9.292969 21.066406 9.238281 21.042969 C 8.425781 20.722656 7.648438 20.335938 6.898438 19.890625 C 6.839844 19.855469 6.835938 19.769531 6.890625 19.726562 C 7.046875 19.605469 7.203125 19.480469 7.355469 19.351562 C 7.382812 19.328125 7.421875 19.324219 7.453125 19.335938 C 12.363281 21.652344 17.675781 21.652344 22.527344 19.335938 C 22.5625 19.320312 22.597656 19.328125 22.625 19.351562 C 22.777344 19.476562 22.933594 19.605469 23.09375 19.726562 C 23.148438 19.769531 23.144531 19.855469 23.085938 19.890625 C 22.335938 20.34375 21.558594 20.722656 20.742188 21.042969 C 20.691406 21.0625 20.667969 21.128906 20.691406 21.179688 C 21.144531 22.082031 21.65625 22.941406 22.222656 23.753906 C 22.246094 23.789062 22.289062 23.800781 22.328125 23.789062 C 24.78125 23.007812 27.265625 21.824219 29.832031 19.878906 C 29.855469 19.863281 29.867188 19.835938 29.871094 19.808594 C 30.496094 13.125 28.824219 7.320312 25.433594 2.175781 C 25.425781 2.15625 25.414062 2.144531 25.394531 2.136719 Z M 10.023438 16.289062 C 8.546875 16.289062 7.328125 14.886719 7.328125 13.164062 C 7.328125 11.445312 8.523438 10.042969 10.023438 10.042969 C 11.539062 10.042969 12.746094 11.457031 12.722656 13.164062 C 12.722656 14.886719 11.527344 16.289062 10.023438 16.289062 Z M 19.992188 16.289062 C 18.515625 16.289062 17.296875 14.886719 17.296875 13.164062 C 17.296875 11.445312 18.492188 10.042969 19.992188 10.042969 C 21.507812 10.042969 22.714844 11.457031 22.691406 13.164062 C 22.691406 14.886719 21.507812 16.289062 19.992188 16.289062 Z M 19.992188 16.289062 " />
    </g>
  </svg>
);

export const socials = [
  {
    name: "Discord",
    href: "http://discord.gg/treasuredao",
    icon: (props: { className?: string }) => <DiscordIcon {...props} />,
  },
  {
    name: "Twitter",
    href: "https://twitter.com/Treasure_DAO",
    icon: (props: { className?: string }) => <TwitterIcon {...props} />,
  },
];

const currentYear = new Date().getFullYear();

const Card = ({
  title,
  description,
  children,
  image,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  image: string;
}) => (
  <div className="relative flex flex-1 flex-col justify-between overflow-hidden rounded-2.5xl border-2 border-honey-300 bg-honey-50 p-10 dark:border-night-800 dark:bg-[#131D2E]">
    <div className="relative z-10 max-w-[10rem] sm:max-w-md lg:max-w-[17rem]">
      <p className="text-xl font-bold text-ruby-900 dark:text-night-200 lg:text-3xl">
        {title}
      </p>
      <p className="mt-2.5 text-xs text-night-600 sm:text-base lg:text-base">
        {description}
      </p>
    </div>
    <div className="relative z-10 mt-8">{children}</div>
    <div className="absolute -bottom-1 right-0">
      <img src={image} className="ml-auto w-1/2 md:w-1/2" alt={title} />
    </div>
  </div>
);

const CommandMenu = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) => {
  const [value, setValue] = React.useState("");
  const { posts } = useRouteLoaderData("root") as SerializeFrom<typeof loader>;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const filteredPosts =
    value === ""
      ? posts.slice(0, 5)
      : posts.filter((post) =>
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
                const targetPost = posts.find(
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
};

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
        <div className="flex grid-cols-5 flex-col gap-6 xl:grid">
          <div className="flex xl:col-span-3">
            <Card
              title="Build with Treasure"
              description="Apply to become an official Treasure Game Partner to supercharge your game."
              image={Card1}
            >
              <button className="rounded-md bg-ruby-900 py-4 px-5 text-sm font-bold text-white shadow-sm hover:bg-ruby-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ruby-600 sm:py-4 sm:px-7 sm:text-base">
                Apply
              </button>
            </Card>
          </div>
          <div className="xl:col-span-2">
            <Card
              title="Join the Community"
              description="Become a member of Treasure's vibrant community!"
              image={Card2}
            >
              <div className="flex space-x-6">
                {socials.map((social) => (
                  <a
                    key={social.name}
                    className="text-night-800 hover:text-night-900 dark:text-honey-100 dark:hover:text-honey-300"
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="sr-only">{social.name}</span>
                    <social.icon
                      className="h-6 w-6 sm:h-8 sm:w-8"
                      aria-hidden="true"
                    />
                  </a>
                ))}
              </div>
            </Card>
          </div>
        </div>
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
