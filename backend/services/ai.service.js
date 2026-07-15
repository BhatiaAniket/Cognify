const Groq = require("groq-sdk")

const generateMeetingSummary = async (meetingData) => {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not defined in environment variables");
  }

  const groq = new Groq({ 
    apiKey: process.env.GROQ_API_KEY 
  })
  const prompt = `Summarize this meeting:
  Title: ${meetingData.title}
  Duration: ${meetingData.durationMinutes} minutes
  Participants: ${meetingData.participants.map(p => p.fullName || p.name).join(", ")}
  Chat Messages: ${meetingData.chatHistory.map(m => 
    `${m.userName}: ${m.message}`
  ).join("\n")}
  
  Provide:
  1. Key discussion points (3-5 bullet points)
  2. Action items if any
  3. Decisions made
  Keep it under 200 words.`
  
  const response = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 500
  })
  
  return response.choices[0].message.content
}

/**
 * Generate a performance summary based on metrics
 */
const generatePerformanceSummary = async (metrics) => {
  if (!process.env.GROQ_API_KEY) {
    return 'AI Summary unavailable: Missing Groq API Key.';
  }

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
  
  try {
    const response = await groq.chat.completions.create({
      model: process.env.AI_MODEL || "llama-3.1-8b-instant",
      messages: [
        {
          role: 'system',
          content: 'You are a senior project management consultant. Generate a concise, 2-3 sentence performance summary for an employee based on the provided metrics.',
        },
        {
          role: 'user',
          content: JSON.stringify(metrics),
        },
      ],
      temperature: 0.7,
      max_tokens: 150,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Groq Performance Summary Error:', error);
    return 'Error generating AI summary.';
  }
};

/**
 * Generate a detailed AI performance report for an EMPLOYEE
 */
const generateEmployeeAIReport = async ({ name, position, score, breakdown }) => {
  if (!process.env.GROQ_API_KEY) {
    return 'AI Report unavailable: Missing Groq API Key.';
  }

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

  try {
    const prompt = `Generate a professional performance report for an employee.

Employee: ${name}
Position: ${position || 'Not specified'}

Performance Data:
- Overall Score: ${score}/1000
- Total Tasks: ${breakdown.total}
- Completed On Time: ${breakdown.completedOnTime}
- Completed Late: ${breakdown.completedLate}
- Currently Overdue: ${breakdown.overdue}
- In Progress: ${breakdown.inProgress}
- Average Manager Rating: ${breakdown.managerRatingAvg}/5

Write a 4-5 sentence professional performance summary that:
1. Highlights strengths based on the data
2. Identifies areas needing improvement
3. Gives specific actionable recommendations
4. Ends with an encouraging motivational note

Keep tone professional but supportive. Do not use bullet points. Write in paragraph form.`;

    const response = await groq.chat.completions.create({
      model: process.env.AI_MODEL || "llama-3.1-8b-instant",
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 350,
      temperature: 0.7,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Groq Employee Report Error:', error);
    return 'Error generating AI report.';
  }
};

/**
 * Generate a detailed AI performance report for a MANAGER
 */
const generateManagerAIReport = async ({ name, score, breakdown }) => {
  if (!process.env.GROQ_API_KEY) {
    return 'AI Report unavailable: Missing Groq API Key.';
  }

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

  try {
    const prompt = `Generate a professional performance report for a manager.

Manager: ${name}

Performance Data:
- Overall Score: ${score}/1000
- Team Score (out of 500): ${breakdown.teamScore}
- Process Quality (out of 300): ${breakdown.processScore}
- Own Tasks Score (out of 200): ${breakdown.ownScore}
- Team Completion Rate: ${breakdown.teamCompletionRate}%
- Team Overdue Rate: ${breakdown.teamOverdueRate}%
- Unassigned Tasks: ${breakdown.unassignedTasks}
- Reassigned Tasks: ${breakdown.reassignedTasks}

Write a 4-5 sentence analysis focusing on:
1. Team management effectiveness
2. Planning and delegation quality
3. Process improvement areas
4. Leadership recommendations

Keep tone professional and constructive. Do not use bullet points. Write in paragraph form.`;

    const response = await groq.chat.completions.create({
      model: process.env.AI_MODEL || "llama-3.1-8b-instant",
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 350,
      temperature: 0.7,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Groq Manager Report Error:', error);
    return 'Error generating AI report.';
  }
};

module.exports = {
  generateMeetingSummary,
  generatePerformanceSummary,
  generateEmployeeAIReport,
  generateManagerAIReport
}
