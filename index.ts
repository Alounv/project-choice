import { getAssignments, Preferences, ProjectPoints } from './getAssignments'

const projectsPoints: ProjectPoints = {
  '28.01. Import of translated content': 8,
  '28.02. Add a SCORM modules to a publication diffused in Didask Platform': 5,
  '28.03. Save completion analytics for Imported SCORM module': 5,
  '28.04. Publication without showing progression': 3,
  '28.05. Show expired publications in learner homepage + publish modal warning': 3,
  '28.06. Correct group access control (publications and programs) + expirations': 3,
  '28.07. Update module introduction page for courses': 3,
  '28.08. Update final pages for elearning courses': 3
}

const preferences: Preferences = {
  Aurelie: [
    '28.01. Import of translated content',
    '28.07. Update module introduction page for courses',
    '28.08. Update final pages for elearning courses',
    '28.04. Publication without showing progression',
    '28.05. Show expired publications in learner homepage + publish modal warning',
    '28.06. Correct group access control (publications and programs) + expirations',
    '28.02. Add a SCORM modules to a publication diffused in Didask Platform',
    '28.03. Save completion analytics for Imported SCORM module'
  ],
  Eddine: [
    '28.07. Update module introduction page for courses',
    '28.08. Update final pages for elearning courses',
    '28.06. Correct group access control (publications and programs) + expirations',
    '28.04. Publication without showing progression',
    '28.05. Show expired publications in learner homepage + publish modal warning',
    '28.02. Add a SCORM modules to a publication diffused in Didask Platform',
    '28.03. Save completion analytics for Imported SCORM module',
    '28.01. Import of translated content'
  ],
  Aloun: [
    '28.02. Add a SCORM modules to a publication diffused in Didask Platform',
    '28.03. Save completion analytics for Imported SCORM module',
    '28.06. Correct group access control (publications and programs) + expirations',
    '28.04. Publication without showing progression',
    '28.05. Show expired publications in learner homepage + publish modal warning',
    '28.07. Update module introduction page for courses',
    '28.08. Update final pages for elearning courses',
    '28.01. Import of translated content'
  ]
}

const results = getAssignments(projectsPoints, preferences)

for (const name in results) {
  console.log(name, results[name])
}
