import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectTasks } from '../store/tasksSlice';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { taskSuggestionService } from '../ai/taskSuggestionService';
import { formatDistanceToNow } from 'date-fns';

export default function Dashboard() {
  const { items } = useSelector(selectTasks);
  const [suggestedTask, setSuggestedTask] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [stats, setStats] = useState({
    completed: 0,
    pending: 0,
    inProgress: 0,
    highPriority: 0,
  });

  // Calculate stats and activities
  useEffect(() => {
    if (!items || !Array.isArray(items)) return;
    
    // Task statistics
    const completedCount = items.filter(t => t.status === 'completed').length;
    const inProgressCount = items.filter(t => t.status === 'in-progress').length;
    const pendingCount = items.filter(t => !t.status || t.status === 'pending').length;
    const highPriorityCount = items.filter(t => t.priority === 'high').length;

    setStats({
      completed: completedCount,
      pending: pendingCount,
      inProgress: inProgressCount,
      highPriority: highPriorityCount,
      total: items.length,
      completionRate: items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0,
    });

    // Recent activities (last 5 actions)
    const activities = [...items]
      .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
      .slice(0, 5)
      .map(task => ({
        ...task,
        action: task.status === 'completed' ? 'completed' : task.status === 'in-progress' ? 'started' : 'created',
        timestamp: task.updatedAt || task.createdAt,
      }));
    
    setRecentActivities(activities);
  }, [items]);

  // Get smart suggestions
  useEffect(() => {
    const getTaskSuggestion = async () => {
      try {
        if (!items || !Array.isArray(items)) return;
        
        // Find the highest priority pending task
        const pendingTasks = items.filter(t => t.status !== 'completed');
        if (pendingTasks.length > 0) {
          // Sort by priority and due date
          const importantTask = [...pendingTasks].sort((a, b) => {
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            return (
              (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0) ||
              new Date(a.dueDate || 0) - new Date(b.dueDate || 0)
            );
          })[0];
          
          if (importantTask) {
            const optimalTimes = await taskSuggestionService.getOptimalTime(
              importantTask.duration || 60
            );
            setSuggestedTask({
              ...importantTask,
              optimalTimes: optimalTimes || []
            });
          }
        }
      } catch (error) {
        console.error('Error getting task suggestions:', error);
      }
    };

    getTaskSuggestion();
  }, [items]);

  // Format time helper
  const formatTime = (hour) => {
    const date = new Date();
    date.setHours(hour, 0, 0, 0);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  // Priority badge component
  const PriorityBadge = ({ priority }) => {
    const colors = {
      high: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    };
    
    return (
      <span className={`text-xs px-2 py-1 rounded-full ${colors[priority] || 'bg-gray-100 dark:bg-gray-700'}`}>
        {priority || 'No priority'}
      </span>
    );
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    const statusMap = {
      'completed': { text: 'Completed', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
      'in-progress': { text: 'In Progress', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
      'pending': { text: 'Pending', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' },
    };
    
    const statusInfo = statusMap[status] || { text: status, color: 'bg-gray-100 dark:bg-gray-700' };
    
    return (
      <span className={`text-xs px-2 py-1 rounded-full ${statusInfo.color}`}>
        {statusInfo.text}
      </span>
    );
  };

  // Chart data for tasks by status
  const statusData = [
    { name: 'Completed', value: stats.completed, color: '#22c55e' },
    { name: 'In Progress', value: stats.inProgress, color: '#3b82f6' },
    { name: 'Pending', value: stats.pending, color: '#f59e0b' },
  ];
  
  // Colors for the chart
  const COLORS = ['#22c55e', '#3b82f6', '#f59e0b'];

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Tasks</div>
          <div className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{stats.total}</div>
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">across all projects</div>
        </div>
        
        <div className="card p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-900">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Completed</div>
          <div className="mt-1 text-2xl font-semibold text-green-600 dark:text-green-400">{stats.completed}</div>
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            {stats.completionRate}% completion rate
          </div>
        </div>
        
        <div className="card p-4 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-gray-800 dark:to-gray-900">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">In Progress</div>
          <div className="mt-1 text-2xl font-semibold text-amber-600 dark:text-amber-400">{stats.inProgress}</div>
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">tasks being worked on</div>
        </div>
        
        <div className="card p-4 bg-gradient-to-br from-red-50 to-rose-50 dark:from-gray-800 dark:to-gray-900">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">High Priority</div>
          <div className="mt-1 text-2xl font-semibold text-red-600 dark:text-red-400">{stats.highPriority}</div>
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">urgent tasks</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task Status Chart */}
        <div className="lg:col-span-1 card p-6">
          <h2 className="text-lg font-semibold mb-4">Task Status</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Recent Activities */}
        <div className="lg:col-span-1 card p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Recent Activities</h2>
            <button className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
              View All
            </button>
          </div>
          
          <div className="space-y-4">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start pb-4 border-b border-gray-100 dark:border-gray-700 last:border-0 last:pb-0">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 mr-3">
                    {activity.action === 'completed' ? '✓' : activity.action === 'started' ? '→' : '+'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      Task "{activity.title}" {activity.action}
                    </p>
                    <div className="flex items-center mt-1 space-x-2">
                      <StatusBadge status={activity.status} />
                      <PriorityBadge priority={activity.priority} />
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(activity.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                No recent activities to show
              </p>
            )}
          </div>
        </div>
        
        {/* Smart Suggestions */}
        <div className="lg:col-span-1">
          {suggestedTask ? (
            <div className="card p-6 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 border border-blue-100 dark:border-gray-700">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                    <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Smart Suggestion
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    Focus on this task next
                  </p>
                </div>
                <span className="px-2 py-1 text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full">
                  New
                </span>
              </div>
              
              <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-gray-900 dark:text-white">{suggestedTask.title}</h3>
                  <PriorityBadge priority={suggestedTask.priority} />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {suggestedTask.description || 'No description'}
                </p>
                
                {suggestedTask.dueDate && (
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Due: {new Date(suggestedTask.dueDate).toLocaleDateString()}
                  </div>
                )}
                
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Suggested Time Slots:
                  </h4>
                  <div className="space-y-2">
                    {suggestedTask.optimalTimes.slice(0, 2).map((time, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-blue-50 dark:bg-gray-700/50 rounded-md">
                        <div className="flex items-center">
                          <span className="w-6 h-6 flex items-center justify-center bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium mr-3">
                            {index + 1}
                          </span>
                          <span className="font-medium">
                            {formatTime(time.hour)} - {formatTime(time.hour + 1)}
                          </span>
                        </div>
                        <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                          {time.confidence}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors">
                    Start Working
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="card p-6 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 border border-dashed border-gray-300 dark:border-gray-600 text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-500 dark:text-blue-400 mb-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-1">No tasks to suggest</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Complete some tasks to get personalized suggestions</p>
              <button className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
                View All Tasks
              </button>
            </div>
          )}
          
          {/* Productivity Tip */}
          <div className="mt-4 card p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-900">
            <div className="flex items-start">
              <div className="flex-shrink-0 p-1.5 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400 mr-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Productivity Tip</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-0.5">
                  Break your work into 25-minute focused sessions with 5-minute breaks in between for better productivity.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4">Progress</h2>
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie 
                  data={statusData} 
                  dataKey="value" 
                  nameKey="name" 
                  outerRadius={100} 
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4">Summary</h2>
          <ul className="space-y-2 text-sm">
            <li>Total tasks: <b>{stats.total}</b></li>
            <li>Completed: <b className="text-green-600">{stats.completed}</b></li>
            <li>In Progress: <b className="text-blue-600">{stats.inProgress}</b></li>
            <li>Pending: <b className="text-amber-600">{stats.pending}</b></li>
            <li>High Priority: <b className="text-red-600">{stats.highPriority}</b></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
