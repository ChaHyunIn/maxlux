import Link from "next/link";
import { HeaderActions } from "./HeaderActions";

export default function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
                <div className="flex items-center gap-6">
                    <Link href="/" className="flex items-center space-x-2">
                        <span className="font-bold text-2xl tracking-tight">MaxLux</span>
                    </Link>
                </div>
                <HeaderActions />
            </div>
        </header>
    );
}
