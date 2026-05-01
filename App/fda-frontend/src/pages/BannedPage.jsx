import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

function BannedPage() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { alpha: false });

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const foods = ["🍔", "🍟", "🍕", "🌮", "🍗", "🥤"];

    const particles = Array.from({ length: 50 }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      size: 22 + Math.random() * 10,
      char: foods[Math.floor(Math.random() * foods.length)],
      friction: 0.96,
      rotation: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.03,
    }));

    const handleMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };

      containerRef.current?.style.setProperty("--mouse-x", `${e.clientX}px`);
      containerRef.current?.style.setProperty("--mouse-y", `${e.clientY}px`);
    };

    const handleClick = () => {
      particles.forEach((p) => {
        const dx = p.x - mouseRef.current.x;
        const dy = p.y - mouseRef.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 250 && dist > 0) {
          const force = 12;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }
      });
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleClick);

    let animationFrame;

    const animate = () => {
      ctx.fillStyle = "#09090b";
      ctx.fillRect(0, 0, width, height);

      particles.forEach((p) => {
        const dx = p.x - mouseRef.current.x;
        const dy = p.y - mouseRef.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // mouse attraction/repulsion
        if (dist < 140 && dist > 0) {
          const force = (140 - dist) / 140;
          p.vx += (dx / dist) * force * 0.8;
          p.vy += (dy / dist) * force * 0.8;
        }

        // physics
        p.x += p.vx;
        p.y += p.vy;

        p.vx *= p.friction;
        p.vy *= p.friction;

        p.rotation += p.spin;

        // bounce
        if (p.x <= 0 || p.x >= width) p.vx *= -1;
        if (p.y <= 0 || p.y >= height) p.vy *= -1;

        // draw
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.font = `${p.size}px serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "rgba(255, 255, 255, 0.16)";
        ctx.fillText(p.char, 0, 0);
        ctx.restore();
      });

      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleClick);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-zinc-950 text-white px-4"
      style={{ "--mouse-x": "50%", "--mouse-y": "50%" }}
    >
      {/* Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Spotlight */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background: `radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(239, 68, 68, 0.15), transparent 80%)`,
        }}
      />

      {/* UI Card */}
      <div className="relative z-10 bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 p-8 rounded-3xl shadow-2xl max-w-md w-full text-center">
        <div className="text-6xl mb-6">🚫🍔💀</div>

        <h1 className="text-4xl font-black text-red-500 mb-2">
          BANNED.
        </h1>

        <p className="text-zinc-400 mb-6 font-medium">
          Wait... did you really try to:
        </p>

        <ul className="text-left text-sm text-zinc-400 space-y-3 mb-8 border-l-2 border-red-500/30 pl-4 font-mono">
          <li>🍕 Order 12 burgers and call it "meal prep"</li>
          <li>🛵 Try to teleport your rider manually</li>
          <li>😈 Excessive clicking (we saw everything)</li>
          <li>🍔 Asking for “extra cheese… emotionally”</li>
          <li>🫃🏻 Being fat in general...</li>
        </ul>

        <button
          onClick={() => navigate("/login")}
          className="w-full bg-red-600 hover:bg-red-500 transition py-3 rounded-xl font-bold text-lg"
        >
          Take me back
        </button>

        <p className="text-[10px] text-zinc-600 mt-6 uppercase tracking-widest">
          Error Code: 403_TOO_MUCH_SAUCE
        </p>
      </div>
    </div>
  );
}

export default BannedPage;