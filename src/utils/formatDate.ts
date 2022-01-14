export default function formatDate(publicationDate: string): string {
  const formattedDate = new Date(publicationDate).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const testDate = formattedDate
    .replace('.', '')
    .replace('de', '')
    .replace('de', '')
    .replace('de', '')

  return testDate;
}
