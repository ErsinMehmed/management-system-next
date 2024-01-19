const Loader = (props) => {
  const skeletonRows = [];
  const skeletonHead = [];

  for (let i = 0; i < props.numberOfRows; i++) {
    const cells = [];

    for (let j = 0; j < props.cellCount; j++) {
      cells.push(
        <td key={j} className="px-4 py-[18px] border-b border-[#ebf4ff]">
          <div className="h-1.5 animate-pulse bg-gray-200 rounded-full w-10/12 mb-2" />
          <div className="h-1.5 animate-pulse bg-gray-200 rounded-full" />
        </td>
      );
    }

    skeletonRows.push(<tr key={i}>{cells}</tr>);
  }

  for (let i = 0; i < props.numberOfColumn; i++) {
    skeletonHead.push(
      <th
        key={i}
        className="px-4 py-3.5 border-b-2 border-[#ebf4ff] bg-[#ebf4ff] text-left"
      >
        <div className="h-1.5 animate-pulse bg-gray-300 rounded-full w-10/12 mb-2" />
        <div className="h-1.5 animate-pulse bg-gray-300 rounded-full" />
      </th>
    );
  }

  return (
    <>
      <thead>
        <tr>{skeletonHead}</tr>
      </thead>

      <tbody>{skeletonRows}</tbody>
    </>
  );
};

export default Loader;
