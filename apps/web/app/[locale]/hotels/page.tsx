import { redirect } from '@/i18n/navigation';

export default function HotelsPage({ params }: { params: { locale: string } }) {
    redirect({ href: '/', locale: params.locale });
}
