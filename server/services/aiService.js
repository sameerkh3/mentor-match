import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic(); // reads ANTHROPIC_API_KEY from env automatically

/**
 * Ask Claude to rank the top 3 mentors from the provided list for a given mentee goal.
 *
 * @param {string} query - The mentee's plain-English goal description
 * @param {Array}  mentors - Array of mentor objects (id, name, title, skills, bio, yearsOfExperience)
 * @returns {Array|null} Parsed array of { mentorId, name, reason } on success, null on any error
 */
export async function suggestMentors(query, mentors) {
  const prompt = `You are a mentor matching assistant. Given a mentee's goal, recommend the top 3 mentors from the list below.
Return a JSON array of { mentorId, name, reason } sorted by best fit.

Mentee goal: "${query}"

Mentors:
${JSON.stringify(mentors)}`;

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    // Extract the text content from the first content block
    const text = message.content[0]?.text ?? '';

    // Parse the JSON array out of the response (strip any surrounding markdown fences)
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('No JSON array found in AI response');

    return JSON.parse(jsonMatch[0]);
  } catch (err) {
    console.error('aiService.suggestMentors error:', err.message);
    return null; // caller handles graceful degradation
  }
}
