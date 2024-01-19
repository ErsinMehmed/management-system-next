const Select = (props) => {
  const handleChange = (event) => {
    if (props.onChange) {
      props.onChange(event.target.value);
    }
  };

  return (
    <select
      onChange={handleChange}
      value={props.value || ""}
      className="cursor-pointer bg-gray-50 border border-gray-300 text-gray-800 text-sm rounded-lg block w-14 px-2.5 py-2 p-2.5"
    >
      {props.options?.map((option, index) => (
        <option
          key={index}
          value={typeof option === "object" ? Object.values(option)[0] : option}
        >
          {typeof option === "object" ? Object.values(option)[1] : option}
        </option>
      ))}
    </select>
  );
};

export default Select;
