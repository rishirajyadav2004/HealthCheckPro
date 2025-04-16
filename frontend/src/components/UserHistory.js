// components/UserHistory.js
const UserHistory = () => {
    return (
      <div className="bg-white dark:bg-gray-800 text-black dark:text-white p-4 rounded shadow">
        <h3 className="font-semibold mb-3">Assessment History</h3>
        <div className="space-y-2">
          <div className="border-b pb-2">
            <p><strong>Date:</strong> March 15, 2025</p>
            <p><strong>Score:</strong> 85/100</p>
          </div>
          <div className="border-b pb-2">
            <p><strong>Date:</strong> February 28, 2025</p>
            <p><strong>Score:</strong> 78/100</p>
          </div>
        </div>
      </div>
    );
  };
  
  export default UserHistory;