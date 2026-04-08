export default function Footer() {
    return (
        <footer className="border-t py-8 md:py-12 bg-muted/40">
            <div className="container mx-auto flex max-w-7xl flex-col items-center justify-center gap-4 px-4 text-center">
                <p className="text-sm font-medium text-muted-foreground">
                    © 2026 MaxLux
                </p>
                <div className="flex flex-col items-center gap-1 text-xs text-muted-foreground">
                    <p>가격 정보는 참고용이며 실제와 다를 수 있습니다.</p>
                    <p>데이터 출처: HotelLux</p>
                </div>
            </div>
        </footer>
    );
}
