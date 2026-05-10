const WeightChart = dynamic(() => import("recharts").then((mod) => {
  const { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } = mod;
  return function Chart({ data }: { data: any[] }) {
    return (
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" fontSize={10} tick={{ fill: 'rgba(255,255,255,0.3)' }} />
          <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} tick={{ fill: 'rgba(255,255,255,0.3)' }} domain={["dataMin - 2", "dataMax + 2"]} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#050508",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "16px",
              fontSize: '12px',
              color: "#fff",
            }}
            itemStyle={{ color: '#00f5ff' }}
          />
          <Line
            type="monotone"
            dataKey="weight"
            stroke="#00f5ff"
            strokeWidth={4}
            dot={{ fill: "#00f5ff", r: 4, strokeWidth: 2, stroke: '#050508' }}
            activeDot={{ r: 6, fill: "#00f5ff", strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  };
}), { ssr: false, loading: () => <div className="h-[250px] w-full bg-white/5 animate-pulse rounded-2xl" /> });

const HistoryItem = memo(({ entry }: { entry: ProgressEntry }) => (
  <motion.div
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    className="flex items-center justify-between p-5 rounded-2xl bg-white/2 border border-white/5 hover:border-white/10 hover:bg-white/5 transition-all group"
  >
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 bg-neon-blue/10 rounded-xl flex items-center justify-center border border-neon-blue/20">
        <span className="text-sm">⚖️</span>
      </div>
      <div>
        <p className="text-white font-black text-sm uppercase tracking-tight">{entry.weight} KG</p>
        {entry.note && <p className="text-[10px] font-black text-dash-text-dim uppercase tracking-widest opacity-40 mt-0.5">{entry.note}</p>}
      </div>
    </div>
    <span className="text-[9px] font-black text-dash-text-dim uppercase tracking-[0.2em] opacity-30">
      {new Date(entry.date).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' })}
    </span>
  </motion.div>
));

HistoryItem.displayName = "HistoryItem";

export default function ProgressPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<ProgressEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [weight, setWeight] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchProgress = useCallback(async () => {
    try {
      const res = await dashboardService.getProgress();
      if (res.success && res.data) {
        const data = Array.isArray(res.data) ? res.data : (res.data as any).progress || [];
        setEntries(data);
      }
    } catch {
      setEntries([
        { date: "2024-04-01", weight: 82, note: "Starting" },
        { date: "2024-04-08", weight: 81, note: "Feeling good" },
        { date: "2024-04-15", weight: 80.2 },
        { date: "2024-04-22", weight: 79.5, note: "On track" },
        { date: "2024-04-29", weight: 78.8 },
        { date: "2024-05-06", weight: 78, note: "Goal reached!" },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  const handleAddProgress = async () => {
    if (!weight) return;
    setSubmitting(true);
    try {
      await dashboardService.addProgress({ weight: Number(weight), note: note || undefined });
      setWeight("");
      setNote("");
      await fetchProgress();
    } catch {
      // silent
    } finally {
      setSubmitting(false);
    }
  };

  const chartData = useMemo(() => entries.map((e) => ({
    date: new Date(e.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    weight: e.weight,
  })), [entries]);

  return (
    <div className="space-y-12 pb-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
        <div>
          <p className="text-neon-blue text-[10px] font-black uppercase tracking-[0.4em] mb-3 opacity-60">Biometric Analysis</p>
          <h1 className="text-5xl font-black text-white tracking-tighter uppercase leading-none">Body <span className="text-neon-blue">Analytics</span></h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-1 space-y-8">
          <div className="glass-panel p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-5">
               <div className="text-6xl font-black">LOG</div>
            </div>
            <h3 className="text-white font-black uppercase tracking-widest text-[11px] mb-8 opacity-60">Entry Submission</h3>
            <div className="space-y-6">
              <InputField
                label="Current Weight (kg)"
                type="number"
                variant="dark"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="bg-black/20"
              />
              <InputField
                label="Observation Note"
                variant="dark"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="bg-black/20"
              />
              <SubmitButton
                onClick={handleAddProgress}
                loading={submitting}
                variant="neon"
                className="rounded-2xl py-4 font-black text-[10px] uppercase tracking-widest"
              >
                Log Biometrics
              </SubmitButton>
            </div>
          </div>

          <div className="glass-panel p-8 rounded-[2.5rem] border border-white/5">
             <h3 className="text-white font-black uppercase tracking-widest text-[11px] mb-8 opacity-60">Visual Trend</h3>
             <div className="pt-4">
                <WeightChart data={chartData} />
             </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="glass-panel p-10 rounded-[3rem] border border-white/5 min-h-[400px]">
            <div className="flex items-center justify-between mb-10">
               <h3 className="text-white font-black uppercase tracking-widest text-[11px] opacity-60">Historical Record</h3>
               <p className="text-[9px] font-black text-dash-text-dim uppercase tracking-widest opacity-30">{entries.length} Entries Recovered</p>
            </div>
            
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-20 w-full bg-white/5 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : entries.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center gap-6 bg-white/2 rounded-[2.5rem] border border-dashed border-white/10">
                <div className="text-5xl opacity-10">📊</div>
                <h4 className="text-white font-black uppercase tracking-tighter text-lg">No Data Found</h4>
                <p className="text-dash-text-dim text-[9px] font-black uppercase tracking-widest opacity-40 max-w-xs leading-loose">Initialize logging protocol to begin tracking biometric shifts.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {[...entries].reverse().map((entry, i) => (
                  <HistoryItem key={i} entry={entry} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

