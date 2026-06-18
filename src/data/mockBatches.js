/**
 * mockBatches.js
 * Mock data for Batch entities.
 * Matches the Batch schema defined in Blueprint Section 8.2.
 * Status values align with src/constants/batchStatus.js
 *
 * Covers: ACTIVE, UPCOMING, COMPLETED, ON_HOLD statuses
 * IDs: b1–b10 (sequential, unique)
 */

import { BATCH_STATUS } from '../constants/batchStatus';

export const mockBatches = [
  // ─── COMPLETED BATCHES ────────────────────────────────────────────────────
  {
    id: 'b1',
    batchCode: 'NM-REACT-2025-01',
    batchName: 'React Development Bootcamp – Jan 2025',
    trainerId: 'u3',
    trainerName: 'Trainer One',
    startDate: '2025-01-06',
    endDate: '2025-03-28',
    status: BATCH_STATUS.COMPLETED,
    maxStudents: 30,
    currentStudentCount: 28,
    description:
      'Intensive React JSX training covering components, hooks, context, and routing. Students build a portfolio project by the end of the program.',
    createdAt: '2024-12-20T09:00:00Z',
    updatedAt: '2025-03-28T18:00:00Z',
  },
  {
    id: 'b2',
    batchCode: 'NM-JAVA-2025-01',
    batchName: 'Full Stack Java Training – Feb 2025',
    trainerId: 'u3',
    trainerName: 'Trainer One',
    startDate: '2025-02-03',
    endDate: '2025-04-25',
    status: BATCH_STATUS.COMPLETED,
    maxStudents: 25,
    currentStudentCount: 24,
    description:
      'Full stack Java development covering Spring Boot, REST APIs, JPA/Hibernate, and MySQL database integration.',
    createdAt: '2025-01-10T09:00:00Z',
    updatedAt: '2025-04-25T18:00:00Z',
  },
  {
    id: 'b3',
    batchCode: 'NM-PY-2025-01',
    batchName: 'Python Programming Fundamentals – Mar 2025',
    trainerId: 'u2',
    trainerName: 'Training Manager',
    startDate: '2025-03-03',
    endDate: '2025-05-23',
    status: BATCH_STATUS.COMPLETED,
    maxStudents: 30,
    currentStudentCount: 30,
    description:
      'Python programming from basics to OOP, data structures, file handling, and introductory data analysis with pandas.',
    createdAt: '2025-02-15T09:00:00Z',
    updatedAt: '2025-05-23T18:00:00Z',
  },

  // ─── ACTIVE BATCHES ───────────────────────────────────────────────────────
  {
    id: 'b4',
    batchCode: 'NM-REACT-2026-01',
    batchName: 'React Development Bootcamp – Apr 2026',
    trainerId: 'u3',
    trainerName: 'Trainer One',
    startDate: '2026-04-07',
    endDate: '2026-06-27',
    status: BATCH_STATUS.ACTIVE,
    maxStudents: 30,
    currentStudentCount: 27,
    description:
      'Second cohort of the React JSX bootcamp. Covers advanced patterns including custom hooks, lazy loading, and performance optimization.',
    createdAt: '2026-03-20T09:00:00Z',
    updatedAt: '2026-06-10T10:00:00Z',
  },
  {
    id: 'b5',
    batchCode: 'NM-DA-2026-01',
    batchName: 'Data Analytics with Python – May 2026',
    trainerId: 'u2',
    trainerName: 'Training Manager',
    startDate: '2026-05-05',
    endDate: '2026-07-25',
    status: BATCH_STATUS.ACTIVE,
    maxStudents: 25,
    currentStudentCount: 22,
    description:
      'Applied data analytics covering pandas, NumPy, matplotlib, seaborn, and an introduction to machine learning with scikit-learn.',
    createdAt: '2026-04-18T09:00:00Z',
    updatedAt: '2026-06-10T10:00:00Z',
  },
  {
    id: 'b6',
    batchCode: 'NM-CLOUD-2026-01',
    batchName: 'Cloud Fundamentals – AWS & Azure – May 2026',
    trainerId: 'u3',
    trainerName: 'Trainer One',
    startDate: '2026-05-12',
    endDate: '2026-07-31',
    status: BATCH_STATUS.ACTIVE,
    maxStudents: 20,
    currentStudentCount: 18,
    description:
      'Cloud computing fundamentals covering core services on AWS and Azure: compute, storage, networking, IAM, and basic deployment pipelines.',
    createdAt: '2026-04-25T09:00:00Z',
    updatedAt: '2026-06-10T10:00:00Z',
  },

  // ─── ON HOLD BATCH ────────────────────────────────────────────────────────
  {
    id: 'b7',
    batchCode: 'NM-UIUX-2026-01',
    batchName: 'UI/UX Design Fundamentals – Apr 2026',
    trainerId: 'u2',
    trainerName: 'Training Manager',
    startDate: '2026-04-14',
    endDate: '2026-06-30',
    status: BATCH_STATUS.ON_HOLD,
    maxStudents: 20,
    currentStudentCount: 14,
    description:
      'User interface and experience design covering Figma, design systems, wireframing, prototyping, and usability testing methodologies.',
    createdAt: '2026-03-28T09:00:00Z',
    updatedAt: '2026-05-01T14:00:00Z',
  },

  // ─── UPCOMING BATCHES ─────────────────────────────────────────────────────
  {
    id: 'b8',
    batchCode: 'NM-JAVA-2026-02',
    batchName: 'Full Stack Java Training – Jul 2026',
    trainerId: 'u3',
    trainerName: 'Trainer One',
    startDate: '2026-07-07',
    endDate: '2026-09-25',
    status: BATCH_STATUS.UPCOMING,
    maxStudents: 30,
    currentStudentCount: 0,
    description:
      'Second cohort of the Full Stack Java program with updated Spring Boot 3.x curriculum and microservices introduction.',
    createdAt: '2026-06-01T09:00:00Z',
    updatedAt: '2026-06-01T09:00:00Z',
  },
  {
    id: 'b9',
    batchCode: 'NM-PY-2026-02',
    batchName: 'Python for Data Science – Aug 2026',
    trainerId: 'u2',
    trainerName: 'Training Manager',
    startDate: '2026-08-03',
    endDate: '2026-10-23',
    status: BATCH_STATUS.UPCOMING,
    maxStudents: 25,
    currentStudentCount: 0,
    description:
      'Advanced Python batch focused on data science workflows: data wrangling, visualization, statistical analysis, and ML model building.',
    createdAt: '2026-06-05T09:00:00Z',
    updatedAt: '2026-06-05T09:00:00Z',
  },
  {
    id: 'b10',
    batchCode: 'NM-CLOUD-2026-02',
    batchName: 'DevOps & Cloud Engineering – Sep 2026',
    trainerId: 'u3',
    trainerName: 'Trainer One',
    startDate: '2026-09-01',
    endDate: '2026-11-20',
    status: BATCH_STATUS.UPCOMING,
    maxStudents: 20,
    currentStudentCount: 0,
    description:
      'DevOps engineering track covering Docker, Kubernetes, CI/CD pipelines, Terraform, and cloud-native deployment on AWS.',
    createdAt: '2026-06-08T09:00:00Z',
    updatedAt: '2026-06-08T09:00:00Z',
  },
];
