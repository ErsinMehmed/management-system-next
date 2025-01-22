import React, { useState } from "react";
import { Input } from "@heroui/react";
import { AiOutlineEye } from "react-icons/ai";
import { AiOutlineEyeInvisible } from "react-icons/ai";

const InputComponent = (props) => {
  const [isVisible, setIsVisible] = useState(false);

  const handleChange = (event) => {
    if (props.onChange) {
      props.onChange(event.target.value);
    }
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

  return (
    <Input
      size={"sm"}
      type={
        props.type === "password"
          ? isVisible
            ? "text"
            : "password"
          : props.type
      }
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
