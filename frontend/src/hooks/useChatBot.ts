import { useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  navLink?: string;
}

const SYSTEM_PROMPT = `You are Helix Assistant, an AI guide for the Helix Disease Intelligence Platform. The platform has 7 sections: Dashboard (KPIs + disease overview with disease selector), Outbreak Map (live realtime heatmap), Predictions (30-day forecasts with confidence intervals), Alerts (severity-ranked early warnings), Symptom Reports (crowdsourced reporting + WHO live feed + AI cluster detection), Simulation (SEIR compartmental modeling for interventions like lockdowns and masking), Reports (PDF briefing generator for health authorities). Guide users to the right section for their needs. Be concise, specific, and always reference actual features in the platform. When relevant, tell users they can upgrade to Analyst ($29/mo) or Sentinel ($99/mo) plans for advanced features.`;

const SECTION_ROUTES: Record<string, string> = {
  'dashboard': '/dashboard',
  'outbreak map': '/outbreak-map',
  'map': '/outbreak-map',
  'predictions': '/predictions',
  'forecast': '/predictions',
  'alerts': '/alerts',
  'symptom': '/symptom-reports',
  'simulation': '/simulation',
  'seir': '/simulation',
  'reports': '/reports',
  'pdf': '/reports',
  'upgrade': '/upgrade',
};

export function useChatBot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    const userMsg: Message = { role: 'user', content };
    setMessages(prev => [...prev.slice(-9), userMsg]);
    setIsTyping(true);

    try {
      const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
      const history = [...messages.slice(-9), userMsg].map(m => ({
        role: m.role,
        content: m.content,
      }));

      // Add current page context
      const pageContext = `[User is currently on: ${location.pathname}]`;

      let assistantContent = '';

      if (apiKey) {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true',
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 1000,
            system: SYSTEM_PROMPT + '\n' + pageContext,
            messages: history,
          }),
        });

        const data = await response.json();
        assistantContent = data.content?.[0]?.text || 'I apologize, I could not process that request.';
      } else {
        // Fallback responses when no API key
        const q = content.toLowerCase();
        if (q.includes('map') || q.includes('outbreak')) {
          assistantContent = 'Check out the **Outbreak Map** for a live heatmap of global disease activity. It shows risk scores, case counts, and 7-day trends for each region. You can filter by disease and enable 30-Day Forecast Mode.';
        } else if (q.includes('predict') || q.includes('forecast')) {
          assistantContent = 'Head to **Predictions** for 30-day pathogen trajectory forecasts. Select a disease, region, and model (Ensemble, ARIMA, Prophet, or LSTM) to see confidence intervals and feature importance analysis.';
        } else if (q.includes('alert')) {
          assistantContent = 'The **Alerts** page shows severity-ranked early warnings with recommended public health actions. Filter by Critical, High, Medium, or Low severity.';
        } else if (q.includes('symptom') || q.includes('report')) {
          assistantContent = 'Visit **Symptom Reports** for crowdsourced symptom reporting, WHO live feed integration, and AI-powered cluster detection.';
        } else if (q.includes('simul') || q.includes('seir')) {
          assistantContent = 'The **Simulation** page uses SEIR compartmental modeling to test interventions like lockdowns and masking. Upgrade to **Sentinel ($99/mo)** for full custom parameters.';
        } else if (q.includes('pdf') || q.includes('brief')) {
          assistantContent = 'Go to **Reports** to generate authority-grade PDF briefings for health officials. Analyst plan includes 5 reports/month, Sentinel gets unlimited.';
        } else if (q.includes('upgrade') || q.includes('plan') || q.includes('pricing')) {
          assistantContent = 'Check our **Upgrade** page for plan details: **Observer** (Free), **Analyst** ($29/mo), and **Sentinel** ($99/mo). Each tier unlocks more features like realtime data, simulations, and API access.';
        } else {
          assistantContent = 'Welcome to Helix! I can help you navigate the platform. Try asking about the Dashboard, Outbreak Map, Predictions, Alerts, Symptom Reports, Simulation, or Reports. You can also ask about upgrade plans!';
        }
      }

      // Detect section references for nav links
      let navLink: string | undefined;
      for (const [keyword, route] of Object.entries(SECTION_ROUTES)) {
        if (assistantContent.toLowerCase().includes(keyword)) {
          navLink = route;
          break;
        }
      }

      const assistantMsg: Message = { role: 'assistant', content: assistantContent, navLink };
      setMessages(prev => [...prev.slice(-9), assistantMsg]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setIsTyping(false);
    }
  }, [messages, location.pathname]);

  const navigateTo = useCallback((path: string) => {
    navigate(path);
  }, [navigate]);

  return { messages, isOpen, toggle, sendMessage, isTyping, navigateTo };
}
