import {
  CS_CATEGORIES,
  type StarkInterviewSession,
  type StarkQuestion,
  type StarkEvaluation
} from './starkInterviewService';

const MISTRAL_API_KEY =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_MISTRAL_API_KEY) || '';

const MISTRAL_API_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_MISTRAL_API_URL) ||
  'https://api.mistral.ai/v1/chat/completions';

const MISTRAL_MODEL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_MISTRAL_MODEL) ||
  'open-mistral-7b';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Direct Mistral AI Chat Invocation with timeout and error resilience
 */
async function callMistralAi(
  messages: ChatMessage[],
  options?: {
    jsonMode?: boolean;
    maxTokens?: number;
    temperature?: number;
    timeoutMs?: number;
  }
): Promise<string> {
  if (!MISTRAL_API_KEY || MISTRAL_API_KEY.trim() === '' || MISTRAL_API_KEY.includes('your_') || MISTRAL_API_KEY.includes('placeholder')) {
    throw new Error('Mistral API key not configured. Using local intelligence fallback.');
  }

  const timeoutMs = options?.timeoutMs || 14000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const requestBody: any = {
    model: MISTRAL_MODEL,
    messages,
    max_tokens: options?.maxTokens || 450,
    temperature: options?.temperature ?? 0.4
  };

  if (options?.jsonMode) {
    requestBody.response_format = { type: 'json_object' };
  }

  try {
    const response = await fetch(MISTRAL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${MISTRAL_API_KEY}`
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Mistral API HTTP ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    return content.trim();
  } catch (error: any) {
    clearTimeout(timeoutId);
    console.warn('[Elsa AI Engine] LLM invocation notice:', error?.message || error);
    throw error;
  }
}

/**
 * Helper to safely extract JSON from LLM output (handles markdown fenced code blocks)
 */
function extractJsonObject(text: string): any {
  if (!text) return null;
  let clean = text.trim();

  // Strip markdown ```json ... ``` wrapper if present
  if (clean.startsWith('```')) {
    clean = clean.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '');
  }

  const firstBrace = clean.indexOf('{');
  const lastBrace = clean.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    clean = clean.substring(firstBrace, lastBrace + 1);
  }

  try {
    return JSON.parse(clean);
  } catch {
    return null;
  }
}

/**
 * 1. REAL AI INITIAL GREETING & ICEBREAKER GENERATION
 * Generates Elsa's genuine spoken opening tailored to candidate and domains.
 */
export async function generateElsaAiIntro(
  candidateName: string,
  selectedCategoryIds: string[],
  experienceLevel: string
): Promise<string> {
  const categoryNames = CS_CATEGORIES.filter((c) => selectedCategoryIds.includes(c.id)).map(
    (c) => c.name
  );
  const domainList = categoryNames.length > 0 ? categoryNames.join(', ') : 'Computer Science and Software Engineering';

  const systemPrompt = `You are Elsa, a sharp, approachable, and human-like Principal Technical Lead at a top engineering organization.
You are about to conduct a live technical interview with ${candidateName} for a ${experienceLevel}-level engineering role.
The candidate selected these technical domains for today's session: ${domainList}.

TASK:
Produce your opening spoken greeting to start the interview (2 to 3 natural sentences).
1. Warmly introduce yourself as Elsa, their lead interviewer today.
2. Set a collaborative, authentic tone (sound like a real human engineer, not a rigid script or robotic bot).
3. Invite ${candidateName} to introduce themselves, share what technical topics or tools they feel strongest in (e.g. languages, system design, databases, OOP, algorithms), and briefly mention a recent complex project or engineering problem they tackled.

RULES:
- Return ONLY the exact spoken sentences ready for text-to-speech.
- Do NOT use markdown asterisks (*), bullets, or headers.
- Keep the length around 40-60 words.`;

  try {
    const response = await callMistralAi(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Please greet ${candidateName} and start the interview.` }
      ],
      { temperature: 0.6, maxTokens: 180, timeoutMs: 9000 }
    );

    if (response && response.length > 20) {
      return response.replace(/[*_#`>[\]]/g, '').trim();
    }
  } catch (err) {
    console.warn('[Elsa AI Engine] Using fallback intro due to LLM timeout:', err);
  }

  // Graceful conversational fallback
  return `Greetings, ${candidateName}! I am Elsa, your lead technical interviewer today. Before we dive into deep engineering challenges, I'd love to learn about your background. Please introduce yourself, share the technical topics you feel most confident in, and highlight a complex engineering project or technical hurdle you've tackled recently.`;
}

