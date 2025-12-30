export default function BranchSelector ({
  userBranches,
  branch,
  onClick
}) {
  const departments = {'lns': 'ЛНС', 'gp': 'ГП', 'di': 'ДИ', 'orel': 'Орёл', 'ryaz': 'Рязань'};

  return (
    <div className="branches-container">
      <div className="branches-flexbox">
        {Object.keys(userBranches).map((key) => (
          <button
            key={key}
            onClick={() => onClick(key)}
            className={`branch-button ${branch === key ? 'selected' : ''}`}
            style={{WebkitTapHighlightColor: 'transparent'}}
          >
            {departments[key]}
          </button>
        ))}
      </div>
    </div>
  );
};
