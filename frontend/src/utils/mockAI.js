/**
 * Mock AI utility for generating responses to user questions about complaints.
 * This will be replaced with real backend API calls to /api/ai/ask in the future.
 */

export async function getAIResponse(question, userComplaints = []) {
  // Simulate processing delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  const lowerQuestion = question.toLowerCase().trim()
  const complaints = userComplaints || []

  // Extract complaint ID from question (format: CMP-YYYY-#####)
  const complaintIdMatch = lowerQuestion.match(/cmp-\d{4}-\d{5}/i)
  const mentionedId = complaintIdMatch ? complaintIdMatch[0].toUpperCase() : null

  // Helper to find complaint by ID
  const findComplaint = (id) => complaints.find((c) => c.id === id)

  // Helper to format date
  const formatDate = (isoString) => {
    const date = new Date(isoString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Pattern matching logic

  // 1. Status + complaint ID
  if (lowerQuestion.includes('status') && mentionedId) {
    const complaint = findComplaint(mentionedId)
    if (complaint) {
      return `Your complaint ${complaint.id} is currently **${complaint.status}**. It was submitted on ${formatDate(complaint.createdAt)}.`
    }
    return `I couldn't find a complaint with ID ${mentionedId}. Please check the ID and try again.`
  }

  // 2. Latest / recent complaint
  if (lowerQuestion.includes('latest') || lowerQuestion.includes('recent')) {
    if (complaints.length === 0) {
      return "You haven't submitted any complaints yet."
    }
    const latest = complaints.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]
    return `Your latest complaint is **${latest.id}** (Status: ${latest.status}, submitted on ${formatDate(latest.createdAt)}).`
  }

  // 3. How many complaints
  if (lowerQuestion.includes('how many') && lowerQuestion.includes('complaint')) {
    return `You have submitted **${complaints.length} complaint${complaints.length !== 1 ? 's' : ''}** in total.`
  }

  // 4. History
  if (lowerQuestion.includes('history')) {
    if (complaints.length === 0) {
      return "You haven't submitted any complaints yet."
    }
    const sorted = complaints.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    const summary = sorted
      .map((c) => `• ${c.id}: ${c.status} (${formatDate(c.createdAt)})`)
      .join('\n')
    return `Here's your complaint history:\n${summary}`
  }

  // 5. Admin response + complaint ID
  if ((lowerQuestion.includes('admin response') || lowerQuestion.includes('response')) && mentionedId) {
    const complaint = findComplaint(mentionedId)
    if (complaint) {
      if (complaint.adminResponse) {
        return `Admin response for ${complaint.id}: "${complaint.adminResponse}"`
      }
      return `No response yet from admin for complaint ${complaint.id}.`
    }
    return `I couldn't find a complaint with ID ${mentionedId}.`
  }

  // 6. Where + complaint ID (location)
  if (lowerQuestion.includes('where') && mentionedId) {
    const complaint = findComplaint(mentionedId)
    if (complaint) {
      if (complaint.location && complaint.location.address) {
        return `Complaint ${complaint.id} was reported at: ${complaint.location.address}`
      }
      return `No location data available for complaint ${complaint.id}.`
    }
    return `I couldn't find a complaint with ID ${mentionedId}.`
  }

  // 7. When + complaint ID
  if (lowerQuestion.includes('when') && mentionedId) {
    const complaint = findComplaint(mentionedId)
    if (complaint) {
      return `Complaint ${complaint.id} was submitted on ${formatDate(complaint.createdAt)}.`
    }
    return `I couldn't find a complaint with ID ${mentionedId}.`
  }

  // 8. Priority queries
  if (lowerQuestion.includes('high priority') || lowerQuestion.includes('priority')) {
    if (lowerQuestion.includes('high')) {
      const highPriority = complaints.filter((c) => c.priority === 'High')
      if (highPriority.length === 0) {
        return "You don't have any high priority complaints."
      }
      const summary = highPriority.map((c) => `• ${c.id}: ${c.status}`).join('\n')
      return `You have **${highPriority.length}** high priority complaint${highPriority.length !== 1 ? 's' : ''}:\n${summary}`
    }
    // General priority query
    const priorityCounts = complaints.reduce((acc, c) => {
      acc[c.priority] = (acc[c.priority] || 0) + 1
      return acc
    }, {})
    const summary = Object.entries(priorityCounts)
      .map(([priority, count]) => `${priority}: ${count}`)
      .join(', ')
    return `Your complaints by priority: ${summary || 'None'}`
  }

  // 9. Edit / can i edit
  if (lowerQuestion.includes('can i edit') || lowerQuestion.includes('edit')) {
    return "You can only edit complaints while their status is **Sent**. Once a complaint moves to 'In Progress', 'Resolved', or 'Rejected', editing is no longer allowed."
  }

  // 10. Status query without ID (if user has exactly one complaint, assume that one)
  if (lowerQuestion.includes('status') && !mentionedId) {
    if (complaints.length === 0) {
      return "You haven't submitted any complaints yet."
    }
    if (complaints.length === 1) {
      const complaint = complaints[0]
      return `Your complaint ${complaint.id} is currently **${complaint.status}**. It was submitted on ${formatDate(complaint.createdAt)}.`
    }
    return `You have ${complaints.length} complaints. Please specify which complaint ID you'd like to check (e.g., "What is the status of CMP-2026-00021?").`
  }

  // 11. Generic "my complaint" singular (if exactly one complaint)
  if ((lowerQuestion.includes('my complaint') || lowerQuestion.includes('complaint')) && !mentionedId && complaints.length === 1) {
    const complaint = complaints[0]
    if (lowerQuestion.includes('status')) {
      return `Your complaint ${complaint.id} is currently **${complaint.status}**.`
    }
    return `Your complaint is ${complaint.id} (Status: ${complaint.status}, submitted on ${formatDate(complaint.createdAt)}).`
  }

  // Fallback response
  return "I can help you check complaint status, view your history, or answer questions about a specific complaint (mention its ID, e.g., CMP-2026-00021). Try asking something like 'What is my complaint status?', 'Show my latest complaint', or 'How many complaints have I submitted?'"
}
