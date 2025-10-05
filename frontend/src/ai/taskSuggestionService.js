class TaskSuggestionService {
  constructor() {
    this.completedTasks = [];
    this.timePreferences = {}; // Store time preferences
  }

  async addTrainingData(task) {
    // Add a completed task to training data
    const { completedAt, duration } = task;
    if (!completedAt || !duration) return;

    const date = new Date(completedAt);
    const hour = date.getHours();
    const dayOfWeek = date.getDay(); // 0 (Sunday) to 6 (Saturday)
    
    // Store task data
    this.completedTasks.push({
      hour,
      dayOfWeek,
      duration: Math.min(duration, 240), // Cap duration at 4 hours
    });

    // Update time preferences
    const timeKey = `${dayOfWeek}-${hour}`;
    this.timePreferences[timeKey] = (this.timePreferences[timeKey] || 0) + 1;
  }

  async getOptimalTime(taskDuration) {
    if (this.completedTasks.length === 0) {
      // Return default suggestions if no data
      return this.getDefaultSuggestions();
    }

    // Get current time and day
    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.getDay();
    
    // Calculate scores for each hour of the day
    const hourScores = [];
    
    for (let hour = 0; hour < 24; hour++) {
      const timeKey = `${currentDay}-${hour}`;
      const preferenceScore = this.timePreferences[timeKey] || 0;
      
      // Base score on preference and proximity to current time
      let score = preferenceScore;
      
      // Add bonus for hours close to the current time
      const hourDiff = Math.abs(hour - currentHour);
      const timeProximityScore = Math.max(0, 1 - (hourDiff / 12));
      
      // Add bonus for typical working hours (9 AM to 5 PM)
      const isWorkingHour = hour >= 9 && hour < 17 ? 0.5 : 0;
      
      // Combine scores
      const totalScore = (preferenceScore * 0.6) + (timeProximityScore * 0.3) + (isWorkingHour * 0.1);
      
      hourScores.push({
        hour,
        score: totalScore,
        timeString: `${hour}:00 - ${hour + 1}:00`,
      });
    }

    // Sort by score and get top 3
    const topHours = [...hourScores]
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
    
    // Normalize confidence scores
    const maxScore = Math.max(...topHours.map(h => h.score), 1);
    
    return topHours.map(hour => ({
      hour: hour.hour,
      timeString: hour.timeString,
      confidence: Math.round((hour.score / maxScore) * 100),
    }));
  }
  
  getDefaultSuggestions() {
    // Return some sensible defaults if no data is available
    const now = new Date();
    const currentHour = now.getHours();
    
    // Suggest next 3 hours, wrapping around if needed
    return [
      { hour: (currentHour + 1) % 24, timeString: `${(currentHour + 1) % 24}:00 - ${(currentHour + 2) % 24}:00`, confidence: 80 },
      { hour: (currentHour + 3) % 24, timeString: `${(currentHour + 3) % 24}:00 - ${(currentHour + 4) % 24}:00`, confidence: 70 },
      { hour: (currentHour + 24 - 2) % 24, timeString: `${(currentHour + 24 - 2) % 24}:00 - ${(currentHour + 24 - 1) % 24}:00`, confidence: 60 },
    ];
  }
}

export const taskSuggestionService = new TaskSuggestionService();
