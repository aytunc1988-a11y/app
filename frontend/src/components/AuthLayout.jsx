import React from "react";
import { Link } from "react-router-dom";

export default function AuthLayout({ icon: Icon, title, subtitle, children, footer }) {
  return (
    <div className="modern-auth-shell min-h-screen bg-background flex flex-col items-center justify-center px-5 py-10" style={{ fontFamily: "Space Grotesk, Inter, sans-serif" }}>
      <Link to="/" className="font-heading text-2xl tracking-tight mb-6">
        LAP<span className="bg-[#f6f3a0] border-2 border-black px-1.5 ml-1 rounded-md">QUIZ</span>
      </Link>
      <div className="modern-auth-card brutal bg-card w-full max-w-md p-7">
        <div className="flex flex-col items-center text-center mb-6">
          {Icon ? (
            <div className="w-12 h-12 border-2 border-black rounded-xl bg-[#FDFFB6] grid place-items-center mb-3">
              <Icon className="w-6 h-6" />
            </div>
          ) : null}
          <h1 className="font-heading text-2xl leading-tight">{title}</h1>
          {subtitle ? <p className="text-sm text-muted-foreground mt-1">{subtitle}</p> : null}
        </div>
        {children}
        {footer ? <div className="text-center text-sm text-muted-foreground mt-6">{footer}</div> : null}
      </div>
    </div>
  );
}
