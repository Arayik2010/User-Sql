type TextFieldProps = React.ComponentProps<"input"> & {
  label: string;
  error?: string;
};

export function TextField({ label, error, id, name, ...props }: TextFieldProps) {
  const fieldId = id ?? name;

  return (
    <div className="field">
      <label htmlFor={fieldId}>{label}</label>
      <input
        id={fieldId}
        name={name}
        aria-invalid={Boolean(error)}
        aria-describedby={error && fieldId ? `${fieldId}-error` : undefined}
        {...props}
      />
      {error ? (
        <span id={fieldId ? `${fieldId}-error` : undefined} className="field-error">
          {error}
        </span>
      ) : null}
    </div>
  );
}
