import { GoogleGenerativeAI } from '@google/generative-ai';

// Retrieve the Gemini API key from local storage or environment variables
export function getGeminiApiKey(): string {
  const localKey = localStorage.getItem('GEMINI_API_KEY');
  if (localKey) return localKey;
  return (import.meta.env.VITE_GEMINI_API_KEY as string) || '';
}

export function saveGeminiApiKey(key: string) {
  if (key) {
    localStorage.setItem('GEMINI_API_KEY', key);
  } else {
    localStorage.removeItem('GEMINI_API_KEY');
  }
}

// Helper to check if API key is configured
export function hasApiKey(): boolean {
  return !!getGeminiApiKey();
}

/**
 * Interface representing the structured Master Resume
 */
export interface MasterResume {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    links: string[];
  };
  summary: string;
  skills: string[];
  experience: {
    role: string;
    company: string;
    location: string;
    duration: string;
    bullets: string[];
  }[];
  projects: {
    title: string;
    description: string;
    technologies: string[];
    bullets: string[];
  }[];
  education: {
    degree: string;
    institution: string;
    location: string;
    duration: string;
  }[];
}

/**
 * Interface representing a tailored bullet point
 */
export interface TailoredBullet {
  original: string;
  tailored: string;
  modified: boolean;
  explanation: string;
}

/**
 * Interface representing the optimized tailoring result
 */
export interface TailoringResult {
  atsBefore: number;
  atsAfter: number;
  missingKeywords: string[];
  matchedKeywords: string[];
  summary: string;
  skills: string[];
  experience: {
    role: string;
    company: string;
    location: string;
    duration: string;
    bullets: TailoredBullet[];
  }[];
  projects: {
    title: string;
    description: string;
    technologies: string[];
    bullets: TailoredBullet[];
  }[];
  education: {
    degree: string;
    institution: string;
    location: string;
    duration: string;
  }[];
  recruiterInsights: string;
}

/**
 * Parse raw extracted PDF text into a structured MasterResume JSON object
 */
export async function parseResumeWithGemini(rawText: string): Promise<MasterResume> {
  console.log("Resume length:", rawText.length);

  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error('Gemini API key is not configured. Please add it in the settings.');
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.1,
      maxOutputTokens: 8192,
    },
  });

  const prompt = `
Extract information from this resume and return ONLY valid JSON.

{
  "personalInfo": {
    "fullName": "",
    "email": "",
    "phone": "",
    "location": "",
    "links": []
  },
  "summary": "",
  "skills": [],
  "experience": [],
  "projects": [],
  "education": []
}

Resume:
${rawText.slice(0, 2000)}
`;

  try {
    let result;

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        result = await model.generateContent(prompt);
        break;
      } catch (err: any) {
        const msg = String(err);

        if ((msg.includes("503") || msg.includes("429")) && attempt < 3) {
          console.log(`Retrying Gemini... attempt ${attempt}`);
          await new Promise(resolve => setTimeout(resolve, 5000));
          continue;
        }

        throw err;
      }
    }

    const responseText = result.response.text();

    console.log("Gemini response:", responseText);

    const cleaned = responseText
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    return JSON.parse(cleaned) as MasterResume;

  } catch (error: any) {
    console.error('Failed to parse resume with Gemini:', error);

    const errorText = String(error);

    if (errorText.includes('429')) {
      throw new Error(
        'Gemini quota exceeded. Please wait 1 minute and try again.'
      );
    }

    if (errorText.includes('503')) {
      throw new Error(
        'Gemini is experiencing high demand. Please try again in a few minutes.'
      );
    }

    throw new Error(
      'Failed to process resume. Check console for detailed error information.'
    );
  }
}

/**
 * Compare MasterResume with a Job Description, tailoring bullet points and computing ATS scores.
 * Constraints: Never invent skills or experience not present in the master resume.
 */
export async function tailorResumeWithGemini(
  masterResume: MasterResume,
  jobDescription: string
): Promise<TailoringResult> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error('Gemini API key is not configured. Please add it in the settings.');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: { responseMimeType: 'application/json' },
  });

  const prompt = `
    You are an elite ATS (Applicant Tracking System) optimizer and professional resume writer.
    Your task is to compare the provided Master Resume JSON with a Job Description, and output a tailored, optimized resume.

    CRITICAL RULES:
    1. NEVER invent any work experiences, roles, institutions, projects, or technical skills that are not present in the original Master Resume.
    2. Do NOT exaggerate or invent metrics (e.g. do not add "increased revenue by 50%" unless a metric was already present in the original bullet).
    3. You CAN rewrite experience/project bullet points to better align with the job description by rephrasing, highlighting relevant responsibilities, and mapping technologies already in their skills/bullets to the job description keywords.
    4. Reorder skills and projects so that the most relevant ones matching the job description are displayed first.
    5. Calculate an realistic ATS score (0 to 100) before and after optimization based on keyword alignment, structural relevance, and readability.

    Output a structured JSON response matching this TypeScript interface:

    interface TailoredBullet {
      original: string;
      tailored: string;
      modified: boolean; // Set true if you changed the wording to align with the JD
      explanation: string; // Brief, professional 1-sentence note of why this change was made (e.g., 'Emphasized React component styling and Tailwind alignment')
    }

    interface TailoringResult {
      atsBefore: number; // Estimated ATS Match Score of Master Resume (0-100)
      atsAfter: number; // Estimated ATS Match Score of Tailored Resume (0-100)
      missingKeywords: string[]; // List of keywords or skills requested in the JD but not found in the resume
      matchedKeywords: string[]; // List of keywords or skills requested in the JD that are matched in the resume
      summary: string; // Optimized profile summary matching the role
      skills: string[]; // Reordered and optimized list of skills (no new skills invented!)
      experience: {
        role: string;
        company: string;
        location: string;
        duration: string;
        bullets: TailoredBullet[];
      }[];
      projects: {
        title: string;
        description: string;
        technologies: string[];
        bullets: TailoredBullet[];
      }[];
      education: {
        degree: string;
        institution: string;
        location: string;
        duration: string;
      }[];
      recruiterInsights: string; // Strategic feedback for the candidate on their fit and how they can prepare for this role
    }

    Master Resume JSON:
    ${JSON.stringify(masterResume, null, 2)}

    Job Description:
    """
    ${jobDescription}
    """
  `;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    return JSON.parse(responseText) as TailoringResult;
  } catch (error) {
    console.error('Failed to tailor resume with Gemini:', error);
    throw new Error('AI tailoring failed. Please check your network connection or try again.');
  }
}
