type AdminStatusTextProps = {
  message: string;
  className?: string;
};

export default function AdminStatusText({ message, className }: AdminStatusTextProps) {
  const isError = message.startsWith('Error:');
  return (
    <p
      className={className}
      role={isError ? 'alert' : undefined}
      aria-live={isError ? 'assertive' : undefined}
    >
      {message}
    </p>
  );
}
