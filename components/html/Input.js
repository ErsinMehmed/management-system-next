import React, { useState } from "react";
import { Input } from "@heroui/react";
import { AiOutlineEye } from "react-icons/ai";
import { AiOutlineEyeInvisible } from "react-icons/ai";

const InputComponent = (props) => {
  const [isVisible, setIsVisible] = useState(false);

  // На mobile (особено iOS) type="number" отваря клавиатура с -, ., е,
  // което е объркващо за обикновени количества/цени. inputMode="decimal" дава
  // чиста цифрова клавиатура с десетична точка. Caller-ът може да override-не
  // изрично с inputMode="numeric" за integer-only полета.
  const inputMode =
    props.inputMode ?? (props.type === "number" ? "decimal" : undefined);

  // Decimal полета с type="number" блокират запетая на BG локал, преди тя
  // да достигне React. Премахваме type="number" в полза на type="text" +
  // inputMode="decimal" и нормализираме `,` → `.` + изхвърляме нечислови
  // символи в handleChange. Integer полета (inputMode="numeric") си запазват
  // type="number" — там запетая е изключена.
  const isDecimalNumber =
    props.type === "number" && inputMode === "decimal";

  const handleChange = (event) => {
    if (!props.onChange) return;
    let value = event.target.value;
    if (isDecimalNumber) {
      value = value
        .replace(/,/g, ".") // запетая → точка
        .replace(/[^0-9.]/g, "") // само цифри + точка
        .replace(/(\..*)\./g, "$1"); // максимум една точка
    }
    props.onChange(value);
  };

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  const style = {
    classNames: {
      inputWrapper: [props.inputWrapperClasses],
    },
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && props.onEnterPress) {
      props.onEnterPress();
    }
  };

  const resolvedType =
    props.type === "password"
      ? isVisible
        ? "text"
        : "password"
      : isDecimalNumber
      ? "text"
      : props.type;

  return (
    <Input
      size={"sm"}
      type={resolvedType}
      inputMode={inputMode}
      {...style}
      label={props.label}
      value={props.value}
      isDisabled={props.disabled}
      isInvalid={props.errorMessage ? true : false}
      errorMessage={props.errorMessage}
      placeholder={props.placeholder}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      endContent={
        props.type == "password" && (
          <button
            className="focus:outline-none"
            type="button"
            onClick={toggleVisibility}
          >
            {isVisible ? (
              <AiOutlineEye
                className={`text-2xl ${
                  props.errorMessage ? "text-red-400" : "text-default-400"
                } text-default-400`}
              />
            ) : (
              <AiOutlineEyeInvisible
                className={`text-2xl ${
                  props.errorMessage ? "text-red-400" : "text-default-400"
                } text-default-400`}
              />
            )}
          </button>
        )
      }
    />
  );
};

export default InputComponent;
