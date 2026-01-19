import { NavLink, Route, Routes } from "react-router-dom";
import RuleListPage from "./pages/RuleListPage";
import ExecuteRulesPage from "./pages/ExecuteRulesPage";

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Validation Engine</h1>
        <nav className="nav">
          <NavLink to="/" end className="nav-link">
            Rules
          </NavLink>
          <NavLink to="/execute" className="nav-link">
            Execute
          </NavLink>
        </nav>
      </header>
      <main className="app-main">
        <Routes>
          <Route path="/" element={<RuleListPage />} />
          <Route path="/execute" element={<ExecuteRulesPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;

