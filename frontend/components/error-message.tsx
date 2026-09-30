type ErrorMessageProps = Readonly<{ message: string }>;

export function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
      {message}
    </div>
  );
}
