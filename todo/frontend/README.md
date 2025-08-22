# Todo List App – React + TypeScript + Vite + Sui Move

A modern Todo List web application built with **React**, **TypeScript**, and **Vite** for the frontend, and **Sui Move** smart contracts for secure, on-chain task management.

## Features

- Create and manage multiple todo lists
- Add, edit, and delete tasks within each list
- Responsive UI with Tailwind CSS
- Fast development with Vite
- Type-safe codebase using TypeScript
- On-chain storage and logic using Sui Move smart contracts

## Sui Move Smart Contract

This project includes a Sui Move module that manages todo lists and items on the Sui blockchain.  
The smart contract provides:
- Creation of new todo lists (as on-chain resources)
- Adding, updating, and removing todo items
- Secure and decentralized task management

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or newer)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Sui CLI](https://docs.sui.io/build/install) for deploying and testing Move contracts

### Installation

1. **Clone the repository:**
   ```sh
   git clone https://github.com/your-username/todo-list-app.git
   cd todo-list-app
````

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
