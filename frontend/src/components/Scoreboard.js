// components/Scoreboard.js
const Scoreboard = () => {
    return (
      <div className="bg-white dark:bg-gray-800 text-black dark:text-white p-4 rounded shadow">
        <h3 className="font-semibold mb-3">Health Scores</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p><strong>Physical Fitness:</strong> 85%</p>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: "85%" }}></div>
            </div>
          </div>
          <div>
            <p><strong>Mental Well-being:</strong> 78%</p>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-teal-500 h-2.5 rounded-full" style={{ width: "78%" }}></div>
            </div>
          </div>
          <div>
            <p><strong>Nutrition:</strong> 92%</p>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: "92%" }}></div>
            </div>
          </div>
          <div>
            <p><strong>Lifestyle:</strong> 80%</p>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-purple-500 h-2.5 rounded-full" style={{ width: "80%" }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  export default Scoreboard;