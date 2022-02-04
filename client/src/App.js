import { Spotify } from "./components/Spotify";
import "bootstrap/dist/css/bootstrap.min.css";
import { Dashboard } from "./components/Dashboard";



const code = new URLSearchParams(window.location.search).get("code");

function App() {
  return (
    <div>
      {code ? <Dashboard code={code} /> : <Spotify />}
    </div>
    )
}

export default App;
