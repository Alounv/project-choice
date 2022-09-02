import { describe, it, expect } from "bun:test";
import { getAssignments } from "./getAssignments";

describe("getAssignments", () => {
  it("If no conflict of choices, no dev should be denied project", () => {
    const projectsPoints = { A: 2, B: 5, C: 3, D: 1 };

    const preferences = {
      Gary: ["A", "B", "C", "D"],
      Aurelie: ["B", "A", "C", "D"],
      Eddine: ["C", "B", "A", "D"],
      Aloun: ["D", "B", "C", "A"],
    };

    const { Gary, Aurelie, Eddine, Aloun } = getAssignments(
      projectsPoints,
      preferences
    );

    expect(Gary.projects.length).toBe(1);
    expect(Gary.projects[0]).toBe("A");
    expect(Gary.storyPoints).toBe(2);
    expect(Gary.denied).toBe(0);

    expect(Aurelie.projects.length).toBe(1);
    expect(Aurelie.projects[0]).toBe("B");
    expect(Aurelie.storyPoints).toBe(5);
    expect(Aurelie.denied).toBe(0);

    expect(Eddine.projects.length).toBe(1);
    expect(Eddine.projects[0]).toBe("C");
    expect(Eddine.storyPoints).toBe(3);
    expect(Eddine.denied).toBe(0);

    expect(Aloun.projects.length).toBe(1);
    expect(Aloun.projects[0]).toBe("D");
    expect(Aloun.storyPoints).toBe(1);
    expect(Aloun.denied).toBe(0);

    expect(
      Gary.storyPoints +
        Aurelie.storyPoints +
        Eddine.storyPoints +
        Aloun.storyPoints
    ).toBe(11);
  });

  it("Should always prioritize user with less storypoints", () => {
    const projectsPoints = { A: 2, B: 5, C: 3, D: 1 };

    const preferences = {
      Gary: ["B", "D", "A", "C"],
      Aurelie: ["D", "A", "C", "B"],
    };

    const { Gary, Aurelie } = getAssignments(projectsPoints, preferences);

    expect(Gary.denied + Aurelie.denied).toBe(0);
    expect(Gary.projects.length).toBe(1);
    expect(Gary.projects[0]).toBe("B");
    expect(Gary.storyPoints).toBe(5);

    expect(Aurelie.projects.length).toBe(3);
    expect(Aurelie.storyPoints).toBe(6);

    expect(Gary.storyPoints + Aurelie.storyPoints).toBe(11);
  });

  it("If there is one conflict of choices, one dev should be denied a project", () => {
    const projectsPoints = { A: 2, B: 5, C: 3, D: 1 };

    const preferences = {
      Gary: ["A", "B", "C", "D"],
      Aurelie: ["A", "D", "C", "B"],
    };

    const { Gary, Aurelie } = getAssignments(projectsPoints, preferences);

    expect(Gary.denied + Aurelie.denied).toBe(1);

    expect(Gary.storyPoints + Aurelie.storyPoints).toBe(11);
  });

  it("If all devs want the same projects there should be as many denied as (dev - 1) + (dev - 2) + ...", () => {
    const projectsPoints = { A: 2, B: 5, C: 3, D: 1, E: 3 };

    const preferences = {
      Gary: ["A", "B", "C", "D", "E"],
      Aurelie: ["A", "B", "C", "D", "E"],
      Eddine: ["A", "B", "C", "D", "E"],
      Aloun: ["A", "B", "C", "D", "E"],
      Unai: ["A", "B", "C", "D", "E"],
    };

    const { Gary, Aurelie, Eddine, Aloun, Unai } = getAssignments(
      projectsPoints,
      preferences
    );

    expect(Gary.projects.length).toBe(1);
    expect(Aurelie.projects.length).toBe(1);
    expect(Eddine.projects.length).toBe(1);
    expect(Aloun.projects.length).toBe(1);
    expect(Unai.projects.length).toBe(1);

    const totalDenied =
      Gary.denied + Aurelie.denied + Eddine.denied + Aloun.denied + Unai.denied;

    expect(totalDenied).toBe(4 + 3 + 2 + 1);

    const totalStoryPoints =
      Gary.storyPoints +
      Aurelie.storyPoints +
      Eddine.storyPoints +
      Aloun.storyPoints +
      Unai.storyPoints;

    expect(totalStoryPoints).toBe(2 + 5 + 3 + 1 + 3);
  });
});