/**
 * 2. REAL AI DYNAMIC QUESTION & CONTEXT-AWARE THINKING
 * Analyzes the candidate's actual speech and thinks like a Principal Engineer.
 */
export async function generateElsaAiNextQuestion(
  session: StarkInterviewSession,
  previousAnswer: string,
  questionNumber: number
): Promise<StarkQuestion> {
  const candidateName = session.candidateName || 'Candidate';
  const categoryNames = CS_CATEGORIES.filter((c) => session.selectedCategories.includes(c.id)).map(
    (c) => c.name
  );
  const domainsStr = categoryNames.join(', ');

  // Build dialogue transcript context so Elsa remembers everything discussed so far
  const transcriptHistory = session.transcripts
    .map(
      (t, i) =>
        `[Question ${i + 1} (${t.category})]: "${t.questionText}"\n[Candidate Answer]: "${t.userAnswerText}"`
    )
    .join('\n\n');

  const systemPrompt = `You are Elsa, a sharp, perceptive, and human-like Principal Technical Lead conducting a live technical interview for ${candidateName} (${session.experienceLevel} level).
The candidate is being evaluated across these core computer science topics: ${domainsStr}.

INTERVIEW MINDSET & CONVERSATIONAL RULES:
1. THINK AND RESPOND LIKE A REAL HUMAN PRINCIPAL ENGINEER:
   - Listen carefully to what ${candidateName} JUST said in their latest response: "${previousAnswer}".
   - Actively ACKNOWLEDGE and REACT to their exact statements. For example:
     * If they said "I know OOP" or "I know oops", react enthusiastically: "That's good! Since you know Object-Oriented Programming, let's explore how you apply its core principles under real production pressure..."
     * If they mentioned specific technologies (e.g. Python, Kafka, Redis, PostgreSQL, C++, Docker, React, Spring), hook directly into their experience!
     * If they gave a strong answer, acknowledge the valid points, and then push them further into deeper trade-offs, edge cases, or architectural constraints.
     * If their answer was high-level or missed edge cases, challenge them naturally: "You mentioned using X, but how do you prevent deadlocks when concurrent transactions write to the same rows?"
2. DYNAMIC PROGRESSION:
   - This is Question #${questionNumber + 1} of the session.
   - If they just finished their introduction (Question 1), bridge directly into a deep technical question probing the concepts or technologies they claimed to know best.
   - If they are answering deep technical questions, explore low-level mechanisms (e.g., memory layout, concurrency primitives, indexing, network handshakes, distributed consensus, failure modes).
3. NATURAL SPOKEN VOICE:
   - Your question will be read aloud via text-to-speech. Keep it to 2-3 engaging, conversational spoken sentences.
   - No bullet points, markdown, or code blocks in questionText.

OUTPUT FORMAT:
Return ONLY a valid JSON object matching this schema:
{
  "conversationalReaction": "Short natural reaction acknowledging what the candidate specifically said (e.g. 'That\\'s good! Since you know OOP and built a microservice with Kafka...')",
  "questionText": "The full spoken question text for Elsa to ask, starting with your conversational reaction and flowing smoothly into the technical challenge.",
  "categoryName": "The specific CS domain name (e.g. Object-Oriented Design, Concurrency & Operating Systems, Distributed Systems, Data Structures, etc.)",
  "depthLevel": "foundational" | "deep" | "architectural",
  "hints": ["2-3 key technical concept hints"],
  "expectedKeywords": ["5-8 key technical terms expected in a strong answer"]
}`;

  const userPrompt = `DIALOGUE HISTORY SO FAR:
${transcriptHistory || '(No previous questions yet)'}

LATEST CANDIDATE ANSWER:
"${previousAnswer || '(No speech registered)'}"

Please generate Elsa's next context-aware response and question for ${candidateName} in JSON format.`;

  try {
    const rawJson = await callMistralAi(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      { jsonMode: true, temperature: 0.5, maxTokens: 420, timeoutMs: 11000 }
    );

    const parsed = extractJsonObject(rawJson);
    if (parsed && parsed.questionText) {
      const cleanQuestion = parsed.questionText.replace(/[*_#`>[\]]/g, '').trim();
      return {
        id: `elsa-ai-${Date.now()}`,
        phase: 'category_deep',
        categoryId: (parsed.categoryName || 'cs').toLowerCase().replace(/[^a-z0-9]/g, '_'),
        categoryName: parsed.categoryName || 'Core Computer Science',
        questionText: cleanQuestion,
        hints: Array.isArray(parsed.hints) ? parsed.hints : ['Architectural Trade-offs', 'Core Mechanisms'],
        expectedKeywords: Array.isArray(parsed.expectedKeywords)
          ? parsed.expectedKeywords
          : ['scalability', 'performance', 'latency', 'trade-offs'],
        depthLevel: parsed.depthLevel || 'deep'
      };
    }
  } catch (err) {
    console.warn('[Elsa AI Engine] LLM question generation fallback:', err);
  }

  // Context-aware dynamic fallback if LLM is temporarily unreachable
  const lowerAns = (previousAnswer || '').toLowerCase();
  let fallbackReaction = "That's good! Thank you for walking me through that.";
  let fallbackTopic = "Software Architecture & CS Principles";
  let fallbackQuestion = "Let's explore how you structure system modularity and handle performance bottlenecks when traffic scales by 10x.";

  if (lowerAns.includes('oop') || lowerAns.includes('oops') || lowerAns.includes('object oriented')) {
    fallbackReaction = "That's good! Since you know Object-Oriented Programming, let's explore how you apply its core principles in production software design.";
    fallbackTopic = "Object-Oriented Design & Principles";
    fallbackQuestion = "Can you explain how the Liskov Substitution Principle and Dependency Inversion prevent subtle architectural bugs in a large-scale codebase?";
  } else if (lowerAns.includes('dsa') || lowerAns.includes('data structure') || lowerAns.includes('tree') || lowerAns.includes('graph')) {
    fallbackReaction = "That's good! Having a strong algorithmic foundation is key for building scalable systems.";
    fallbackTopic = "Data Structures & Complexity";
    fallbackQuestion = "How do you systematically analyze the space and time trade-offs when choosing between a Hash Map and a balanced Binary Search Tree for high-throughput reads?";
  } else if (lowerAns.includes('os') || lowerAns.includes('thread') || lowerAns.includes('concurrency')) {
    fallbackReaction = "That's good! Concurrency and thread safety are critical for high-performance software.";
    fallbackTopic = "Operating Systems & Concurrency";
    fallbackQuestion = "How do you detect and prevent race conditions and deadlocks when multiple worker threads read and write to shared memory?";
  }

  return {
    id: `elsa-fallback-${Date.now()}`,
    phase: 'category_deep',
    categoryId: 'cs_principles',
    categoryName: fallbackTopic,
    questionText: `${fallbackReaction} ${fallbackQuestion}`,
    hints: ['Core Principles', 'Edge Cases', 'System Trade-offs'],
    expectedKeywords: ['design', 'concurrency', 'trade-offs', 'performance', 'scalability'],
    depthLevel: 'deep'
  };
}

/**
 * 3. REAL AI CANDIDATE ANSWER EVALUATION
 * Critiques the candidate's answer with genuine technical reasoning.
 */
export async function evaluateElsaAiAnswer(
  question: StarkQuestion,
  candidateAnswer: string,
  seniority: string
): Promise<{ score: number; feedback: string }> {
  const cleanAnswer = (candidateAnswer || '').trim();

  // If no audible speech was registered
  if (!cleanAnswer || cleanAnswer === '(No audible speech registered)' || cleanAnswer.split(/\s+/).length < 4) {
    return {
      score: 35,
      feedback: "No substantive audible answer was registered. Be sure to articulate your technical rationale clearly."
    };
  }

  const systemPrompt = `You are Elsa, an expert Principal Engineer conducting a technical interview evaluation.
Evaluate the candidate's spoken technical answer to the given question for a ${seniority}-level software engineer.

CRITERIA:
- Correctness & Conceptual Depth (0-40 points)
- Awareness of Trade-offs & Production Realities (0-30 points)
- Communication Clarity & Technical Precision (0-30 points)

Provide:
1. A numerical score between 0 and 100.
2. 1-2 constructive, human-like feedback sentences explaining what was good and what architectural depth or nuance was missing.

OUTPUT JSON FORMAT:
{
  "score": number (0-100),
  "feedback": "1-2 constructive feedback sentences"
}`;

  const userPrompt = `QUESTION ASKED BY ELSA:
"${question.questionText}"

CANDIDATE SPOKEN ANSWER:
"${cleanAnswer}"

Please evaluate and output valid JSON.`;

  try {
    const rawJson = await callMistralAi(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      { jsonMode: true, temperature: 0.2, maxTokens: 250, timeoutMs: 9000 }
    );

    const parsed = extractJsonObject(rawJson);
    if (parsed && typeof parsed.score === 'number' && parsed.feedback) {
      return {
        score: Math.max(0, Math.min(100, Math.round(parsed.score))),
        feedback: parsed.feedback.replace(/[*_#`>[\]]/g, '').trim()
      };
    }
  } catch (err) {
    console.warn('[Elsa AI Engine] LLM evaluation fallback:', err);
  }

  // Dynamic heuristic fallback
  const wordCount = cleanAnswer.split(/\s+/).length;
  let score = 70;
  if (wordCount > 60) score = 85;
  else if (wordCount > 30) score = 78;
  else if (wordCount < 15) score = 60;

  return {
    score,
    feedback: "Good explanation of foundational mechanisms. In future rounds, elaborate further on failure modes, metric tradeoffs, and edge cases."
  };
}

/**
 * 4. REAL AI FINAL AUTOPSY & TECHNICAL DOSSIER GENERATION
 * Synthesizes the full interview transcript into an executive candidate evaluation.
 */
export async function generateElsaAiFinalReport(
  session: StarkInterviewSession
): Promise<StarkEvaluation> {
  const transcripts = session.transcripts;

  if (!transcripts || transcripts.length === 0) {
    return {
      overallScore: 70,
      recommendation: 'LEAN_HIRE',
      technicalProficiencyScore: 72,
      communicationScore: 70,
      conceptualDepthScore: 68,
      problemSolvingScore: 70,
      categoryScores: {},
      keyStrengths: ['Demonstrated foundational engineering motivation'],
      areasForImprovement: ['Practice structured technical communication under timed constraints'],
      detailedDebrief: `Elsa AI Tech Lead Autopsy: Candidate completed the ${session.durationMinutes}-minute session.`
    };
  }

  const transcriptSummary = transcripts
    .map(
      (t, i) =>
        `Q${i + 1} (${t.category}): "${t.questionText}"\nAnswer: "${t.userAnswerText}"\nScore: ${t.score}/100 | Critique: ${t.feedback}`
    )
    .join('\n\n');

  const systemPrompt = `You are Elsa, Principal Technical Lead at a top technology firm.
Synthesize the complete candidate interview autopsy report for ${session.candidateName} (${session.experienceLevel} level, ${session.durationMinutes}-minute timed technical interview).

EVALUATE BASED ON THE ACTUAL TRANSCRIPTS:
1. Calculate overall score (0-100) and recommendation: STRONG_HIRE (>=88), HIRE (>=78), LEAN_HIRE (>=65), or NEEDS_PRACTICE (<65).
2. Four sub-scores: Technical Proficiency, Communication Clarity, Conceptual Depth, Problem Solving & Trade-offs (0-100 each).
3. 2-3 specific Demonstrated Strengths backed by what they said.
4. 2-3 specific High-Impact Growth Areas to improve.
5. A detailed, professional debrief paragraph signed by Elsa.

OUTPUT JSON FORMAT:
{
  "overallScore": number,
  "recommendation": "STRONG_HIRE" | "HIRE" | "LEAN_HIRE" | "NEEDS_PRACTICE",
  "technicalProficiencyScore": number,
  "communicationScore": number,
  "conceptualDepthScore": number,
  "problemSolvingScore": number,
  "categoryScores": { [category: string]: number },
  "keyStrengths": ["string", "string"],
  "areasForImprovement": ["string", "string"],
  "detailedDebrief": "Personalized debrief paragraph signed by Elsa"
}`;

  try {
    const rawJson = await callMistralAi(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: transcriptSummary }
      ],
      { jsonMode: true, temperature: 0.3, maxTokens: 600, timeoutMs: 14000 }
    );

    const parsed = extractJsonObject(rawJson);
    if (parsed && typeof parsed.overallScore === 'number') {
      return {
        overallScore: Math.round(parsed.overallScore),
        recommendation: parsed.recommendation || 'LEAN_HIRE',
        technicalProficiencyScore: Math.round(parsed.technicalProficiencyScore || parsed.overallScore),
        communicationScore: Math.round(parsed.communicationScore || parsed.overallScore),
        conceptualDepthScore: Math.round(parsed.conceptualDepthScore || parsed.overallScore),
        problemSolvingScore: Math.round(parsed.problemSolvingScore || parsed.overallScore),
        categoryScores: parsed.categoryScores || {},
        keyStrengths: Array.isArray(parsed.keyStrengths) ? parsed.keyStrengths : ['Solid baseline understanding'],
        areasForImprovement: Array.isArray(parsed.areasForImprovement)
          ? parsed.areasForImprovement
          : ['Deepen low-level kernel and concurrency trade-offs'],
        detailedDebrief: parsed.detailedDebrief || `Elsa AI Tech Lead Autopsy: Candidate completed the timed technical session.`
      };
    }
  } catch (err) {
    console.warn('[Elsa AI Engine] LLM final dossier fallback:', err);
  }

  // Math-based fallback calculation
  const avg = Math.round(transcripts.reduce((s, t) => s + t.score, 0) / transcripts.length);
  const catScores: Record<string, number> = {};
  for (const t of transcripts) {
    const categoryKey = t.category || 'General CS';
    catScores[categoryKey] = t.score;
  }

  return {
    overallScore: avg,
    recommendation: avg >= 85 ? 'STRONG_HIRE' : avg >= 75 ? 'HIRE' : avg >= 65 ? 'LEAN_HIRE' : 'NEEDS_PRACTICE',
    technicalProficiencyScore: avg,
    communicationScore: Math.min(98, Math.round(avg * 0.96)),
    conceptualDepthScore: Math.min(98, Math.round(avg * 1.02)),
    problemSolvingScore: Math.min(98, Math.round(avg * 0.98)),
    categoryScores: catScores,
    keyStrengths: [
      'Articulated engineering problem decomposition with enthusiasm',
      'Demonstrated awareness of core computer science primitives'
    ],
    areasForImprovement: [
      'Incorporate concrete production metrics (QPS, p99 latency) when proposing architectures',
      'Elaborate more deeply on edge-case failure mitigation strategies'
    ],
    detailedDebrief: `Elsa AI Tech Lead Autopsy: ${session.candidateName} completed ${transcripts.length} adaptive technical challenges across selected CS categories during the ${session.durationMinutes}-minute session. Maintained clear composure and communicated core technical rationale effectively.`
  };
}
