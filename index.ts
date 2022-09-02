import { getAssignments, Preferences, ProjectPoints } from "./getAssignments";

const projectsP: ProjectPoints = {
  A: 2,
  B: 5,
  C: 3,
  D: 1,
  E: 3,
  F: 5,
  G: 3,
  H: 2,
};

const preferences: Preferences = {
  Gary: ["A", "B", "C", "D", "E", "F", "G", "H"],
  Aurelie: ["A", "B", "C", "D", "E", "F", "G", "H"],
  Eddine: ["A", "B", "C", "D", "E", "F", "G", "H"],
  Aloun: ["A", "B", "C", "D", "E", "F", "G", "H"],
};

const results = getAssignments(projectsP, preferences);

for (const name in results) {
  console.log(name, results[name]);
}
