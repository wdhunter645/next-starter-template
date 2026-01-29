'use client';

interface SampleComponentProps {
  title?: string;
  message?: string;
}

export default function SampleComponent({ 
  title = 'Welcome', 
  message = 'This is a sample component' 
}: SampleComponentProps) {
  return (
    <div data-testid="sample-component">
      <h1>{title}</h1>
      <p>{message}</p>
    </div>
  );
}
