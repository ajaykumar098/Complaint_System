export default function Loader() {
  return (
    <div className="flex items-center justify-center min-h-[300px] w-full">
      <div className="relative">
        <div className="w-10 h-10 rounded-full border-2 border-slate-800" />
        <div className="absolute inset-0 w-10 h-10 rounded-full border-2 border-transparent border-t-blue-500 border-r-indigo-500 animate-spin" />
      </div>
    </div>
  )
}
