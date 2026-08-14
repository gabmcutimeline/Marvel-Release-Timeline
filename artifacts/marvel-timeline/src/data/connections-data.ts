export interface Connection {
  fromId: string;
  toId: string;
  color: string;
  label?: string;
  anchorIsFrom?: boolean; // true si c'est fromId le point d'ancrage MCU (pas toId)
  internal?: boolean;     // true = connexion interne (ne touche pas directement le tronc MCU)
  branchLabelOverride?: string;
  toLabelOverride?: string;
  bend?: number; // de combien pousser la courbe sur le côté (en pixels). 0 = ligne directe. Positif = vers la droite/bas, négatif = vers la gauche/haut.
}

export const connections: Connection[] = [
  { fromId: "sf-8", toId: "os-4", color: "#33114e", label: "Agent Carter rejoint le MCU via son One-Shot", internal: true, branchLabelOverride: "Agent Carter" },
  { fromId: "sf-8", toId: "conn-aos", color: "#33114e", label: "Apparition au début d'AoS + l'Agent Sousa réapparaît en dernière saison", internal: true, branchLabelOverride: "Agent Carter" },
  { fromId: "conn-mcu-block", toId: "conn-aos", color: "#451b0e", label: "Les films MCU sont mentionnés dans la série", internal: true },
  { fromId: "snc-1", toId: "conn-aos", color: "#0c301e", label: "Apparition du Darkhold, design identique", internal: true },
  { fromId: "snc-2a", toId: "snc-1", color: "#490e29", label: "Apparition dans la saison 3", internal: true, branchLabelOverride: "Cloak & Dagger", toLabelOverride: "Runaways" },
  { fromId: "snc-2a", toId: "sn-4", color: "#490e29", label: "L'officier O'Reilly est mentionné", internal: true, branchLabelOverride: "Cloak & Dagger", toLabelOverride: "Luke Cage" },
  { fromId: "sn-4", toId: "snc-2a", color: "#471215", label: "Les événements de Luke Cage lus dans le journal", internal: true, branchLabelOverride: "Luke Cage", toLabelOverride: "Cloak & Dagger" },
  { fromId: "s-m-1", toId: "m-27", color: "#0c301e", label: "Spider-Man et ses antagonistes réapparaissent", branchLabelOverride: "La saga Spider-Man (Sam Raimi)" },
  { fromId: "s-g-1", toId: "m-27", color: "#14224f", label: "Spider-Man et ses antagonistes réapparaissent", branchLabelOverride: "La saga Spider-Man (Andrew Garfield)" },
  { fromId: "so-s-2", toId: "m-27", color: "#3f250d", label: "Venom téléporté dans le MCU puis renvoyé" },
  { fromId: "x-2", toId: "s-1", color: "#0c301e", label: "Evan Peters fait un cameo en tant que Quicksilver", branchLabelOverride: "" },
  { fromId: "m-27", toId: "so-s-3", color: "#3f250d", label: "Le Vautour se téléporte dans l'univers de Morbius", anchorIsFrom: true },
  { fromId: "m-17", toId: "s-a-2", color: "#3c1d5b", label: "Aaron Davis (Donald Glover) reprend son rôle", anchorIsFrom: true },
  { fromId: "sn-1", toId: "m-27", color: "#471215", label: "Première apparition du personnage dans le MCU", branchLabelOverride: "Daredevil (Netflix)" },
  { fromId: "sn-1", toId: "s-3", color: "#471215", label: "Première apparition du Caïd dans le MCU", branchLabelOverride: "Daredevil (Netflix)" },
  { fromId: "sf-10", toId: "m-28", color: "#0e2d3a", label: "Apparition de Black Bolt (clin d'œil)" },
  { fromId: "leg-11", toId: "m-34", color: "#471215", label: "Apparition de Blade", branchLabelOverride: "La saga Blade" },
  { fromId: "x-6", toId: "m-34", color: "#33114e", label: "Plusieurs personnages X-Men reviennent", branchLabelOverride: "La saga X-Men" },
  { fromId: "leg-1", toId: "m-34", color: "#471215", label: "Elektra présente, Daredevil mentionné", branchLabelOverride: "Daredevil & Elektra (Fox)" },
  { fromId: "leg-3", toId: "m-34", color: "#14224f", label: "La Torche Humaine présente, Mr Fantastique mentionné", branchLabelOverride: "Les 4 Fantastiques (saga Fox)" },
  { fromId: "leg-8", toId: "m-34", color: "#262628", label: "Le Punisher est mentionné" },
  { fromId: "x-a-92", toId: "x-a-1", color: "#f97316", label: "Préquelle directe de X-Men '97" },
];
