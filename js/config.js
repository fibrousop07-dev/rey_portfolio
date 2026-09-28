window.PORTFOLIO_CONFIG = {
  identity: {
    name: "Reyansh Babbar",
    title: "Robotics, Drones & AI Engineer",
    tagline: "I build things that fly, sense, and learn.",
    bio: "Developer working across embedded systems, autonomous drones, and computer vision. I design custom flight controllers on ESP32, ship TensorFlow detectors for edge inference, and build full-stack web products."
  },

  assets: {
    video: "assets/video/bg.mp4?v=3",
    audio: "song.mp3",
    poster: "assets/video/poster.jpg?v=3"
  },

  socials: {
    github: "https://github.com/reythegreat07",
    discord: "https://discord.com/users/reythefnpro",
    email: "reyanshbabbar0702@gmail.com"
  },

  skills: {
    "Expert":            ["Arduino"],
    "Embedded & IoT":    ["ESP32", "ESP8266", "Raspberry Pi", "DHT11", "I2C / UART"],
    "Drones & Robotics": ["ArduPilot", "ArduCopter", "MAVLink", "BLDC / ESCs", "Mission Planner", "SITL"],
    "Languages":         ["Python", "Rust", "C", "C++", "Java", "JavaScript"],
    "AI / ML / CV":      ["TensorFlow", "OpenCV", "SSD MobileNet", "Object Detection"],
    "Web Development":   ["HTML5", "CSS3", "JavaScript", "PHP", "Full-Stack"],
    "Cloud & DevOps":    ["Cloud Computing", "VPS", "Linux Ops", "DevOps"],
    "Tools":             ["Git", "ESP-IDF", "PlatformIO", "esptool"],
    "Currently Learning": ["Music Production", "Pentesting"]
  },

  projects: [
    {
      title: "Rey FC 11 | ESP32 Flight Controller",
      description: "Custom ArduPilot port on an ESP32-WROOM-32. Wrote a custom IMU driver for counterfeit MPU6050 silicon, fixed watchdog reboots from a fake QMC5883P compass, and authored the full board definition. Mission Planner connects live over MAVLink / WiFi.",
      tech: ["C / C++", "ESP-IDF", "ArduPilot", "ArduCopter", "MAVLink", "I2C / UART"],
      image: "assets/img/projects/reyfc11.webp",
      github: "",
      highlights: [
        "Custom AP_InertialSensor_ReyMPU driver for undocumented WHO_AM_I=0x7D IMU",
        "Full hwdef.dat board definition (GPIO map, UART map, RCOUT, WiFi MAVLink telemetry)",
        "Root-caused I2C watchdog loop; clock reduced 400 kHz -> 100 kHz to stabilise bus",
        "90-second clean soak, Mission Planner connects on COM10 @115200"
      ]
    },
    {
      title: "Aware Drive Notifier",
      description: "Real-time object detection fused with an ultrasonic sensor on a Raspberry Pi 3. SSD MobileNet V2/V3 (COCO) runs alongside an HC-SR04 with OLED / LCD feedback and speech output for driver awareness.",
      tech: ["Python", "TensorFlow", "OpenCV", "Raspberry Pi", "GPIO", "COCO SSD"],
      image: "assets/img/projects/aware-drive.webp",
      github: "",
      highlights: [
        "Iterated three detection pipelines until inference was stable on Pi 3",
        "Sensor fusion between vision and ultrasonic for proximity alerts",
        "Speech synthesis module speaks the current detection state",
        "Caffe + TensorFlow frozen graphs with MobileNet feature extractor"
      ]
    },
    {
      title: "DiseaseShield AI",
      description: "ESP8266 IoT node predicting disease outbreak risk (Dengue / Malaria). Reads DHT11 temperature + humidity plus community factors, applies a weighted scoring engine, and serves a responsive dashboard at 192.168.4.1.",
      tech: ["ESP8266", "Arduino", "DHT11", "Embedded Web Server", "Rule-Based AI"],
      image: "assets/img/projects/disease-shield.webp",
      github: "",
      highlights: [
        "Full responsive web dashboard hosted directly on the MCU",
        "Multi-factor weighted scoring (temp, humidity, population, rainfall, water stagnation)",
        "Risk-tiered output (LOW / MEDIUM / HIGH) with preventive measures",
        "Self-hosted softAP with no external backend dependency"
      ]
    },
    {
      title: "MAHIKALA | Marketplace Platform",
      description: "Full-stack marketplace with a customer-facing storefront and a producer dashboard. Handles auth, registration, product browse, and a complete payment + confirmation flow end-to-end.",
      tech: ["HTML5", "CSS3", "JavaScript", "PHP", "Full-Stack"],
      image: "assets/img/projects/mahikala.jpg",
      github: "",
      highlights: [
        "Multi-page UX: login, registration, products, payment, payment confirmation",
        "Dual-side architecture: customer storefront + producer backend",
        "Shared theming system across pages with responsive layout",
        "Form-driven checkout wired through PHP backend"
      ]
    },
    {
      title: "StoneMC | Minecraft Network",
      description: "End-to-end Minecraft network built from scratch: custom lifesteal + practice game modes implemented as Java plugins, self-hosted on a Linux box managed through Pterodactyl, with a fully designed marketing + community site on stonemc.xyz.",
      tech: ["Java", "MySQL", "Bukkit / Spigot", "Linux", "Pterodactyl", "HTML / CSS / JS"],
      image: "assets/img/projects/stonemc.webp",
      github: "",
      live: "https://stonemc.xyz",
      highlights: [
        "Custom Java plugin suite covering lifesteal and practice game modes",
        "Self-hosted on a Linux server managed entirely through the Pterodactyl panel",
        "Full marketing + community website designed and shipped at stonemc.xyz",
        "Built the underlying network stack from zero: MySQL, proxy, anti-cheat hooks, backups"
      ]
    }
  ]
};
