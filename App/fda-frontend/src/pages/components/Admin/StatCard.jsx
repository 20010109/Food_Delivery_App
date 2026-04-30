function StatCard({ title, value, icon }) {
  return (
    <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-5 rounded-2xl shadow-sm flex items-center justify-between min-h-[110px]">
      <div>
        <p className="text-sm text-white/80">{title}</p>
        <p className="text-4xl font-bold mt-1">{value}</p>
      </div>
      <div className="w-14 h-14 rounded-full border-4 border-white/50 flex items-center justify-center text-2xl text-white/90 shrink-0">
        {icon}
      </div>
    </div>
  );
}

export default StatCard;