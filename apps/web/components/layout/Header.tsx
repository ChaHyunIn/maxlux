import Link from 'next/link';

export default function Header() {
    return (
        <header className="border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                <Link href="/" className="text-xl font-bold text-blue-600">
                    MaxLux
                </Link>
                <div></div>
            </div>
        </header>
    );
}
