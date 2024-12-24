import PreviewClient from './preview-client';

interface PreviewPageProps {
  params: {
    taskId: string;
  };
}

export default function PreviewPage({ params }: PreviewPageProps) {
  return <main className='p-12'>
    <h1 className='text-3xl font-bold mb-8'>Preview</h1>
    <PreviewClient taskId={params.taskId} />;
  </main>
}
