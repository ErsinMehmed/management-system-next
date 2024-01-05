import React, { useState } from "react";
import { Input } from "@nextui-org/react";
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
      label={props.label}
      value={props.value}
      isDisabled={props.disabled}
      isInvalid={props.errorMessage ? true : false}
      errorMessage={props.errorMessage}
      placeholder={props.placeholder}
      onChange={handleChange}
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
