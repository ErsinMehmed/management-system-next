const LinearLoader = (props) => {
  if (!props.show) return null;
  return (
    <div className="fixed top-0 left-0 z-50 w-full h-1.5 overflow-hidden">
      <div className="h-full bg-[#0071f5] animate-[indeterminate_1.5s_ease-in-out_infinite]"
        style={{ width: "40%", animation: "indeterminate 1.5s ease-in-out infinite" }} />
      <style>{`
        @keyframes indeterminate {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(350%); }
        }
      `}</style>
    </div>
  );
};

export default LinearLoader;
