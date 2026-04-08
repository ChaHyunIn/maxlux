export function EmptyState({ message = "검색 결과가 없습니다" }: { message?: string }) {
    return (
        <div className="flex items-center justify-center min-h-[40vh]">
            <p className="text-gray-400 text-lg">{message}</p>
        </div>
    );
}
