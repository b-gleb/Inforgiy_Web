export default function BranchSelector({ userBranches, branch, onClick }) {
  const departments = { lns: "ЛНС", gp: "ГП", di: "ДИ", orel: "Орёл", ryaz: "Рязань" };

  return (
    <div className="p-2 rounded-lg shadow-sm mb-2 bg-white dark:bg-neutral-700">
      <div className="flex justify-between rounded-lg p-1 bg-[#e9e9eb] dark:bg-neutral-800">
        {Object.keys(userBranches).map(key => (
          <button
            key={key}
            onClick={() => onClick(key)}
            className={`branch-button ${branch === key ? "selected" : ""}`}
            style={{ WebkitTapHighlightColor: "transparent" }}
          >
            {departments[key]}
          </button>
        ))}
      </div>
    </div>
  );
}
