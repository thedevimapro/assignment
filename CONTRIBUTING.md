<div align="center">

# 🚀 Contributing to Bulk Email Sender

### *Building something awesome together!*

[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)
[![Contributors](https://img.shields.io/badge/contributors-welcome-orange.svg?style=flat-square)](#)
[![Made with Love](https://img.shields.io/badge/Made%20with-❤️-red.svg?style=flat-square)](#)

---

**Thank you for your interest in contributing!** 🎉  
We believe great software is built by great communities.

</div>

---

## 📋 Table of Contents

- [🏁 Quick Start](#-quick-start)
- [🔀 Contribution Workflow](#-contribution-workflow)
- [📝 Pull Request Guidelines](#-pull-request-guidelines)
- [💻 Coding Standards](#-coding-standards)
- [💡 What to Contribute](#-what-to-contribute)
- [🆘 Getting Help](#-getting-help)
- [🤝 Code of Conduct](#-code-of-conduct)

---

## 🏁 Quick Start

<table>
<tr>
<td width="50%">

### 1️⃣ Fork & Clone

```bash
# Fork via GitHub UI, then:
git clone https://github.com/YOUR_USERNAME/bulk-email-sender.git
cd bulk-email-sender
```

</td>
<td width="50%">

### 2️⃣ Setup Environment

```bash
# Install dependencies
bun install

# Configure environment
cp .env.example .env
```

</td>
</tr>
</table>

---

## 🔀 Contribution Workflow

### Step 1: Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix-name
```

> 💡 **Branch Naming Convention:**
>
> | Prefix | Purpose | Example |
> |--------|---------|---------|
> | `feature/` | New features | `feature/add-smtp-provider` |
> | `fix/` | Bug fixes | `fix/email-validation-bug` |
> | `docs/` | Documentation | `docs/update-readme` |
> | `refactor/` | Code refactoring | `refactor/improve-batch-service` |

---

### Step 2: Make Your Changes

<details>
<summary>📌 <strong>Best Practices Checklist</strong></summary>

- ✅ Write clean, readable code
- ✅ Follow the existing code style
- ✅ Add comments for complex logic
- ✅ Keep commits focused and atomic
- ✅ Write meaningful commit messages

</details>

---

### Step 3: Commit with Style

```
type(scope): brief description

Detailed explanation if needed

Closes #issue_number
```

<details>
<summary>📦 <strong>Commit Types Reference</strong></summary>

| Type | Description |
|------|-------------|
| `feat` | ✨ New feature |
| `fix` | 🐛 Bug fix |
| `docs` | 📝 Documentation |
| `style` | 💅 Code style (formatting) |
| `refactor` | ♻️ Code refactoring |
| `test` | 🧪 Tests |
| `chore` | 🔧 Maintenance |

</details>

**Example:**
```
feat(emailService): add support for SendGrid provider

- Implement SendGrid API integration
- Add rate limiting for SendGrid
- Update configuration types

Closes #123
```

---

### Step 4: Test Your Changes

```bash
npm test
```

> ⚠️ **Before pushing:**
> - Run existing tests
> - Add new tests for new functionality
> - Manually test your changes
> - Ensure no regressions

---

### Step 5: Submit a Pull Request

```bash
git push origin feature/your-feature-name
```

Then head to GitHub and click **"New Pull Request"** 🎯

---

## 📝 Pull Request Guidelines

### ✅ Pre-Submit Checklist

```
┌─────────────────────────────────────────────────────────┐
│  □ Code follows the project's style guidelines          │
│  □ Self-review completed                                │
│  □ Comments added for complex code                      │
│  □ Documentation updated                                │
│  □ Tests added/updated                                  │
│  □ All tests pass                                       │
│  □ No new warnings or errors                            │
│  □ Branch is up to date with main                       │
└─────────────────────────────────────────────────────────┘
```

### 📋 PR Requirements

| Element | Description |
|---------|-------------|
| 🏷️ **Clear Title** | Summarize the change in one line |
| 📄 **Description** | Explain what, why, and how |
| 🔗 **Link Issues** | Reference related issues |
| 🧪 **Tests** | Demonstrate that changes work |
| 📚 **Documentation** | Update relevant docs |

### 🔄 Review Process

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Submit  │ → │  Review  │ → │  Approve │ → │  Merge!  │
│    PR    │    │ Feedback │    │    ✓     │    │   🎉     │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
```

---

## 💻 Coding Standards

### 🔷 TypeScript Guidelines

<table>
<tr>
<td>

**Do's ✅**
- Use TypeScript for all new code
- Define proper types
- Use interfaces for object shapes
- Export types from `types.ts`

</td>
<td>

**Don'ts ❌**
- Avoid using `any`
- Don't skip type definitions
- Don't use implicit any
- Avoid type assertions when possible

</td>
</tr>
</table>

### 🎨 Code Style

```
┌────────────────────────────────────────────────────────────┐
│  ▸ Use 2 spaces for indentation                            │
│  ▸ Use meaningful variable and function names              │
│  ▸ Keep functions small and focused                        │
│  ▸ Avoid deep nesting (max 3 levels)                       │
│  ▸ Use async/await over callbacks                          │
└────────────────────────────────────────────────────────────┘
```

### 📁 File Organization

```
src/
├── 📂 routes/       → Express route handlers
├── 📂 services/     → Business logic
├── 📂 middleware/   → Express middleware
└── 📄 types.ts      → Type definitions
```

---

## 💡 What to Contribute

### 🌟 Good First Issues

> Look for issues labeled `good first issue` or `help wanted`

### 🎯 Ideas for Contributions

<div align="center">

| Category | Description |
|:--------:|-------------|
| 🐛 | **Bug Fixes** - Squash those pesky bugs |
| ✨ | **New Features** - Discuss in an issue first |
| 📝 | **Documentation** - Improve clarity and coverage |
| 🧪 | **Test Coverage** - More tests = more confidence |
| 🎨 | **UI/UX** - Make it beautiful and intuitive |
| ⚡ | **Performance** - Speed things up |
| 🔒 | **Security** - Keep users safe |

</div>

### 🏗️ Major Changes

> **For significant changes:**
> 1. 💬 Open an issue first to discuss
> 2. ⏳ Wait for maintainer feedback
> 3. ✅ Ensure alignment with project goals

---

## 🆘 Getting Help

<div align="center">

| Resource | Action |
|----------|--------|
| 📖 | Check existing documentation |
| 🔍 | Search existing issues |
| 💬 | Open a new issue for questions |
| 📧 | Contact maintainers if needed |

</div>

---

## 🤝 Code of Conduct

<table>
<tr>
<td width="50%">

### ✨ Our Standards

- 🤗 Be respectful and inclusive
- 👋 Welcome newcomers
- 🎯 Accept constructive criticism
- 🌟 Focus on what's best for the project
- 💚 Show empathy towards others

</td>
<td width="50%">

### 🚫 Unacceptable Behavior

- ❌ Harassment or discriminatory language
- ❌ Personal or political attacks
- ❌ Trolling or insulting comments
- ❌ Publishing others' private information
- ❌ Unprofessional conduct

</td>
</tr>
</table>

---

## 📜 License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

<div align="center">

## 🏆 Recognition

### All contributors will be recognized in the project!

**Thank you for making this project better!** 

🎉 ⭐ 💖 🚀 ✨

---

<sub>Made with ❤️ by the community</sub>

</div>
