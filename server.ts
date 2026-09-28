import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Initialize Gemini AI SDK if API key is present
  const getGeminiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured in process.env');
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  };

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // AI Summary Improvement Route
  app.post('/api/ai/improve-summary', async (req, res) => {
    try {
      const { summary, headline, jobTitle } = req.body;
      const ai = getGeminiClient();

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: `You are an expert ATS executive resume writer. Improve the following professional summary for a candidate targeting a role as "${jobTitle || headline || 'Software Engineer'}". 

Original Summary:
"${summary}"

Instructions:
- Use strong action-oriented, quantified language where appropriate.
- Keep it concise (3-4 sentences max).
- Return JSON with two suggestions: "concise" and "executive".
- Do NOT fabricate or make up fake companies, degrees, or achievements.`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              concise: { type: Type.STRING },
              executive: { type: Type.STRING },
            },
            required: ['concise', 'executive'],
          },
        },
      });

      const text = response.text || '{}';
      res.json(JSON.parse(text));
    } catch (error: any) {
      console.error('Error improving summary:', error);
      res.status(500).json({ error: error.message || 'Failed to generate summary' });
    }
  });

  // AI Bullet Improvement Route
  app.post('/api/ai/improve-bullet', async (req, res) => {
    try {
      const { bullet, jobTitle, company } = req.body;
      const ai = getGeminiClient();

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: `You are a career coach and ATS resume specialist. Improve the following resume bullet point for a ${jobTitle || 'Role'} at ${company || 'Company'}.

Original Bullet Point:
"${bullet}"

Instructions:
- Start with a powerful active verb.
- Highlight metrics, impact, and engineering or business outcomes.
- Provide 3 distinct improved variations: "impact", "concise", "technical".
- Never invent fabricated metrics or companies not mentioned in the original text.`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              impact: { type: Type.STRING },
              concise: { type: Type.STRING },
              technical: { type: Type.STRING },
            },
            required: ['impact', 'concise', 'technical'],
          },
        },
      });

      const text = response.text || '{}';
      res.json(JSON.parse(text));
    } catch (error: any) {
      console.error('Error improving bullet:', error);
      res.status(500).json({ error: error.message || 'Failed to improve bullet' });
    }
  });

  // AI Job Description Matching & ATS Analysis
  app.post('/api/ai/tailor-jd', async (req, res) => {
    try {
      const { resume, jobDescription } = req.body;
      const ai = getGeminiClient();

      const prompt = `Analyze this resume against the provided Job Description to calculate an ATS alignment match score (0-100), identify matched keywords, missing keywords, and actionable suggestions to tailor the resume.

Job Description:
${jobDescription}

Candidate Resume Summary & Skills:
Summary: ${resume.summary || 'None'}
Headline: ${resume.personal?.headline || 'None'}
Skills: ${JSON.stringify(resume.skills || [])}
Experience: ${JSON.stringify(resume.experience?.map((e: any) => ({ title: e.jobTitle, desc: e.description })) || [])}

Return JSON with:
- score: number (0-100)
- matchedKeywords: array of string
- missingKeywords: array of string
- suggestions: array of string (3-5 specific bullet tailoring tips)`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.NUMBER },
              matchedKeywords: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              missingKeywords: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              suggestions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: ['score', 'matchedKeywords', 'missingKeywords', 'suggestions'],
          },
        },
      });

      const text = response.text || '{}';
      res.json(JSON.parse(text));
    } catch (error: any) {
      console.error('Error tailoring JD:', error);
      res.status(500).json({ error: error.message || 'Failed to match job description' });
    }
  });

  // AI Cover Letter Generation
  app.post('/api/ai/generate-cover-letter', async (req, res) => {
    try {
      const { resume, companyName, jobTitle, jobDescription, recipientName } = req.body;
      const ai = getGeminiClient();

      const prompt = `Write a compelling, professional cover letter tailored for the position of "${jobTitle}" at "${companyName}".

Candidate Name: ${resume.personal?.fullName}
Headline: ${resume.personal?.headline}
Summary: ${resume.summary}
Relevant Skills: ${JSON.stringify(resume.skills?.flatMap((s: any) => s.items) || [])}
Job Description Context: ${jobDescription || 'Standard role application'}
Hiring Manager Name: ${recipientName || 'Hiring Team'}

Instructions:
- Write a 3 to 4 paragraph professional cover letter.
- Hook the reader in paragraph 1, highlight 2 key achievements/skills matching the role in paragraph 2, and end with a courteous call-to-action in paragraph 3.
- Do not fabricate work history not in the candidate's background.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
      });

      res.json({ body: response.text || '' });
    } catch (error: any) {
      console.error('Error generating cover letter:', error);
      res.status(500).json({ error: error.message || 'Failed to generate cover letter' });
    }
  });

  // AI Resume Translation Route (Armenian / Target Language)
  app.post('/api/ai/translate-resume', async (req, res) => {
    try {
      const { resume, targetLanguage = 'Armenian (Հայերեն)' } = req.body;
      const ai = getGeminiClient();

      const prompt = `Translate the following resume into ${targetLanguage}.
Keep all structural JSON keys intact and translate only user text fields (fullName, headline, location, summary, skill category names, jobTitles, company descriptions, education institution names, degrees, certification names, and language names/levels).

Input Resume:
${JSON.stringify(resume)}

Return the full translated Resume JSON matching the input structure exactly. Do not alter IDs or field types.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const text = response.text || '{}';
      res.json(JSON.parse(text));
    } catch (error: any) {
      console.error('Error translating resume:', error);
      res.status(500).json({ error: error.message || 'Failed to translate resume' });
    }
  });

  // Serve Vite in development mode or dist in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ResumeCraft AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
