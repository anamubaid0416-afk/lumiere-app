import { useEffect, useRef, useState } from "react";
import { renderMakeupToCanvas } from "../lib/renderMakeup";

const FF = "'Palatino Linotype','Book Antiqua',Palatino,serif";

export default function MakeupRenderer({ imageSrc, palette, guide = false, title = "Makeup Preview", theme }) {
  const canvasRef = useRef(null);
  const [status, setStatus] = useState("Loading face renderer...");

  useEffect(() => {
    let cancelled = false;

    async function render() {
      if (!imageSrc || !canvasRef.current) return;
      setStatus("Applying landmark makeup...");

      try {
        const result = await renderMakeupToCanvas({
          imageSrc,
          canvas: canvasRef.current,
          palette,
          guide,
        });

        if (!cancelled) setStatus(result.ok ? "Rendered with MediaPipe landmarks" : result.reason || "Rendered with limited detection");
      } catch (error) {
        console.error("MakeupRenderer failed:", error);
        if (!cancelled) setStatus("Renderer unavailable");
      }
    }

    render();
    return () => { cancelled = true; };
  }, [imageSrc, palette, guide]);

  if (!imageSrc) return null;

  const T = theme || {};

  return (
    <div style={{background:T.bgDeep || "#091422",border:`1px solid ${T.border || "rgba(212,175,122,0.15)"}`,padding:10}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,marginBottom:8}}>
        <div style={{fontSize:8,letterSpacing:2,color:T.accent || "#D4AF7A",textTransform:"uppercase"}}>{title}</div>
        <div style={{fontSize:7,color:T.textMuted || "rgba(245,240,232,0.42)",letterSpacing:1,textAlign:"right"}}>{status}</div>
      </div>
      <canvas ref={canvasRef} style={{width:"100%",height:"auto",display:"block",background:"#000",border:`1px solid ${T.border || "rgba(212,175,122,0.15)"}`,fontFamily:FF}}/>
    </div>
  );
}
