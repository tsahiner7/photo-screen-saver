import "./index.scss"
import "bootstrap/dist/css/bootstrap.min.css"

import { createRoot } from "react-dom/client"
import { App } from "./app"

createRoot(document.getElementById("root")!).render(<App/>)
