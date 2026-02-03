"use client";

import { useEffect, useRef, useState } from "react";

export default function CircuitBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Create grid parameters - more sparse for subtlety
    const gridSize = 80; // Larger grid for minimalism
    const nodeRadius = 1.5; // Smaller nodes
    // Declare nodes and paths at this scope level to avoid the initialization error
    let nodes: { x: number; y: number; active: boolean; pulseOffset: number }[] = [];
    let paths: { start: number; end: number; progress: number; speed: number }[] = [];

    // Set canvas to full size with proper pixel ratio for crisp rendering
    const resizeCanvas = () => {
      const pixelRatio = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * pixelRatio;
      canvas.height = window.innerHeight * pixelRatio;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(pixelRatio, pixelRatio);
      initializeGrid();
    };

    // Track mouse movement
    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({ x: event.clientX, y: event.clientY });
    };

    // Initialize grid nodes
    function initializeGrid() {
      // Clear existing nodes and paths
      nodes = [];
      paths = [];
      
      // Create a grid of nodes
      for (let x = 0; x < window.innerWidth; x += gridSize) {
        for (let y = 0; y < window.innerHeight; y += gridSize) {
          // Much less jitter for geometric precision
          const jitterX = Math.random() * 2 - 1;
          const jitterY = Math.random() * 2 - 1;
          
          nodes.push({
            x: x + jitterX,
            y: y + jitterY,
            active: Math.random() > 0.85, // Only 15% of nodes active for subtlety
            pulseOffset: Math.random() * Math.PI * 2,
          });
        }
      }
      
      // Only create paths if we have nodes
      if (nodes.length === 0) return;
      
      // Create paths - fewer paths for minimalism
      const numPaths = Math.floor(nodes.length / 10); // Fewer paths
      
      for (let i = 0; i < numPaths; i++) {
        const start = Math.floor(Math.random() * nodes.length);
        
        // Only connect to horizontal or vertical neighbors for minimal, structured look
        let possibleEnds = nodes.map((node, index) => ({index, node})).filter(({index, node}) => {
          if (index === start) return false;
          const startNode = nodes[start];
          
          // Check if nodes are aligned horizontally or vertically (with small tolerance)
          const isHorizontalAlign = Math.abs(node.y - startNode.y) < 5;
          const isVerticalAlign = Math.abs(node.x - startNode.x) < 5;
          
          // Check if nodes are adjacent in the grid
          const distance = Math.sqrt(
            Math.pow(node.x - startNode.x, 2) + Math.pow(node.y - startNode.y, 2)
          );
          
          return (isHorizontalAlign || isVerticalAlign) && distance <= gridSize * 1.5;
        }).map(({index}) => index);
        
        if (possibleEnds.length === 0) continue;
        
        const end = possibleEnds[Math.floor(Math.random() * possibleEnds.length)];
        
        paths.push({
          start,
          end,
          progress: Math.random(),
          speed: 0.002 + Math.random() * 0.003, // Slower animation for subtlety
        });
      }
    }

    // Add event listeners
    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("mousemove", handleMouseMove);

    // Initial setup
    resizeCanvas();

    // Animation loop
    let animationFrameId: number;
    const render = (time: number) => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      // Subtle color palette
      const gridColor = 'rgba(210, 230, 250, 0.07)'; // Very light blue-grey with low opacity
      const lineColor = 'rgba(180, 210, 240, 0.18)';
      const dotColor = 'rgba(100, 180, 255, 0.6)';
      const nodeColor = 'rgba(180, 210, 240, 0.3)';
      const activeNodeColor = 'rgba(140, 200, 255, 0.5)';
      
      // Draw grid lines - more subtle
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 0.5;
      
      // Draw fewer grid lines for minimalism
      for (let y = 0; y < window.innerHeight; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(window.innerWidth, y);
        ctx.stroke();
      }
      
      for (let x = 0; x < window.innerWidth; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, window.innerHeight);
        ctx.stroke();
      }
      
      // Calculate mouse influence - nodes and paths respond to cursor
      const mouseInfluenceRadius = 150; // Area around cursor that affects nodes
      
      // Draw and animate paths
      paths.forEach(path => {
        // Check for valid indices
        if (path.start >= nodes.length || path.end >= nodes.length) return;
        
        const start = nodes[path.start];
        const end = nodes[path.end];
        
        // Calculate distance from path to mouse for interactivity
        const pathCenterX = (start.x + end.x) / 2;
        const pathCenterY = (start.y + end.y) / 2;
        const mouseDistance = Math.sqrt(
          Math.pow(mousePosition.x - pathCenterX, 2) + 
          Math.pow(mousePosition.y - pathCenterY, 2)
        );
        
        // Calculate influence factor - closer paths have more influence
        const mouseInfluence = mouseDistance < mouseInfluenceRadius
          ? 1 - (mouseDistance / mouseInfluenceRadius)
          : 0;
        
        // Calculate the point along the path based on progress
        const x = start.x + (end.x - start.x) * path.progress;
        const y = start.y + (end.y - start.y) * path.progress;
        
        // Draw the path line - very subtle
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = 0.5 + (mouseInfluence * 0.5);
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
        
        // Draw the moving dot
        const dotSize = 1 + (mouseInfluence * 1.5);
        ctx.fillStyle = dotColor;
        ctx.beginPath();
        ctx.arc(x, y, dotSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Update progress for animation - speed up when mouse is nearby
        path.progress += path.speed * (1 + (mouseInfluence * 2));
        if (path.progress > 1) {
          path.progress = 0;
        }
      });
      
      // Draw nodes with subtle pulsing effect
      nodes.forEach((node, i) => {
        // Calculate distance from node to mouse
        const mouseDistance = Math.sqrt(
          Math.pow(mousePosition.x - node.x, 2) + 
          Math.pow(mousePosition.y - node.y, 2)
        );
        
        // Calculate influence factor
        const mouseInfluence = mouseDistance < mouseInfluenceRadius
          ? 1 - (mouseDistance / mouseInfluenceRadius)
          : 0;
        
        // Increase chance of node being active when mouse is nearby
        const isActive = node.active || (mouseInfluence > 0.5);
        
        if (isActive) {
          // Very subtle pulse
          const pulseIntensity = 0.3 + 0.2 * Math.sin(time / 2000 + node.pulseOffset);
          const glowSize = 2 + pulseIntensity + (mouseInfluence * 2);
          
          // Draw subtle glow
          const gradient = ctx.createRadialGradient(
            node.x, node.y, 0,
            node.x, node.y, glowSize
          );
          gradient.addColorStop(0, 'rgba(140, 200, 255, 0.3)');
          gradient.addColorStop(1, 'rgba(140, 200, 255, 0)');
          
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(node.x, node.y, glowSize, 0, Math.PI * 2);
          ctx.fill();
        }
        
        // Draw the actual node - very small for subtlety
        ctx.fillStyle = isActive ? activeNodeColor : nodeColor;
        ctx.beginPath();
        ctx.arc(
          node.x, 
          node.y, 
          nodeRadius + (mouseInfluence * 1), 
          0, 
          Math.PI * 2
        );
        ctx.fill();
      });
      
      animationFrameId = requestAnimationFrame(render);
    };
    
    animationFrameId = requestAnimationFrame(render);
    
    // Clean up
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [mousePosition]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full -z-10"
      style={{ pointerEvents: 'none' }}
    />
  );
}
