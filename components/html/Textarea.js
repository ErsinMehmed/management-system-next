import { Textarea } from "@nextui-org/react";

const TextareaComponent = (props) => {
  const handleChange = (event) => {
    if (props.onChange) {
      props.onChange(event.target.value);
    }
  };

  return (
    <Textarea
      size={"sm"}
      label={props.label}
      defaultValue={props.value}
      isDisabled={props.disabled}
      isInvalid={props.errorMessage ? true : false}
      errorMessage={props.errorMessage}
      placeholder={props.placeholder}
      onChange={handleChange}
    />
  );
};

export default TextareaComponent;
