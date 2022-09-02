export type Preferences = Record<string, string[]>;
export type ProjectPoints = Record<string, number>;
type DevAssignments = {
  projects: string[];
  storyPoints: number;
  denied: number;
  chosenDeterministically: number;
  chosenRandomly: number;
};

type Assignments = Record<string, DevAssignments>;
type AssignmentEntries = [keyof Assignments, Assignments[keyof Assignments]][];

const getLowestPoints = (
  assignmentEntries: Readonly<AssignmentEntries>
): number => {
  const storyPoints = assignmentEntries.map(
    ([, { storyPoints }]) => storyPoints
  );
  return Math.min(...storyPoints);
};

const getHighestDenied = (
  assignmentEntries: Readonly<AssignmentEntries>
): number => {
  const deniedCounts = assignmentEntries.map(([, { denied }]) => denied);
  return Math.max(...deniedCounts);
};

interface GetEligibleDevsArgs {
  assignments: Readonly<Assignments>;
  preferences: Readonly<Preferences>;
}

const getEligibleDevs = ({
  assignments,
  preferences,
}: GetEligibleDevsArgs): string[] => {
  const devsWithPreferences = Object.entries(preferences)
    .filter(([, preferences]) => preferences.length)
    .map(([dev]) => dev);

  const assignmentEntries = Object.entries(assignments);
  const lowestPoints = getLowestPoints(assignmentEntries);

  const assignmentsWithLessPoints = assignmentEntries
    .filter(([, { storyPoints }]) => storyPoints === lowestPoints)
    .filter(([dev]) => devsWithPreferences.includes(dev));

  const highestDenied = getHighestDenied(assignmentsWithLessPoints);

  return assignmentsWithLessPoints
    .filter(([, { denied }]) => denied === highestDenied)
    .map(([name]) => name);
};

const chooseNextDev = ({
  assignments,
  preferences,
}: GetEligibleDevsArgs): {
  selectedDev: string;
  notSelectedDevs: string[];
  wasRandomlyChosen: boolean;
} => {
  const eligibleDevs = getEligibleDevs({ assignments, preferences });

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

const createAssignments = (preferences: Readonly<Preferences>): Assignments => {
  const devs = Object.keys(preferences);

  return devs.reduce((acc, dev) => {
    const newDevAssignment: DevAssignments = {
      projects: [],
      storyPoints: 0,
      denied: 0,
      chosenRandomly: 0,
      chosenDeterministically: 0,
    };
    return {
      ...acc,
      [dev]: newDevAssignment,
    };
  }, {});
};

const getWishesString = (preferences: Readonly<Preferences>): string => {
  return (
    "\n" +
    `Wishes: ${Object.entries(preferences)
      .map(([dev, prefs]) => `${dev}: ${prefs[0]}`)
      .join(", ")}`
  );
};

const logSituation = ({
  preferences,
  selectedDev,
  preferedProject,
  assignments,
  projectsPoints,
}: {
  preferences: Readonly<Preferences>;
  selectedDev: string;
  preferedProject: string;
  assignments: Readonly<Assignments>;
  projectsPoints: Readonly<ProjectPoints>;
}): void => {
  const wishesString = getWishesString(preferences);
  const projectPoint = projectsPoints[preferedProject];
  const currentDevPoints = assignments[selectedDev].storyPoints;

  console.log(
    `${wishesString} --> ${selectedDev} gets ${preferedProject} and has ${
      currentDevPoints + projectPoint
    } SP`
  );
};

const logDeniedDevs = ({
  deniedDevs,
  preferedProject,
  selectedDev,
}: {
  deniedDevs: string[];
  preferedProject: string;
  selectedDev: string;
}) => {
  console.log(
    `     []xxx[]=============> ${deniedDevs.join(", ")} ${
      deniedDevs.length > 1 ? "were" : "was"
    } interested in ${preferedProject} but ${selectedDev} won`
  );
};

const increasedDenied = ({
  wasRandomlyChosen,
  preferences,
  preferedProject,
  notSelectedDevs,
  assignments,
  selectedDev,
}: {
  wasRandomlyChosen: boolean;
  preferences: Readonly<Preferences>;
  preferedProject: string;
  notSelectedDevs: string[];
  assignments: Assignments;
  selectedDev: string;
}): void => {
  let deniedDevs = [];
  if (wasRandomlyChosen) {
    // increase denied if other dev were interested
    for (const dev in preferences) {
      const devPreferences = { ...preferences[dev] };
      if (
        devPreferences[0] === preferedProject &&
        notSelectedDevs.includes(dev)
      ) {
        assignments[dev].denied += 1;
        deniedDevs.push(dev);
      }
    }
  }

  if (deniedDevs.length) {
    logDeniedDevs({
      deniedDevs,
      preferedProject,
      selectedDev,
    });
  }
};

export const assignAProject = ({
  preferences,
  projectsPoints,
  assignments,
  remainingProjects,
}: {
  preferences: Preferences;
  projectsPoints: Readonly<ProjectPoints>;
  assignments: Assignments;
  remainingProjects: string[];
}) => {
  const { selectedDev, wasRandomlyChosen, notSelectedDevs } = chooseNextDev({
    assignments,
    preferences,
  });

  logSituation({
    preferences,
    selectedDev,
    preferedProject: preferences[selectedDev][0],
    assignments,
    projectsPoints,
  });

  const preferedProject = preferences[selectedDev].shift();

  increasedDenied({
    wasRandomlyChosen,
    preferences,
    preferedProject,
    notSelectedDevs,
    assignments,
    selectedDev,
  });

  // updates assignments with the prefered project
  assignments[selectedDev].projects.push(preferedProject);
  assignments[selectedDev].storyPoints += projectsPoints[preferedProject];
  if (wasRandomlyChosen) {
    assignments[selectedDev].chosenRandomly += 1;
  } else {
    assignments[selectedDev].chosenDeterministically += 1;
  }

  // updates preferences by removing selected project
  for (const dev in preferences) {
    preferences[dev] = preferences[dev].filter(
      (project) => project !== preferedProject
    );
  }

  // updates remaining projects
  remainingProjects = remainingProjects.filter((p) => p !== preferedProject);
};

export const getAssignments = (
  projectsPoints: ProjectPoints,
  preferences: Preferences
): Assignments => {
  if (!projectsPoints || !preferences) {
    throw new Error("Missing projectsPoints or preferences");
  }
  console.log("\n\n\n----------------- START -----------------");

  const assignments = createAssignments(preferences);

  const availableProjects = Object.keys(projectsPoints);
  let remainingProjects = availableProjects;

  while (remainingProjects.length) {
    assignAProject({
      preferences,
      projectsPoints,
      assignments,
      remainingProjects,
    });
  }

  console.log("\n----------------- END -----------------\n\n\n");

  return assignments;
};
