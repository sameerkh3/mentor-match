/**
 * Seed script — populates the database with demo data.
 * Idempotent: deletes existing seed users before re-creating them.
 *
 * Run with:  node server/seed.js
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import User from './models/User.js';

// Load .env from the server directory
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '.env') });

const SEED_EMAILS = [
  'admin@mentormatch.com',
  'alice@company.com',
  'bob@company.com',
  'carol@company.com',
  'david.chen@company.com',
  'sarah.kim@company.com',
  'marcus.reed@company.com',
  'priya.patel@company.com',
  'james.wu@company.com',
  'nina.okafor@company.com',
  'ethan.brooks@company.com',
  'leila.hassan@company.com',
];

const MENTORS = [
  {
    name: 'David Chen',
    email: 'david.chen@company.com',
    title: 'Principal Engineer',
    department: 'Engineering',
    bio: 'I have spent 15 years building distributed systems at scale. I love helping engineers level up their architecture thinking and navigate complex technical trade-offs.',
    skills: ['System Design', 'Java', 'Distributed Systems', 'Microservices', 'AWS'],
    yearsOfExperience: 15,
    availability: 'Wednesdays 3–5pm, Friday mornings',
    ratingsTotal: 42,
    ratingsCount: 9,
  },
  {
    name: 'Sarah Kim',
    email: 'sarah.kim@company.com',
    title: 'Senior Product Manager',
    department: 'Product',
    bio: 'Product manager with 8 years of experience shipping consumer and B2B products. I focus on discovery frameworks, roadmap prioritization, and bridging the gap between engineering and business.',
    skills: ['Product Strategy', 'Roadmapping', 'User Research', 'A/B Testing', 'OKRs'],
    yearsOfExperience: 8,
    availability: 'Tuesdays 10am–12pm',
    ratingsTotal: 28,
    ratingsCount: 7,
  },
  {
    name: 'Marcus Reed',
    email: 'marcus.reed@company.com',
    title: 'Lead Frontend Engineer',
    department: 'Engineering',
    bio: 'Frontend specialist with deep expertise in React, performance optimization, and accessibility. I enjoy pair programming and helping engineers write clean, maintainable UI code.',
    skills: ['React', 'JavaScript', 'TypeScript', 'CSS', 'Web Performance'],
    yearsOfExperience: 10,
    availability: 'Monday & Thursday evenings',
    ratingsTotal: 35,
    ratingsCount: 8,
  },
  {
    name: 'Priya Patel',
    email: 'priya.patel@company.com',
    title: 'Staff Data Scientist',
    department: 'Data',
    bio: 'Data scientist specializing in NLP and recommendation systems. I can help you go from raw data to production ML pipelines, and demystify statistics along the way.',
    skills: ['Python', 'Machine Learning', 'NLP', 'Data Science', 'SQL', 'TensorFlow'],
    yearsOfExperience: 7,
    availability: 'Fridays 1–3pm',
    ratingsTotal: 22,
    ratingsCount: 5,
  },
  {
    name: 'James Wu',
    email: 'james.wu@company.com',
    title: 'QA Engineering Manager',
    department: 'QA',
    bio: 'I have built QA teams and test automation frameworks from scratch at three companies. Passionate about shift-left testing, CI/CD integration, and mentoring QA engineers into leadership roles.',
    skills: ['SQA', 'Test Automation', 'Selenium', 'Cypress', 'CI/CD', 'Leadership'],
    yearsOfExperience: 12,
    availability: 'Weekday mornings 9–10am',
    ratingsTotal: 18,
    ratingsCount: 4,
  },
  {
    name: 'Nina Okafor',
    email: 'nina.okafor@company.com',
    title: 'UX Design Lead',
    department: 'Design',
    bio: 'Design lead with a background in cognitive psychology. I help teams build products that people actually love using — covering everything from user research to high-fidelity prototyping.',
    skills: ['UX Design', 'Figma', 'User Research', 'Prototyping', 'Design Systems'],
    yearsOfExperience: 9,
    availability: 'Tuesday & Thursday afternoons',
    ratingsTotal: 30,
    ratingsCount: 6,
  },
  {
    name: 'Ethan Brooks',
    email: 'ethan.brooks@company.com',
    title: 'VP of Engineering',
    department: 'Leadership',
    bio: 'I have led engineering organizations of 5 to 150 people. My focus is on engineering culture, career development, and building systems that scale — both technical and human.',
    skills: ['Engineering Leadership', 'Career Development', 'Hiring', 'Agile', 'Strategy'],
    yearsOfExperience: 20,
    availability: 'Bi-weekly Thursday slots at 4pm',
    ratingsTotal: 50,
    ratingsCount: 10,
  },
  {
    name: 'Leila Hassan',
    email: 'leila.hassan@company.com',
    title: 'Senior Backend Engineer',
    department: 'Engineering',
    bio: 'Backend engineer with expertise in Node.js, Go, and cloud-native architectures. I love helping engineers write reliable, observable services and understand the trade-offs in API design.',
    skills: ['Node.js', 'Go', 'REST APIs', 'PostgreSQL', 'Docker', 'Kubernetes'],
    yearsOfExperience: 6,
    availability: 'Mondays 2–4pm, Wednesdays 10–11am',
    ratingsTotal: 16,
    ratingsCount: 4,
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Remove existing seed users to ensure idempotency
    const deleted = await User.deleteMany({ email: { $in: SEED_EMAILS } });
    console.log(`Removed ${deleted.deletedCount} existing seed users`);

    const password = await bcrypt.hash('password123', 10);

    // Admin
    await User.create({
      name: 'Admin User',
      email: 'admin@mentormatch.com',
      passwordHash: password,
      role: 'admin',
      isActive: true,
    });

    // Mentees
    await User.insertMany([
      { name: 'Alice Johnson', email: 'alice@company.com', passwordHash: password, role: 'mentee', isActive: true },
      { name: 'Bob Martinez', email: 'bob@company.com', passwordHash: password, role: 'mentee', isActive: true },
      { name: 'Carol White', email: 'carol@company.com', passwordHash: password, role: 'mentee', isActive: true },
    ]);

    // Mentors
    const mentorDocs = MENTORS.map((m) => ({
      ...m,
      passwordHash: password,
      role: 'mentor',
      isActive: true,
    }));
    await User.insertMany(mentorDocs);

    console.log('Seed complete:');
    console.log('  1 admin  — admin@mentormatch.com / password123');
    console.log('  3 mentees — alice, bob, carol @company.com / password123');
    console.log('  8 mentors — see SEED_EMAILS list / password123');
  } catch (err) {
    console.error('Seed error:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
