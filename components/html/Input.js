"use client";
import { useState } from "react";
import { TextField, Label, Input, FieldError } from "@heroui/react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

const InputComponent = (props) => {
  const [isVisible, setIsVisible] = useState(false);

  const inputType =
    props.type === "password" ? (isVisible ? "text" : "password") : props.type;

  const isInvalid = !!props.errorMessage;

  const inputClassName = [
    "w-full rounded-lg border px-3 py-2 text-sm outline-none transition-all",
    isInvalid
      ? "border-danger/60 bg-danger-50 focus:border-danger focus:ring-1 focus:ring-danger/30"
      : "border-default-200 bg-default-50 focus:border-primary focus:ring-1 focus:ring-primary/30",
    props.disabled ? "opacity-50 cursor-not-allowed" : "",
    props.inputWrapperClasses ?? "",
    props.type === "password" ? "pr-10" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <TextField
      isInvalid={isInvalid}
      isDisabled={props.disabled}
      className="w-full"
    >
      {props.label && (
        <Label className="text-sm font-medium text-foreground/70 mb-1 block">
          {props.label}
        </Label>
      )}
      <div className="relative">
        <Input
          type={inputType}
          value={props.value}
          placeholder={props.placeholder}
          className={inputClassName}
          onChange={(e) => props.onChange?.(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") props.onEnterPress?.();
          }}
        />
        {props.type === "password" && (
          <button
            type="button"
            onClick={() => setIsVisible((v) => !v)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 focus:outline-none"
          >
            {isVisible ? (
              <AiOutlineEye
                className={`text-xl ${isInvalid ? "text-danger" : "text-default-400"}`}
              />
            ) : (
              <AiOutlineEyeInvisible
                className={`text-xl ${isInvalid ? "text-danger" : "text-default-400"}`}
              />
            )}
          </button>
        )}
      </div>
      {isInvalid && (
        <FieldError className="text-xs text-danger mt-1">
          {props.errorMessage}
        </FieldError>
      )}
    </TextField>
  );
};

export default InputComponent;
