import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { listStudySessions } from "@/lib/study.functions";
import { motion } from "framer-motion";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Target, Flame, BookOpen } from "lucide-react";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/app/stats")({
  component: StatsPage,
});

function StatsPage() {
  const { data: sessions = [] } = useQuery({
    queryKey: ["study-sessions"],
    queryFn: () => listStudySessions(),
  });

  // Calculate statistics
  const quizStats = sessions
    .filter(s => s.result?.quiz)
    .map(s => {
      const quiz = s.result.quiz;
      const correct = quiz.filter((q: any, idx: number) => 
        s.result.userAnswers?.[idx] === q.correctIndex
      ).length;
      return {
        title: s.title,
        score: Math.round((correct / quiz.length) * 100),
        date: new Date(s.created_at).toLocaleDateString(),
      };
    });

  const avgScore = quizStats.length > 0 
    ? Math.round(quizStats.reduce((sum, s) => sum + s.score, 0) / quizStats.length)
    : 0;

  const streak = calculateStreak(sessions);
  const topicsCount = new Set(sessions.map(s => s.result?.title)).size;

  const scoreDistribution = [
    { name: "0-50%", value: quizStats.filter(s => s.score < 50).length },
    { name: "50-75%", value: quizStats.filter(s => s.score >= 50 && s.score < 75).length },
    { name: "75-100%", value: quizStats.filter(s => s.score >= 75).length },
  ];

  const COLORS = ["#ef4444", "#f59e0b", "#10b981"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-primary/5 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Your Study Stats</h1>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<Target className="w-6 h-6" />}
            label="Average Score"
            value={`${avgScore}%`}
            color="text-blue-500"
          />
          <StatCard
            icon={<Flame className="w-6 h-6" />}
            label="Study Streak"
            value={`${streak} days`}
            color="text-orange-500"
          />
          <StatCard
            icon={<BookOpen className="w-6 h-6" />}
            label="Topics Covered"
            value={topicsCount}
            color="text-green-500"
          />
          <StatCard
            icon={<TrendingUp className="w-6 h-6" />}
            label="Quizzes Taken"
            value={quizStats.length}
            color="text-purple-500"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Score Trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-lg border p-6"
          >
            <h2 className="text-lg font-semibold mb-4">Quiz Performance Over Time</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={quizStats}>
                <CartesianGrid stroke="#e5e7eb" />
                <XAxis dataKey="title" fontSize={12} />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} dot={{ fill: "#3b82f6" }} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Score Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-lg border p-6"
          >
            <h2 className="text-lg font-semibold mb-4">Score Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={scoreDistribution} cx="50%" cy="50%" labelLine={false} label dataKey="value">
                  {COLORS.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Recent Sessions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-lg border p-6"
        >
          <h2 className="text-lg font-semibold mb-4">Recent Quiz Results</h2>
          <div className="space-y-3">
            {quizStats.slice(0, 5).map((stat, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-background rounded-lg">
                <div>
                  <p className="font-medium">{stat.title}</p>
                  <p className="text-sm text-muted-foreground">{stat.date}</p>
                </div>
                <div className="text-right">
                  <p className={`font-bold text-lg ${stat.score >= 75 ? "text-green-500" : stat.score >= 50 ? "text-yellow-500" : "text-red-500"}`}>
                    {stat.score}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-card rounded-lg border p-6"
    >
      <div className={`${color} mb-3`}>{icon}</div>
      <p className="text-sm text-muted-foreground mb-1">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </motion.div>
  );
}

function calculateStreak(sessions: any[]): number {
  if (sessions.length === 0) return 0;
  
  const dates = sessions
    .map(s => new Date(s.created_at).toDateString())
    .filter((v, i, a) => a.indexOf(v) === i)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  for (const dateStr of dates) {
    const d = new Date(dateStr);
    d.setHours(0, 0, 0, 0);
    
    if (currentDate.getTime() - d.getTime() === 24 * 60 * 60 * 1000 || 
        currentDate.getTime() === d.getTime()) {
      streak++;
      currentDate = new Date(d);
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}