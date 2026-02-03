// components/docs/response-field.tsx

interface ResponseFieldProps {
    name: string;
    type: string;
    defaultValue?: string;
    children?: React.ReactNode;
  }
  
  export function ResponseField({ name, type, defaultValue, children }: ResponseFieldProps) {
    return (
      <div className="response-field">
        <p>
          <strong>{name}</strong> (<em>{type}</em>
          {defaultValue && `, default: ${defaultValue}`})
        </p>
        {children && <div>{children}</div>}
      </div>
    );
  }