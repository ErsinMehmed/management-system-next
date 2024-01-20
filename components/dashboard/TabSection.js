const TabSection = (props) => {
  const filteredData = props.data[`${props.kind}_by_products`]?.filter(
    (item) => item.category === props.category
  );

  const totalAmount = filteredData?.reduce(
    (accumulator, stat) => accumulator + stat[props.totalKey],
    0
  );

  const getProductName = (item) => {
    switch (props.category) {
      case "Бутилки":
        return `${item.name} ${item.weight}гр.`;
      case "Накрайници":
        return `${item.name} ${item.flavor}`;
      case "Балони":
        return `${item.name} ${item.count}бр.`;
      default:
        return item.name;
    }
  };

  return (
    <div className='bg-gray-50 rounded-lg'>
      {filteredData?.length > 0 ? (
        <>
          {filteredData?.map((item, index) => (
            <dl
              key={index}
              className={`flex items-center justify-between ${
                index > 0 && "border-t"
              } py-2.5 px-3 text-sm`}>
              <dt className='text-gray-500 font-semibold'>
                {getProductName(item)}
              </dt>
              <dt className='text-gray-500 font-semibold'>
                {item.quantity} бр.
              </dt>
              <dd className='bg-gray-100 text-gray-800 inline-flex items-center px-2.5 py-1 rounded-md font-medium'>
                {item[props.totalKey].toFixed(2)} лв.
              </dd>
            </dl>
          ))}

          {filteredData?.length > 1 && (
            <dl className='flex items-center justify-end py-2.5 px-3 text-sm border-t'>
              <dd className='bg-gray-100 text-gray-800 inline-flex items-center px-2.5 py-1 rounded-md font-semibold'>
                {totalAmount.toFixed(2)} лв.
              </dd>
            </dl>
          )}
        </>
      ) : (
        <div className='text-gray-500 text-center py-3 font-semibold text-sm'>
          Няма налични данни
        </div>
      )}
    </div>
  );
};

export default TabSection;
