import React, { useEffect, useState } from 'react';
import api from '../../utils/api.js';
import { Loader2, BarChart3, TrendingUp, UserCheck, GraduationCap } from 'lucide-react';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export const AnalyticsPage = () => {
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const resUsers = await api.get('/users');
        setUsers(resUsers.data.users);

        const resCourses = await api.get('/courses?all=true');
        setCourses(resCourses.data.courses);
      } catch (err) {
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Loader2 className="h-10 w-10 text-forest dark:text-gold animate-spin" />
      </div>
    );
  }

  // Account role breakdown
  const studentCount = users.filter((u) => u.role === 'Student').length;
  const instructorCount = users.filter((u) => u.role === 'Instructor').length;
  const adminCount = users.filter((u) => u.role === 'Admin').length;

  const doughnutData = {
    labels: ['Students', 'Instructors', 'Admins'],
    datasets: [
      {
        data: [studentCount, instructorCount, adminCount],
        backgroundColor: ['rgba(28, 67, 50, 0.85)', 'rgba(168, 191, 168, 0.8)', 'rgba(214, 185, 123, 0.8)'],
        borderColor: ['#1C4332', '#A8BFA8', '#D6B97B'],
        borderWidth: 1,
      },
    ],
  };

  // Syllabus enrollment breakdown
  const barData = {
    labels: courses.map((c) => c.title.slice(0, 15) + '...'),
    datasets: [
      {
        label: 'Enrolled Students',
        data: courses.map((c) => c.students?.length || 0),
        backgroundColor: 'rgba(28, 67, 50, 0.8)',
        borderColor: '#1C4332',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: 'rgba(32, 32, 32, 0.5)' } },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: 'rgba(32, 32, 32, 0.5)' } },
      y: { grid: { color: 'rgba(28, 67, 50, 0.05)' }, ticks: { color: 'rgba(32, 32, 32, 0.5)' } },
    },
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-forest dark:text-white">Growth Analytics</h1>
        <p className="text-charcoal/80 dark:text-sand/55 text-sm mt-1.5">Monitor account demographics, catalog program enrollments, and usage statistics.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* COURSE ENROLLMENTS */}
        <div className="premium-card lg:col-span-2 flex flex-col min-h-[350px]">
          <h3 className="font-bold text-base mb-4 text-forest dark:text-sand">Course Enrollments Rates</h3>
          <div className="flex-1 relative min-h-[250px]">
            {courses.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center text-xs opacity-80">
                No courses data loaded.
              </div>
            ) : (
              <Bar data={barData} options={chartOptions} />
            )}
          </div>
        </div>

        {/* DEMOGRAPHICS */}
        <div className="premium-card flex flex-col min-h-[350px]">
          <h3 className="font-bold text-base mb-4 text-forest dark:text-sand">Account Roles Breakdown</h3>
          <div className="flex-1 relative min-h-[200px]">
            <Doughnut
              data={doughnutData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { labels: { color: 'rgba(32, 32, 32, 0.5)' } } },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
