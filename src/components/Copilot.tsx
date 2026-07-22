import { useState, useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { queryCopilot } from '../utils/copilot';
import CornerBrackets from './CornerBrackets';
import './Copilot.css';

const QUICK_QUERIES = [
  'Who is at risk right now?',
  'What is the highest risk area?',
  'What if I suspend PTW-438?',
  'Generate evacuation list',
];

export default function Copilot() {
  const [input, setInput] = useState('');
  const [streamingText, setStreamingText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesRef = useRef<HTMLDivElement>(null);
  const {
    copilotMessages,
    copilotLoading,
    addCopilotMessage,
    setCopilotLoading,
    scenarioTime,
    compoundRisk,
    ipls,
    sensorReadings,
    workers,
    permits,
    alerts,
    simopsConflicts,
    criticalZones,
  } = useStore();

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [copilotMessages.length, streamingText]);

  const simulateStreaming = (fullText: string) => {
    setIsStreaming(true);
    setStreamingText('');
    let index = 0;
    const speed = 12; // ms per character

    const streamInterval = setInterval(() => {
      // Stream in chunks of 2-4 chars for natural feel
      const chunkSize = Math.floor(Math.random() * 3) + 2;
      index += chunkSize;
      if (index >= fullText.length) {
        setStreamingText(fullText);
        setIsStreaming(false);
        clearInterval(streamInterval);
        // Now commit the full message
        addCopilotMessage({
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: fullText,
          timestamp: Date.now(),
        });
        setStreamingText('');
        setCopilotLoading(false);
      } else {
        setStreamingText(fullText.slice(0, index));
      }
    }, speed);
  };

  const handleSubmit = async (query: string) => {
    if (!query.trim() || copilotLoading) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user' as const,
      content: query.trim(),
      timestamp: Date.now(),
    };
    addCopilotMessage(userMsg);
    setInput('');
    setCopilotLoading(true);

    try {
      const response = await queryCopilot(query, {
        scenarioTime,
        compoundRisk,
        ipls,
        sensorReadings,
        workers,
        permits,
        alerts,
        simopsConflicts,
        criticalZones,
      });

      // Simulate streaming display
      simulateStreaming(response);
    } catch {
      addCopilotMessage({
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Error processing request. System using local intelligence fallback.',
        timestamp: Date.now(),
      });
      setCopilotLoading(false);
    }
  };

  return (
    <div className="copilot glass-panel">
      <CornerBrackets />
      <div className="copilot-header panel-header-bar">
        <span>
          <span className="panel-glyph">◈</span>
          <span className="copilot-title">AI SAFETY COPILOT</span>
        </span>
        <span className="panel-header-right">
          <span className="copilot-model mono">claude-sonnet-4</span>
          <span className="panel-live-dot" />
        </span>
      </div>

      <div className="copilot-messages" ref={messagesRef}>
        {copilotMessages.length === 0 && !isStreaming && (
          <div className="copilot-welcome">
            <div className="copilot-welcome-icon">◇</div>
            <p>Full plant context loaded. Ask anything.</p>
          </div>
        )}
        {copilotMessages.map(msg => (
          <div key={msg.id} className={`copilot-msg copilot-msg-${msg.role}`}>
            <div className="copilot-msg-content">
              {msg.content.split('\n').map((line, i) => (
                <p key={i}>{line || '\u00A0'}</p>
              ))}
            </div>
          </div>
        ))}
        {/* Streaming text display */}
        {isStreaming && streamingText && (
          <div className="copilot-msg copilot-msg-assistant streaming">
            <div className="copilot-msg-content">
              {streamingText.split('\n').map((line, i) => (
                <p key={i}>{line || '\u00A0'}</p>
              ))}
              <span className="streaming-cursor">▊</span>
            </div>
          </div>
        )}
        {copilotLoading && !isStreaming && (
          <div className="copilot-msg copilot-msg-assistant">
            <div className="copilot-loading">
              <span></span><span></span><span></span>
            </div>
          </div>
        )}
      </div>

      <div className="copilot-quick">
        {QUICK_QUERIES.map(q => (
          <button
            key={q}
            className="quick-chip"
            onClick={() => handleSubmit(q)}
            disabled={copilotLoading}
          >
            {q}
          </button>
        ))}
      </div>

      <form className="copilot-input" onSubmit={(e) => { e.preventDefault(); handleSubmit(input); }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about plant safety..."
          disabled={copilotLoading}
        />
        <button type="submit" disabled={copilotLoading || !input.trim()}>
          →
        </button>
      </form>
    </div>
  );
}
