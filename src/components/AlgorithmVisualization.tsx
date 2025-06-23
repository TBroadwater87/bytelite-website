import { useState, useEffect } from 'react';

interface Stage {
  id: number;
  title: string;
  description: string;
  icon: JSX.Element;
  color: string;
}

export default function AlgorithmVisualization() {
  const [activeStage, setActiveStage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [dataFlow, setDataFlow] = useState<number[]>([]);

  const stages: Stage[] = [
    {
      id: 0,
      title: "Bijective Pairing",
      description: "Adjacent data elements are mathematically paired using Szudzik's algorithm",
      color: "#00D4FF",
      icon: (
        <svg viewBox="0 0 100 100" className="stage-icon">
          <g className="pair-animation">
            <rect x="10" y="10" width="30" height="30" fill="#00D4FF" opacity="0.8"/>
            <rect x="60" y="10" width="30" height="30" fill="#00D4FF" opacity="0.8"/>
            <rect x="10" y="60" width="30" height="30" fill="#00D4FF" opacity="0.8"/>
            <rect x="60" y="60" width="30" height="30" fill="#00D4FF" opacity="0.8"/>
            <path d="M40 25 L60 25 M40 75 L60 75" stroke="#FF006E" strokeWidth="2" className="pairing-lines"/>
            <path d="M25 40 L25 60 M75 40 L75 60" stroke="#FF006E" strokeWidth="2" className="pairing-lines"/>
          </g>
        </svg>
      )
    },
    {
      id: 1,
      title: "Recursive Rounds",
      description: "Data cycles through compression rounds, exponentially reducing size",
      color: "#FF006E",
      icon: (
        <svg viewBox="0 0 100 100" className="stage-icon">
          <g className="recursive-animation">
            <circle cx="50" cy="30" r="20" fill="#00D4FF" opacity="0.3" className="circle-1"/>
            <circle cx="50" cy="50" r="15" fill="#00D4FF" opacity="0.5" className="circle-2"/>
            <circle cx="50" cy="65" r="10" fill="#00D4FF" opacity="0.7" className="circle-3"/>
            <circle cx="50" cy="75" r="5" fill="#00D4FF" opacity="0.9" className="circle-4"/>
            <path d="M50 10 Q 70 50 50 90" stroke="#FF006E" strokeWidth="1.5" fill="none" className="spiral-path"/>
          </g>
        </svg>
      )
    },
    {
      id: 2,
      title: "SDD Encoding",
      description: "Static Dictionary Database applies pattern recognition and substitution",
      color: "#00D4FF",
      icon: (
        <svg viewBox="0 0 100 100" className="stage-icon">
          <g className="encoding-animation">
            <rect x="20" y="20" width="60" height="10" fill="#00D4FF" opacity="0.6" className="dict-1"/>
            <rect x="20" y="35" width="60" height="10" fill="#00D4FF" opacity="0.6" className="dict-2"/>
            <rect x="20" y="50" width="60" height="10" fill="#00D4FF" opacity="0.6" className="dict-3"/>
            <rect x="20" y="65" width="60" height="10" fill="#00D4FF" opacity="0.6" className="dict-4"/>
            <text x="50" y="85" textAnchor="middle" fill="#FF006E" fontSize="10" className="pattern-text">254 patterns</text>
          </g>
        </svg>
      )
    },
    {
      id: 3,
      title: "Convergence",
      description: "Process continues until data reaches minimal representation (≤18 bytes)",
      color: "#FF006E",
      icon: (
        <svg viewBox="0 0 100 100" className="stage-icon">
          <g className="convergence-animation">
            <circle cx="50" cy="50" r="3" fill="#FF006E" className="center-point"/>
            <circle cx="50" cy="50" r="15" fill="none" stroke="#00D4FF" strokeWidth="1" opacity="0.5" className="wave-1"/>
            <circle cx="50" cy="50" r="25" fill="none" stroke="#00D4FF" strokeWidth="1" opacity="0.3" className="wave-2"/>
            <circle cx="50" cy="50" r="35" fill="none" stroke="#00D4FF" strokeWidth="1" opacity="0.1" className="wave-3"/>
            <text x="50" y="90" textAnchor="middle" fill="#00D4FF" fontSize="8" className="final-size">11 bytes</text>
          </g>
        </svg>
      )
    }
  ];

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setActiveStage((prev) => (prev + 1) % stages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isPlaying, stages.length]);

  useEffect(() => {
    // Simulate data flow animation
    const flowInterval = setInterval(() => {
      setDataFlow(prev => {
        const newFlow = [...prev];
        if (newFlow.length > 10) newFlow.shift();
        newFlow.push(Math.random());
        return newFlow;
      });
    }, 500);

    return () => clearInterval(flowInterval);
  }, []);

  const handleStageClick = (stageId: number) => {
    setActiveStage(stageId);
    setIsPlaying(false);
  };

  return (
    <div className="algorithm-visualization">
      <div className="viz-header">
        <h2>DAC Process Visualization</h2>
        <button 
          className="play-pause-btn"
          onClick={() => setIsPlaying(!isPlaying)}
          aria-label={isPlaying ? 'Pause animation' : 'Play animation'}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
      </div>

      <div className="stages-container">
        <div className="data-flow">
          {dataFlow.map((flow, i) => (
            <div 
              key={i} 
              className="flow-particle"
              style={{
                left: `${(i / 10) * 100}%`,
                opacity: flow,
                animationDelay: `${i * 0.1}s`
              }}
            />
          ))}
        </div>

        <div className="stages">
          {stages.map((stage, index) => (
            <div key={stage.id} className="stage-wrapper">
              <div 
                className={`stage ${activeStage === index ? 'active' : ''}`}
                onClick={() => handleStageClick(index)}
                style={{
                  borderColor: activeStage === index ? stage.color : 'transparent',
                  boxShadow: activeStage === index ? `0 0 30px ${stage.color}40` : 'none'
                }}
              >
                {stage.icon}
                <h3 style={{ color: stage.color }}>{stage.title}</h3>
              </div>
              {index < stages.length - 1 && (
                <div className="stage-connector">
                  <div className={`connector-line ${activeStage > index ? 'completed' : ''}`} />
                  <div className="connector-arrow">→</div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="stage-details">
          <div className="detail-card" style={{ borderColor: stages[activeStage].color }}>
            <h4 style={{ color: stages[activeStage].color }}>
              Stage {activeStage + 1}: {stages[activeStage].title}
            </h4>
            <p>{stages[activeStage].description}</p>
            
            {activeStage === 0 && (
              <div className="detail-info">
                <code>f(x,y) = (x + y)(x + y + 1)/2 + y</code>
                <p className="detail-note">Szudzik pairing function ensures reversibility</p>
              </div>
            )}
            
            {activeStage === 1 && (
              <div className="detail-info">
                <p className="detail-note">Each round reduces data by ~50%</p>
                <div className="round-indicator">
                  <span>Round 1</span> → <span>Round 2</span> → <span>Round n</span>
                </div>
              </div>
            )}
            
            {activeStage === 2 && (
              <div className="detail-info">
                <div className="dictionary-grid">
                  <div className="dict-item">Dictionary 1: Text patterns</div>
                  <div className="dict-item">Dictionary 2: Binary sequences</div>
                  <div className="dict-item">Dictionary 3: Numeric patterns</div>
                  <div className="dict-item">Dictionary 4: Symbol mappings</div>
                  <div className="dict-item">Dictionary 5: Structure patterns</div>
                  <div className="dict-item">Dictionary 6: Meta patterns</div>
                </div>
              </div>
            )}
            
            {activeStage === 3 && (
              <div className="detail-info">
                <div className="convergence-stats">
                  <div className="stat">
                    <span className="stat-value">99.999%</span>
                    <span className="stat-label">Compression Ratio</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value">Perfect</span>
                    <span className="stat-label">Reconstruction</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="visualization-footer">
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ 
              width: `${((activeStage + 1) / stages.length) * 100}%`,
              backgroundColor: stages[activeStage].color
            }}
          />
        </div>
        <p className="visualization-note">
          Watch how 1GB of data transforms into just 11 bytes through our patented process
        </p>
      </div>
    </div>
  );
}