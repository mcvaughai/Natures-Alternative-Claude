interface SectionHeaderProps {
  title: string;
  className?: string;
}

export default function SectionHeader({ title, className = "" }: SectionHeaderProps) {
  return (
    <div className={`flex items-center gap-4 mb-6 ${className}`}>
      <h2 className="text-xl font-bold text-gray-800 whitespace-nowrap">{title}</h2>
      <div className="flex-1 h-px bg-gray-300" />
    </div>
  );
}
