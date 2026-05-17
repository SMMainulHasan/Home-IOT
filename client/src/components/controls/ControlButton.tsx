interface Props {
  icon: React.ReactNode;
  label: string;
  value?: string;
  onClick?: () => void;
}

export default function ControlButton({ icon, label, value, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="group bg-slate-900 rounded-2xl p-4 flex items-center gap-4 w-full
                 shadow-md hover:shadow-xl transition-all duration-300
                 hover:scale-[1.02] active:scale-[0.98]"
    >
      {/* Icon Circle */}
      <div
        className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center
                      text-green-400 group-hover:bg-green-500/20 transition"
      >
        {icon}
      </div>

      {/* Text */}
      <div className="text-left">
        <p className="text-white text-sm font-medium">{label}</p>
        {value && <p className="text-green-400 text-xs">{value}</p>}
      </div>
    </button>
  );
}
