export type Preferences = Record<string, string[]>;
export type ProjectPoints = Record<string, number>;
type Assignments = Record<
  string,
  {
    projects: string[];
    storyPoints: number;
    denied: number;
  }
>;
type AssignmentEntries = [keyof Assignments, Assignments[keyof Assignments]][];

const getLowestPoints = (assignmentEntries: AssignmentEntries): number => {
  return assignmentEntries.reduce((acc, [, { storyPoints }]) => {
    if (storyPoints < acc) {
      acc = storyPoints;
    }
    return acc;
  }, 100000);
};

const getHighestDenied = (assignmentEntries: AssignmentEntries): number => {
  return assignmentEntries.reduce((acc, [, { denied }]) => {
    if (denied > acc) {
      acc = denied;
    }
    return acc;
  }, 0);
};

const chooseNextDev = (
  assignments: Assignments,
  preferences: Preferences
): {
  selectedDev: string;
  notSelectedDevs: string[];
  wasRandomlyChosen: boolean;
} => {
  const devsWithPreferences = Object.entries(preferences)
    .filter(([, preferences]) => preferences.length)
    .map(([dev]) => dev);

  const assignmentEntries = Object.entries(assignments);
  const lowestPoints = getLowestPoints(assignmentEntries);

  const assignmentsWithLessPoints = assignmentEntries
    .filter(([, { storyPoints }]) => storyPoints === lowestPoints)
    .filter(([dev]) => devsWithPreferences.includes(dev));

  const highestDenied = getHighestDenied(assignmentsWithLessPoints);

  const eligibleDevs = assignmentsWithLessPoints
    .filter(([, { denied }]) => denied === highestDenied)
    .map(([name]) => name);

  const elegibleCount = eligibleDevs.length;

  if (elegibleCount === 1) {
    return {
      selectedDev: eligibleDevs[0],
      notSelectedDevs: [],
      wasRandomlyChosen: false,
    };
  }

  const randomIndex = Math.floor(Math.random() * elegibleCount);
  const selectedDev = eligibleDevs[randomIndex];
  return {
    selectedDev,
    notSelectedDevs: eligibleDevs.filter((dev) => dev !== selectedDev),
    wasRandomlyChosen: true,
  };
};

export const getAssignments = (
  projectsPoints: ProjectPoints,
  preferences: Preferences
): Assignments => {
  if (!projectsPoints || !preferences) {
    throw new Error("Missing projectsPoints or preferences");
  }
  console.log("\n----------------- START -----------------");

  const devs = Object.keys(preferences);

  const assignments: Assignments = devs.reduce(
    (acc, dev) => ({
      ...acc,
      [dev]: {
        projects: [],
        storyPoints: 0,
        denied: 0,
      },
    }),
    {}
  );

  const availableProjects = Object.keys(projectsPoints);
  let remainingProjects = availableProjects;

  while (remainingProjects.length) {
    const { selectedDev, wasRandomlyChosen, notSelectedDevs } = chooseNextDev(
      assignments,
      preferences
    );

    const preferenceString = `Wishes: ${Object.entries(preferences)
      .map(([dev, prefs]) => `${dev}: ${prefs[0]}`)
      .join(", ")}`;

    let preferedProject: string;

    do {
      // loop through the preferences until we find a project that is available
      if (preferences[selectedDev].length === 0) break; // no more preferences
      preferedProject = preferences[selectedDev].shift();
    } while (!remainingProjects.includes(preferedProject));

    if (!preferedProject) continue; // in case there was no more preferences we choose a new dev.

    console.log(
      `${preferenceString} --> ${selectedDev} gets ${preferedProject} and has ${
        assignments[selectedDev].storyPoints + projectsPoints[preferedProject]
      } SP`
    );

    if (wasRandomlyChosen) {
      // increase denied if other dev were interested
      for (const dev in preferences) {
        const devPreferences = preferences[dev];
        if (
          devPreferences[0] === preferedProject &&
          notSelectedDevs.includes(dev)
        ) {
          console.log(
            `---- ${dev} was interested in ${preferedProject} but ${selectedDev} was chosen`
          );
          assignments[dev].denied += 1;
        }
      }
    }

    // updates assignments with the prefered project
    assignments[selectedDev].projects.push(preferedProject);
    assignments[selectedDev].storyPoints += projectsPoints[preferedProject];

    // updates preferences by removing selected project
    for (const dev in preferences) {
      preferences[dev] = preferences[dev].filter(
        (project) => project !== preferedProject
      );
    }

    // updates remaining projects
    remainingProjects = remainingProjects.filter((p) => p !== preferedProject);
  }

  console.log("----------------- END -----------------\n");

  return assignments;
};
