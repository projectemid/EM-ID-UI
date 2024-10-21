interface MeterTabProps {
  isDarkMode: boolean;
}

export default function MeterTab({ isDarkMode }: MeterTabProps) {
    return (
      <div className="p-8">
        <h2 className="text-2xl font-bold mb-4">Meter</h2>
        <p>This is where meter readings and related information will be shown.</p>
      </div>
    )
  }