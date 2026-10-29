import { FAQ_DATA } from '@/features/articles/catalog';
import { ModalWrapper } from './ModalWrapper';

export async function generateStaticParams() {
  return FAQ_DATA.map((article) => ({
    id: article.id,
  }));
}

export default async function ModalArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return <ModalWrapper id={id} />;
}
