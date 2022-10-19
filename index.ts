import { getAssignments, Preferences, ProjectPoints } from "./getAssignments";

const projectsPoints: ProjectPoints = {
  "24.03. Group edition side panel": 8,
  "24.02. learner side panel + invitation date": 5,
  "24.06. decide diffusion mode of publication": 5,
  "24.01. add filters and search to groups and learners": 3,
  "24.04. platform invitation email": 3,
  "24.09. setup hotjar": 1,
};

const preferences: Preferences = {
  Aurelie: [
    "24.03. Group edition side panel",
    "24.01. add filters and search to groups and learners",
    "24.02. learner side panel + invitation date",
    "24.04. platform invitation email",
    "24.09. setup hotjar",
    "24.06. decide diffusion mode of publication",
  ],
  Eddine: [
    "24.01. add filters and search to groups and learners",
    "24.02. learner side panel + invitation date",
    "24.03. Group edition side panel",
    "24.04. platform invitation email",
    "24.06. decide diffusion mode of publication",
    "24.09. setup hotjar",
  ],
  Aloun: [
    "24.06. decide diffusion mode of publication",
    "24.04. platform invitation email",
    "24.03. Group edition side panel",
    "24.02. learner side panel + invitation date",
    "24.01. add filters and search to groups and learners",
    "24.09. setup hotjar",
  ],
};

const results = getAssignments(projectsPoints, preferences);

for (const name in results) {
  console.log(name, results[name]);
}
