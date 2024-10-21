
  interface AnalyticsTabProps {
    isDarkMode: boolean;
  }
  
  export default function AnalyticsTab({ isDarkMode }: AnalyticsTabProps) {
      return (
        <div className={`p-8 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
          <h2 className="text-2xl font-bold mb-4">Analytics</h2>
          <p>This is where energy consumption trends will be displayed.</p>
        </div>
      )
  }
  