# WorkConnect Project Guide

> This document defines the architecture, coding standards, design principles, and development workflow for the WorkConnect frontend. Every new feature should follow these guidelines.

---

# Project Overview

WorkConnect is a service marketplace that connects customers with skilled workers such as plumbers, electricians, cleaners, carpenters, mechanics, painters, and other professionals.

The application has three user roles:

- Customer
- Worker
- Admin

Each role has its own dashboard while sharing the same reusable design system and component library.

The frontend is intentionally built before backend integration.

The current goal is to create a fully functional frontend using mock data so that switching to the real Go backend later only requires replacing the service layer.

---

# Technology Stack

Frontend

- Next.js (App Router)
- JavaScript
- Tailwind CSS
- Yup Validation

Planned

- TanStack Query
- Zustand (already used for authentication)
- Go Backend (REST API)

---

# Core Development Philosophy

## 1. Finish one feature completely

Never partially build features.

Preferred order:

Authentication

↓

Customer

↓

Worker

↓

Admin

↓

Architecture

↓

Backend Integration

---

## 2. Work page-by-page

Finish one page completely before starting another.

Every page should become fully dynamic before moving on.

---

## 3. Frontend first

The frontend should behave like a real application before connecting a backend.

Pages should support:

- loading
- validation
- success states
- error states
- empty states
- realistic data

---

## 4. Never redesign pages during backend integration

Backend integration should replace the data source only.

UI should remain unchanged.

---

## 5. Avoid repeated refactoring

Before changing shared architecture, think carefully.

Prefer designing reusable solutions now instead of repeatedly modifying the same files.

---

## 6. Reusability first

If something can become reusable, make it reusable.

Avoid duplicate UI.

Avoid duplicate logic.

---

# Folder Structure

```
src/

app/
components/
features/
hooks/
lib/
mock/
providers/
services/
store/
validation/
```

---

## app/

Contains routing only.

Page files should be orchestration layers.

Avoid business logic.

---

## features/

Feature-specific components.

Each page owns its own feature folder.

Examples

```
worker-dashboard/

customer-profile/

worker-profile/
```

Business UI belongs here.

---

## components/

Reusable UI.

Examples

```
Button

Card

Badge

Avatar

StatCard

ProgressBar

TopNav
```

No page-specific logic.

---

## services/

This is the application's data layer.

Services are responsible for:

- reading data
- creating data
- updating data
- deleting data

Pages must never access localStorage.

Pages must never manipulate mock data directly.

Pages only communicate with services.

Current services:

```
auth.service.js

customer.service.js

worker.service.js

request.service.js

review.service.js

portfolio.service.js
```

When switching to the backend, only these files should change.

---

## storage.service.js

Acts as a tiny database engine.

Provides generic CRUD helpers.

```
findOne()

findMany()

insertOne()

updateOne()

deleteOne()
```

No page should call these directly.

Only services use storage.service.

---

## mock/

Contains the application's mock database.

Collections:

```
users

workerProfiles

requests

portfolio

reviews

professions
```

Collections should reference each other using IDs.

Example

```
workerProfile.userId

request.workerId

portfolio.workerId

review.workerId
```

---

## validation/

Contains Yup schemas only.

Validation should remain separate from UI.

Pattern

```
Schema

↓

validateSchema()

↓

errors

↓

UI
```

---

# Page Architecture

Pages should stay small.

Preferred structure

```
page.js

↓

feature components

↓

shared components
```

Avoid giant page files.

---

# Component Guidelines

A component should have one responsibility.

Good

```
WorkerHeader

PortfolioGrid

ReviewCard

RequestTimeline
```

Bad

```
WorkerPageEverything.jsx
```

---

# Business Logic

Business logic belongs inside services.

Examples

Good

```
createRequest()

acceptRequest()

completeRequest()

updateWorker()

searchWorkers()
```

Bad

```
Page manually edits database

Page filters database

Page changes request status
```

---

# Authentication

Uses Zustand.

Flow

```
Login Page

↓

authStore

↓

auth.service

↓

storage

↓

localStorage
```

Protected routes use RouteGuard.

Authentication is centralized.

---

# Mock Database Philosophy

The mock database should simulate a real backend.

Services should behave as if they are making API requests.

Network delay is intentionally simulated.

---

# Design System

Primary

```
#1A362D
```

Accent

```
#E8F5F1
```

Background

```
Gray 50

White Cards
```

Style

- modern
- clean
- minimal
- spacious
- soft shadows
- rounded corners

---

# UI Principles

Every page should support

Loading

Error

Empty

Success

Responsive layout

Consistent spacing

Consistent typography

---

# Request Lifecycle

Customer

↓

Create Request

↓

Pending

↓

Worker Accepts

↓

Accepted

↓

Worker Completes

↓

Completed

No page should manually change request status.

Always use request.service.

---

# Worker Profile Model

User information

```
fullName

email

phone

city

profileImage
```

Professional profile

```
primarySkill

skills

bio

experience

verified

availability

rating

totalReviews

completedJobs

responseRate

serviceAreas
```

Keep these separate.

---

# Services Rule

Every page should communicate like this

```
UI

↓

Service

↓

Storage

↓

Mock Database
```

Never

```
UI

↓

Mock Database
```

---

# Backend Migration

Current

```
Page

↓

Service

↓

storage.service

↓

Mock Database
```

Future

```
Page

↓

Service

↓

REST API

↓

Go Backend
```

Pages should not require rewriting.

Only services should change.

---

# Future Architecture

After the UI is completely dynamic

Introduce

```
TanStack Query

↓

Custom Hooks

↓

Backend Integration
```

Not before.

---

# Coding Standards

Use descriptive names.

Examples

```
getCurrentWorker()

updateCustomer()

createRequest()

getWorkerReviews()
```

Avoid abbreviations.

Keep functions focused.

One responsibility per function.

---

# Before Adding New Features

Ask:

1. Can this be reused?

2. Does this belong in a service?

3. Does this belong in a feature component?

4. Does this fit the existing architecture?

5. Will backend integration remain simple?

If the answer is no, redesign before coding.

---

# Long-Term Goal

The finished application should have:

- Reusable UI
- Reusable services
- Dynamic mock backend
- Clean separation of concerns
- Easy backend integration
- Minimal code duplication
- Professional project structure

The frontend should feel like a production application even while using localStorage as the temporary backend.
