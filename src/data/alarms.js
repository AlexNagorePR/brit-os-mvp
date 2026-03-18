export const FAKE_ALARMS = [
  {
    id: "a1",
    timestamp: "2026-03-18T10:42:11Z",
    level: "ERROR",
    title: "Sobretemperatura motor derecho",
    action: "Reboot Robot",
    source: {
      id: "1",
      label: "Driver 1 (Motor dch)",
    },
    details: [
      { key: "Motores", value: "Motor derecho" },
      { key: "Codigo", value: "Sobretemperatura" },
      { key: "Subcodigo", value: "Temperatura crítica" },
    ],
    active: true,
  },
  {
    id: "a2",
    timestamp: "2026-03-18T10:44:03Z",
    level: "WARN",
    title: "Corriente fuera de tolerancia",
    action: "Reset alarm",
    source: {
      id: "2",
      label: "Driver 2 (Motor izq)",
    },
    details: [
      { key: "Motores", value: "Motor izquierdo" },
      { key: "Codigo", value: "Corriente fuera de tolerancia" },
      { key: "Subcodigo", value: "Pico intermitente" },
    ],
    active: true,
  },
  {
    id: "a3",
    timestamp: "2026-03-18T10:45:50Z",
    level: "STALE",
    title: "Estado de controlador no actualizado",
    action: "Contact Phenomenon Robotics",
    source: {
      id: "0",
      label: "Controlador/Gestor de esclavos",
    },
    details: [
      { key: "Motores", value: "Sistema general" },
      { key: "Codigo", value: "Telemetría desactualizada" },
      { key: "Subcodigo", value: "Timeout de publicación" },
    ],
    active: true,
  },
];