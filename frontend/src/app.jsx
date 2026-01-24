import React from "react";
import { Routes, Route } from "react-router-dom";

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Routes>
        <Route
          path="/"
          element={
            <div className="min-h-screen grid place-items-center">
              Router OK
            </div>
          }
        />
      </Routes>
    </div>
  );
}
