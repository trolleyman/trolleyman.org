# Welcome to React Router!

A modern, production-ready template for building full-stack React applications using React Router.

## Getting Started

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

## Building for Production

Create a production build:

```bash
npm run build
```

## Deployment

### Docker Deployment
```bash
docker build -t my-app .

# Run the container
docker run -p 3000:3000 my-app
```

### DIY Deployment
`npm run build` output:

```
├── package.json
├── package-lock.json (or pnpm-lock.yaml, or bun.lockb)
├── build/
│   ├── client/    # Static assets
│   └── server/    # Server-side code
```
