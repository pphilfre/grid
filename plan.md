🌓 The Interface: "Palantir Vibe"
Aesthetic: Deep charcoal backgrounds (#0A0A0A), "Electric Blue" or "Success Green" highlights, and razor-thin borders.

Vercel-style DX: Keyboard shortcuts for everything (Cmd+K to search), instant loading states, and toast notifications for data fetching.

🗺️ Page 1: The Tactical Map (GEOINT)
The "Drop-Zone" Upload: A minimalist file uploader that instantly triggers a multi-step AI pipeline (EXIF extraction -> Landmark Recognition -> Shadow Analysis).

Dual-Pane Verification: A split-screen UI. On the left, the uploaded photo; on the right, the Google Street View or Mapbox 3D Globe.

The Time-Machine Slider: A vertical slider on the map edge to cycle through historical satellite imagery (using Sentinel-Hub or Google Earth Engine).

3D Mesh Toggle: High-fidelity 3D building data with tilt-and-rotate controls (Shift+Drag).

🔍 Page 2: The Infrastructure Lab (OSINT)
Censys/Shodan Command Line: A sleek input bar that accepts IPs, Domains, or CIDR blocks. Results are displayed in a "Code Block" style for easy reading.

DNS Spider Graph: A node-based visualization (using React Flow or D3.js) showing how a domain branches out to A, MX, and TXT records.

BGP Path Animator: A map layer that draws the physical fiber-optic path from your current location to the target IP's data center.

WHOIS Timeline: A vertical "git-style" commit history showing exactly when registrar data changed.

🛰️ Page 3: The Monitor (Modern Situational Awareness)
The "Pulse" Feed: A real-time terminal stream of events (e.g., "New SSL cert detected for Target.com," "Ship entered exclusion zone at [Coordinates]").

Geofenced Alerts: A feature where you draw a circle on the map; if a new social media post or satellite change is detected in that circle, your phone gets a push notification.

Heatmaps: Visualize "Global Noise"—where is the most digital or physical activity happening right now?

📝 The "Master Build" Prompt
Copy and paste this into an AI (like Gemini 1.5 Pro or GPT-4o) to start the code generation:

"Act as a Senior Full-Stack Engineer and OSINT Specialist. I want to build 'Project Aegis,' a Vercel-styled GEOINT/OSINT platform inspired by Palantir's UI.

Core Tech Stack: Next.js 14 (App Router), Tailwind CSS, Framer Motion for animations, Mapbox GL JS for the globe, and FastAPI (Python) for the heavy data lifting.

Task 1: The Tactical Map UI. Create a dark-mode dashboard with a sidebar. The main view is a Mapbox globe. Implement a 'Split View' component that can toggle between a user-uploaded image and a Mapbox 'Street View' equivalent. Include a 'Time Slider' for historical satellite layers.

Task 2: The Infrastructure Sidebar. Build a Censys/WHOIS search interface. Data must be displayed in a high-contrast 'Bento Box' grid. Use React Flow to create a 'DNS Visualizer' component that maps domain relationships.

Task 3: Logic. Write the Python logic to extract EXIF data from an image and return a Mapbox 'FlyTo' coordinate. Integrate a BGP routing API (like BGPView) to draw the data path on the map.

Design Language: Use a #050505 background, #111 border-colors, and 'Geist Mono' font. Every action should feel like a 'command' being executed in a high-security environment."