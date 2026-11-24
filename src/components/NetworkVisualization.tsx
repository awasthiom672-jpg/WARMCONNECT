import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { NETWORK_NODES, NETWORK_EDGES } from '../data/mockData';
import { institutionName } from '../lib/appConfig';

export const NetworkVisualization: React.FC = () => {
  const [activeNodeId, setActiveNodeId] = useState<string | null>('glau');
  const [filterType, setFilterType] = useState<string>('all');

  const networkNodes = NETWORK_NODES.map((node) => ({
    ...node,
    label: node.id === 'glau' ? institutionName : node.label.replaceAll('GLAU', institutionName).replaceAll('GLA University', institutionName),
    info: node.id === 'glau'
      ? 'Institutional hub shown for illustration; no live alumni relationships are inferred.'
      : node.info.replaceAll('GLAU', institutionName).replaceAll('GLA University', institutionName),
  }));
  const activeNode = networkNodes.find((n) => n.id === activeNodeId) || networkNodes[0];

  const connectedNodeIds = new Set<string>();
  if (activeNodeId) {
    connectedNodeIds.add(activeNodeId);
    NETWORK_EDGES.forEach((edge) => {
      if (edge.source === activeNodeId) connectedNodeIds.add(edge.target);
      if (edge.target === activeNodeId) connectedNodeIds.add(edge.source);
    });
  }

  // Filter nodes honestly by selected category while retaining the central hub
  const visibleNodes = networkNodes.filter((n) => {
    if (filterType === 'all') return true;
    return n.type === filterType || n.type === 'hub';
  });

  const visibleNodeIds = new Set(visibleNodes.map((n) => n.id));

  return (
    <section id="network-graph" className="py-28 bg-[#0B0C10] text-[#F5F5F7] border-t border-white/10 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="text-[11px] font-medium tracking-[0.24em] uppercase text-[#9FA6B2] mb-3">
              Graph Topology · Constellation
            </div>
            <h2 className="text-3xl sm:text-5xl font-extralight text-[#F5F5F7] tracking-[-0.02em]">
              Your Network, <span className="font-normal chrome-text">Intelligently Connected</span>
            </h2>
            <p className="text-sm sm:text-base text-[#9FA6B2] font-light mt-3 max-w-xl">
              Explore an illustrative model of {institutionName} academic branches, alumni profiles, and example research or industry hubs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 bg-[#050507] p-1.5 rounded-full border border-white/10 text-xs">
            {[
              { id: 'all', label: 'All Nodes' },
              { id: 'dept', label: 'Departments' },
              { id: 'alumni', label: 'Alumni Mentors' },
              { id: 'company', label: 'Industry Hubs' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterType(tab.id)}
                className={`px-3.5 py-1.5 rounded-full font-normal transition-colors cursor-pointer ${
                  filterType === tab.id
                    ? 'bg-[#F5F5F7] text-[#050507] font-medium'
                    : 'text-[#9FA6B2] hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* SVG Gallery Canvas */}
        <div className="relative rounded-2xl bg-[#050507] border border-white/10 shadow-2xl overflow-hidden p-4 sm:p-8">
          <div className="sm:absolute sm:top-6 sm:left-6 z-20 max-w-xs p-4 rounded-xl bg-[#0B0C10]/90 backdrop-blur-md border border-white/15 shadow-xl mb-4 sm:mb-0">
            <div className="flex items-center gap-2 text-[10px] text-[#D4D8E1] font-medium uppercase tracking-[0.18em] mb-1.5">
              <Sparkles className="w-3 h-3" />
              <span>Selected Node</span>
            </div>
            <div className="text-sm font-medium text-[#F5F5F7] mb-1">{activeNode.label}</div>
            <div className="text-xs text-[#9FA6B2] font-light leading-relaxed">{activeNode.info}</div>
            <div className="mt-3 pt-2 border-t border-white/10 text-[10px] text-[#9FA6B2]/70">
              Select or focus any node to inspect pathways
            </div>
          </div>

          <p className="mb-3 text-[11px] leading-relaxed text-[#9FA6B2]">Illustrative network only. Lines do not represent verified personal relationships, endorsements, or live employer connections.</p>
          <div className="w-full overflow-x-auto">
            <svg
              viewBox="0 0 900 480"
              role="img"
              aria-label="Illustrative alumni ecosystem network graph"
              className="w-full h-auto min-w-[680px] select-none"
              style={{ maxHeight: '520px' }}
            >
              <defs>
                <filter id="silver-glow" x="-25%" y="-25%" width="150%" height="150%">
                  <feGaussianBlur stdDeviation="3.5" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {NETWORK_EDGES.map((edge, index) => {
                if (!visibleNodeIds.has(edge.source) || !visibleNodeIds.has(edge.target)) return null;
                const sourceNode = networkNodes.find((n) => n.id === edge.source);
                const targetNode = networkNodes.find((n) => n.id === edge.target);
                if (!sourceNode || !targetNode) return null;

                const isConnected = activeNodeId === edge.source || activeNodeId === edge.target;
                const isDimmed = activeNodeId && !isConnected;

                return (
                  <line
                    key={`edge-${index}`}
                    x1={sourceNode.x}
                    y1={sourceNode.y}
                    x2={targetNode.x}
                    y2={targetNode.y}
                    stroke={isConnected ? '#F5F5F7' : 'rgba(255, 255, 255, 0.14)'}
                    strokeWidth={isConnected ? 1.8 : 1}
                    strokeDasharray={isConnected ? 'none' : '3 4'}
                    opacity={isDimmed ? 0.18 : 1}
                    className="transition-all duration-300"
                  />
                );
              })}

              {visibleNodes.map((node) => {
                const isSelected = activeNodeId === node.id;
                const isConnected = connectedNodeIds.has(node.id);
                const isDimmed = activeNodeId && !isConnected;

                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x}, ${node.y})`}
                    className="cursor-pointer group focus:outline-none"
                    onClick={() => setActiveNodeId(node.id)}
                    onMouseEnter={() => setActiveNodeId(node.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setActiveNodeId(node.id);
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    onFocus={() => setActiveNodeId(node.id)}
                    aria-label={node.label}
                  >
                    {isSelected && (
                      <circle
                        r={node.radius + 7}
                        fill="none"
                        stroke="rgba(245, 245, 247, 0.5)"
                        strokeWidth="1.2"
                      />
                    )}

                    <circle
                      r={node.radius}
                      fill={node.color}
                      stroke={isSelected ? '#FFFFFF' : '#050507'}
                      strokeWidth={isSelected ? 2.5 : 1.5}
                      filter={isSelected ? 'url(#silver-glow)' : undefined}
                      opacity={isDimmed ? 0.35 : 1}
                      className="transition-all duration-300"
                    />

                    <text
                      y={node.radius + 16}
                      textAnchor="middle"
                      fill={isSelected ? '#F5F5F7' : isDimmed ? '#525866' : '#CBD5E1'}
                      fontSize={node.type === 'hub' ? 12 : 11}
                      fontWeight={isSelected ? 500 : 400}
                      className="transition-colors pointer-events-none select-none font-sans"
                    >
                      {node.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs text-[#9FA6B2]">
            <div className="flex flex-wrap items-center gap-5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F5F5F7]" />
                <span>{institutionName} Hub</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#9FA6B2]" />
                <span>Departments</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E4E7EE]" />
                <span>Alumni Mentors</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#64748B]" />
                <span>Industry Hubs</span>
              </div>
            </div>

            <div className="text-[11px] font-mono text-[#9FA6B2]/75">
              Interactive Graph · Keyboard accessible
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
