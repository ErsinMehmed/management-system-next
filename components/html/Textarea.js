import { TextField, Label, TextArea, FieldError } from "@heroui/react";

const TextareaComponent = (props) => {
  const isInvalid = !!props.errorMessage;

  return (
    <TextField isInvalid={isInvalid} isDisabled={props.disabled} className="w-full">
      {props.label && (
        <Label className="text-sm font-medium text-foreground/70 mb-1 block">
          {props.label}
        </Label>
      )}
      <TextArea
        className="w-full text-sm rounded-lg border border-default-200 bg-default-50 px-3 py-2 resize-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 disabled:opacity-50 transition-colors"
        value={props.value ?? ""}
        disabled={props.disabled}
        placeholder={props.placeholder ?? props.label}
        onChange={(e) => props.onChange?.(e.target.value)}
        rows={3}
      />
      {isInvalid && (
        <FieldError className="text-xs text-danger mt-1">
          {props.errorMessage}
        </FieldError>
      )}
    </TextField>
  );
};

export default TextareaComponent;
